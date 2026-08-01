// POST /api/cron/weekly-digest
//
// Batches every eligible user and sends them a personalized Monday digest.
// Triggered by GitHub Actions on a weekly cron. Protected by CRON_SECRET.
//
// Required Cloudflare Pages env vars:
//   CRON_SECRET                    — random shared secret (also set in GH Actions)
//   VITE_SUPABASE_URL              — already used elsewhere
//   SUPABASE_SERVICE_ROLE_KEY      — needed to bypass RLS on server-side batch reads
//   EMAIL_FROM                     — e.g. hello@cloudcanvas.co (SPF/DKIM required)
//   EMAIL_FROM_NAME                — display name for sender (optional)
//   RESEND_API_KEY                 — optional, preferred provider
//   UNSUBSCRIBE_SECRET             — random secret for signing unsubscribe tokens
//
// Body (optional, for manual test runs):
//   { "email": "someone@x.com", "dryRun": true }

import { sendEmail, makeUnsubscribeToken } from '../../_shared/emailDelivery.js';
import { buildDigestEmail } from '../../_shared/digestTemplate.js';

const APP_URL = 'https://cloudcanvas.co';

// Auth guard — only the cron caller (or the test caller with the same secret) may hit this.
function authorised(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  return env.CRON_SECRET && token === env.CRON_SECRET;
}

async function supabase(env, path, opts = {}) {
  const url = `${env.VITE_SUPABASE_URL}${path}`;
  const resp = await fetch(url, {
    ...opts,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`Supabase ${resp.status}: ${txt}`);
  }
  return resp.json();
}

async function fetchEligibleUsers(env, singleEmail) {
  // Only users whose email_preferences.weekly_digest is not explicitly false
  // AND who have logged in at least once (excludes signup-only bots).
  const filter = singleEmail
    ? `email=eq.${encodeURIComponent(singleEmail)}`
    : `and=(is_active.eq.true,login_count.gte.1)&or=(email_preferences.is.null,email_preferences->>weekly_digest.not.eq.false)`;
  const rows = await supabase(
    env,
    `/rest/v1/profiles?select=id,email,name,login_count,last_login,total_exports,validations_run,diagrams_created,tf_exports,templates_used,email_preferences,created_at&${filter}&limit=1000`
  );
  return rows || [];
}

async function fetchRecentDiagrams(env, userId) {
  try {
    return await supabase(
      env,
      `/rest/v1/diagrams?select=name,item_count,updated_at&user_id=eq.${encodeURIComponent(userId)}&order=updated_at.desc&limit=5`
    );
  } catch {
    return [];
  }
}

async function fetchLoginStreak(env, userId) {
  try {
    const from = new Date(Date.now() - 60 * 86_400_000).toISOString();
    const rows = await supabase(
      env,
      `/rest/v1/audit_logs?select=created_at&user_id=eq.${encodeURIComponent(userId)}&event=eq.LOGIN&created_at=gte.${from}&order=created_at.desc&limit=200`
    );
    return computeStreak((rows || []).map((r) => r.created_at));
  } catch {
    return 0;
  }
}

function computeStreak(loginIsoDates) {
  if (!loginIsoDates || loginIsoDates.length === 0) return 0;
  const dayKeys = new Set(loginIsoDates.map((iso) => new Date(iso).toDateString()));
  const c = new Date();
  const todayKey = c.toDateString();
  c.setDate(c.getDate() - 1);
  const yesterdayKey = c.toDateString();
  if (!dayKeys.has(todayKey) && !dayKeys.has(yesterdayKey)) return 0;
  const start = new Date();
  if (!dayKeys.has(todayKey)) start.setDate(start.getDate() - 1);
  const cursor = new Date(start);
  let streak = 0;
  while (dayKeys.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Blog articles are frontend-only — server just picks 3 recent slugs from a
// static list. Keep in sync with src/utils/blogArticles.js top additions.
const CURATED_ARTICLES = [
  {
    slug: 'cloud-canvas-designer-sop',
    title: 'How to Use Cloud Canvas Designer: The Complete SOP',
    excerpt: 'Design, validate, and ship an Azure architecture end to end.',
    category: 'Product Guide',
    icon: '📘',
    readTime: '16 min',
  },
  {
    slug: 'reverse-engineering-azure-estate',
    title: 'Reverse-Engineering an Azure Estate: From Chaos to Diagram in a Day',
    excerpt: 'Turn a mystery subscription into an accurate diagram in one day.',
    category: 'Architecture',
    icon: '🗺️',
    readTime: '14 min',
  },
  {
    slug: 'blast-radius-analysis-azure',
    title: 'Blast Radius Analysis on Azure',
    excerpt: 'Predict what breaks when one thing fails — turn any diagram into a failure-domain map.',
    category: 'Architecture',
    icon: '💥',
    readTime: '12 min',
  },
  {
    slug: 'azure-resource-graph-20-queries',
    title: 'Azure Resource Graph: 20 Queries That Save Hours',
    excerpt: 'Copy-paste queries organized by real problems — inventory, cost, security.',
    category: 'Observability',
    icon: '📊',
    readTime: '13 min',
  },
];

function pickSuggestedNextStep(profile, diagrams) {
  if ((profile.diagrams_created || 0) === 0 && (diagrams?.length || 0) === 0) {
    return {
      icon: '🎨',
      title: 'Design your first diagram',
      body: 'A blank canvas is one click away. Or start from a template.',
    };
  }
  if ((profile.validations_run || 0) === 0 && (diagrams?.length || 0) > 0) {
    return {
      icon: '🏛️',
      title: 'Validate against the WAF',
      body: 'Get a score on the 5 pillars — Reliability, Security, Cost, Ops, Performance.',
    };
  }
  if ((profile.tf_exports || 0) === 0 && (diagrams?.length || 0) > 0) {
    return {
      icon: '🔧',
      title: 'Export a diagram to Terraform',
      body: 'One click turns your diagram into deployable IaC.',
    };
  }
  if ((profile.templates_used || 0) === 0) {
    return {
      icon: '📚',
      title: 'Try a reference template',
      body: 'Hub-spoke, AKS, DR, RAG — 50+ patterns are ready to load.',
    };
  }
  return null;
}

async function sendDigestFor(user, env) {
  const [diagrams, streak] = await Promise.all([
    fetchRecentDiagrams(env, user.id),
    fetchLoginStreak(env, user.id),
  ]);

  const unsubToken = await makeUnsubscribeToken(user.email, env.UNSUBSCRIBE_SECRET || env.CRON_SECRET);
  const unsubscribeUrl = `${APP_URL}/api/email-unsubscribe?token=${encodeURIComponent(unsubToken)}`;

  const { subject, html, text } = buildDigestEmail({
    userName: user.name,
    userEmail: user.email,
    diagramCount: diagrams?.length || 0,
    totalExports: user.total_exports || 0,
    validationsRun: user.validations_run || 0,
    loginStreak: streak,
    recentDiagrams: (diagrams || []).map((d) => ({
      name: d.name,
      updatedAt: d.updated_at,
      itemCount: d.item_count || 0,
    })),
    articles: CURATED_ARTICLES.slice(0, 3),
    unsubscribeUrl,
    appUrl: APP_URL,
    nextStep: pickSuggestedNextStep(user, diagrams),
  });

  return { subject, html, text };
}

export const onRequestPost = async ({ request, env }) => {
  if (!authorised(request, env)) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    /* body is optional */
  }
  const { email: singleEmail, dryRun } = body;

  const summary = { sent: 0, skipped: 0, failed: 0, errors: [], attempted: 0 };

  try {
    const users = await fetchEligibleUsers(env, singleEmail);
    summary.attempted = users.length;

    for (const user of users) {
      // Respect explicit opt-out
      const prefs = user.email_preferences || {};
      if (prefs.weekly_digest === false) {
        summary.skipped += 1;
        continue;
      }
      if (!user.email) {
        summary.skipped += 1;
        continue;
      }

      try {
        const digest = await sendDigestFor(user, env);
        if (dryRun) {
          summary.sent += 1;
          summary.errors.push({ email: user.email, subject: digest.subject, dryRun: true });
          continue;
        }
        const result = await sendEmail({
          to: user.email,
          subject: digest.subject,
          html: digest.html,
          text: digest.text,
          env,
        });
        if (result.ok) {
          summary.sent += 1;
        } else {
          summary.failed += 1;
          summary.errors.push({ email: user.email, error: result.error });
        }
      } catch (err) {
        summary.failed += 1;
        summary.errors.push({ email: user.email, error: err.message });
      }
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message, summary }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify({ ok: true, summary }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// GET returns non-secret runtime health info — useful for debugging cron wiring.
export const onRequestGet = async ({ env }) => {
  return new Response(
    JSON.stringify({
      ok: true,
      configured: {
        cron_secret: !!env.CRON_SECRET,
        supabase_url: !!env.VITE_SUPABASE_URL,
        service_role_key: !!env.SUPABASE_SERVICE_ROLE_KEY,
        email_from: !!env.EMAIL_FROM,
        resend_api_key: !!env.RESEND_API_KEY,
        unsubscribe_secret: !!(env.UNSUBSCRIBE_SECRET || env.CRON_SECRET),
      },
      time: new Date().toISOString(),
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
