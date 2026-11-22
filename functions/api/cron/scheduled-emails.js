// POST /api/cron/scheduled-emails
//
// Hourly tick that reads every enabled row from public.email_schedules,
// decides which are due (via the pure helpers in ../../_shared/cadence.js),
// renders each row's markdown template per-recipient, and dispatches the
// resulting emails through Resend.
//
// Required Cloudflare Pages env vars:
//   CRON_SECRET                    — random shared secret (also set in GH Actions)
//   VITE_SUPABASE_URL              — already used elsewhere
//   SUPABASE_SERVICE_ROLE_KEY      — needed to bypass RLS on server-side batch reads
//   EMAIL_FROM                     — e.g. hello@cloudcanvas.co (SPF/DKIM required)
//   EMAIL_FROM_NAME                — display name for sender (optional)
//   RESEND_API_KEY                 — required (only supported provider)
//   UNSUBSCRIBE_SECRET             — random secret for signing unsubscribe tokens
//
// Body (optional):
//   { "dryRun": true, "email": "override@x.com", "kind": "weekly_digest",
//     "ignoreDue": true }
//
// Flags:
//   - dryRun      : render, log, but skip Resend send
//   - email       : limit audience to a single address (for test runs)
//   - kind        : limit to a single schedule row (used by the legacy
//                   weekly-digest wrapper and by admin-run-schedule)
//   - ignoreDue   : bypass cadence/enabled checks (used by the admin
//                   "Run now" button; still requires CRON_SECRET auth)

import { sendEmail, logEmailSend, makeUnsubscribeToken } from '../../_shared/emailDelivery.js';
import { renderBroadcastMarkdown, buildBroadcastEmail } from '../../_shared/broadcastTemplate.js';
import { renderTemplate, buildRecipientContext } from '../../_shared/templateRender.js';
import { isDue } from '../../_shared/cadence.js';

const APP_URL = 'https://cloudcanvas.co';

// Fallback article when the blog table is unreachable. Mirrors a few of the
// evergreen entries used by CURATED_ARTICLES in the legacy digest.
const FALLBACK_ARTICLE = {
  slug: 'cloud-canvas-designer-sop',
  title: 'How to Use Cloud Canvas Designer: The Complete SOP',
};

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

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
    throw new Error(`Supabase ${resp.status}: ${txt.slice(0, 300)}`);
  }
  return resp.json();
}

async function supabaseSafe(env, path, opts = {}) {
  try {
    return await supabase(env, path, opts);
  } catch {
    return null;
  }
}

async function loadSchedules(env, kind) {
  const filter = kind
    ? `kind=eq.${encodeURIComponent(kind)}`
    : `order=kind.asc`;
  return supabase(env, `/rest/v1/email_schedules?select=*&${filter}`);
}

async function updateScheduleStatus(env, id, patch) {
  try {
    const resp = await fetch(
      `${env.VITE_SUPABASE_URL}/rest/v1/email_schedules?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(patch),
      }
    );
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      console.error('[scheduled-emails] updateScheduleStatus non-2xx:', resp.status, txt);
    }
  } catch (err) {
    console.error('[scheduled-emails] updateScheduleStatus exception:', err.message);
  }
}

/**
 * Each schedule `kind` maps to a function that produces the recipient list.
 * Today only `weekly_digest` is defined; add new kinds here as needed.
 */
async function loadRecipientsForKind(env, kind, singleEmail) {
  if (kind === 'weekly_digest') {
    const filter = singleEmail
      ? `email=eq.${encodeURIComponent(singleEmail)}`
      : `and=(is_active.eq.true,login_count.gte.1)&or=(email_preferences.is.null,email_preferences->>weekly_digest.not.eq.false)`;
    const rows = await supabase(
      env,
      `/rest/v1/profiles?select=id,email,name,login_count,last_login,last_active_at,created_at,email_preferences&${filter}&limit=5000`
    );
    return (rows || []).filter((r) => r?.email);
  }
  // Unknown kind → no recipients. Handler records `empty_audience`.
  return [];
}

async function recentDiagramsCount(env, userId) {
  try {
    const rows = await supabase(
      env,
      `/rest/v1/diagrams?select=id&user_id=eq.${encodeURIComponent(userId)}&limit=50`
    );
    return Array.isArray(rows) ? rows.length : 0;
  } catch {
    return 0;
  }
}

async function suggestedArticleFor(env) {
  // Latest published blog post, or fallback.
  const rows = await supabaseSafe(
    env,
    `/rest/v1/blog_posts?select=slug,title,status,published_at&status=eq.published&order=published_at.desc&limit=1`
  );
  if (Array.isArray(rows) && rows.length > 0) {
    return { title: rows[0].title, slug: rows[0].slug };
  }
  return FALLBACK_ARTICLE;
}

/**
 * Render one schedule row for one recipient. Returns the inputs `sendEmail`
 * needs: { subject, html, text }.
 */
function renderScheduledEmail({ schedule, context, appUrl }) {
  const subject = renderTemplate(schedule.subject_template, context) || schedule.subject_template;
  const bodyMd = renderTemplate(schedule.body_template, context);
  const bodyHtml = renderBroadcastMarkdown(bodyMd);
  const { html, text } = buildBroadcastEmail({
    subject,
    bodyHtml,
    unsubscribeUrl: context.unsubscribe_url,
    appUrl,
  });
  return { subject, html, text };
}

async function dispatchSchedule({ env, schedule, singleEmail, dryRun }) {
  const kind = schedule.kind;
  const result = { kind, sent: 0, failed: 0, skipped: 0, attempted: 0, errors: [] };

  const recipients = await loadRecipientsForKind(env, kind, singleEmail);
  result.attempted = recipients.length;

  if (recipients.length === 0) {
    return { ...result, status: 'empty_audience' };
  }

  const unsubSecret = env.UNSUBSCRIBE_SECRET || env.CRON_SECRET;
  const suggested = await suggestedArticleFor(env);
  const kindToLog = kind === 'weekly_digest' ? 'digest' : 'broadcast';

  for (const profile of recipients) {
    const prefs = profile.email_preferences || {};
    // Belt-and-braces opt-out check (the main query already filters this,
    // but a per-email override would still land here).
    if (kind === 'weekly_digest' && prefs.weekly_digest === false) {
      result.skipped += 1;
      continue;
    }

    try {
      const unsubToken = unsubSecret
        ? await makeUnsubscribeToken(profile.email, unsubSecret)
        : '';
      const unsubscribeUrl = unsubSecret
        ? `${APP_URL}/api/email-unsubscribe?token=${encodeURIComponent(unsubToken)}`
        : `${APP_URL}/home`;

      const diagramCount = await recentDiagramsCount(env, profile.id);
      const context = buildRecipientContext({
        profile,
        recentDiagramsCount: diagramCount,
        suggestedArticle: suggested,
        unsubscribeUrl,
        appUrl: APP_URL,
      });

      const { subject, html, text } = renderScheduledEmail({
        schedule,
        context,
        appUrl: APP_URL,
      });

      if (dryRun) {
        result.sent += 1;
        result.errors.push({ email: profile.email, subject, dryRun: true });
        continue;
      }

      const sendResult = await sendEmail({
        to: profile.email,
        subject,
        html,
        text,
        env,
      });
      await logEmailSend(env, {
        to: profile.email,
        kind: kindToLog,
        broadcast_id: null,
        result: sendResult,
      });
      if (sendResult.ok) {
        result.sent += 1;
      } else {
        result.failed += 1;
        if (result.errors.length < 25) {
          result.errors.push({ email: profile.email, error: sendResult.error });
        }
      }
    } catch (err) {
      result.failed += 1;
      if (result.errors.length < 25) {
        result.errors.push({ email: profile.email, error: err.message });
      }
      await logEmailSend(env, {
        to: profile.email,
        kind: kindToLog,
        broadcast_id: null,
        result: { ok: false, status: 0, error: err.message },
      });
    }
  }

  const attemptedReal = result.attempted - result.skipped;
  const allFailed = attemptedReal > 0 && result.sent === 0;
  const status = allFailed ? 'failed' : 'sent';
  return { ...result, status };
}

/**
 * Entry point used by this file's POST handler AND by the legacy
 * weekly-digest wrapper. Kept here so there's one source of truth for the
 * dispatch loop and status updates.
 */
export async function runScheduledEmails({
  env,
  kind,
  singleEmail,
  dryRun,
  ignoreDue,
  ignoreEnabled,
}) {
  const summary = { ran: 0, skipped: 0, results: [] };

  if (!env?.SUPABASE_SERVICE_ROLE_KEY || !env?.VITE_SUPABASE_URL) {
    throw new Error('supabase_env_not_configured');
  }

  const schedules = await loadSchedules(env, kind);
  if (!Array.isArray(schedules) || schedules.length === 0) {
    return { ok: true, summary };
  }

  const now = new Date();

  for (const schedule of schedules) {
    // `enabled` is honoured unless the caller explicitly opts out (admin
    // "Run now" with force=true). The hourly cron and the legacy wrapper
    // both stop sending the moment an admin flips the toggle in the UI.
    if (!schedule.enabled && !ignoreEnabled) {
      summary.skipped += 1;
      summary.results.push({ kind: schedule.kind, status: 'disabled' });
      continue;
    }
    if (!ignoreDue && !isDue(schedule, now)) {
      summary.skipped += 1;
      summary.results.push({ kind: schedule.kind, status: 'not_due' });
      continue;
    }

    const dispatchResult = await dispatchSchedule({
      env,
      schedule,
      singleEmail,
      dryRun,
    });

    summary.ran += 1;
    summary.results.push(dispatchResult);

    // Record last_run_at (only on real sends, not dry runs or ignoreDue
    // probes — avoid distorting the production cadence from debug calls).
    if (!dryRun) {
      await updateScheduleStatus(env, schedule.id, {
        last_run_at: new Date().toISOString(),
        last_run_status: dispatchResult.status,
        last_run_count: dispatchResult.sent,
      });
    }
  }

  return { ok: true, summary };
}

export const onRequestPost = async ({ request, env }) => {
  if (!authorised(request, env)) {
    return jsonResponse(401, { error: 'unauthorized' });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    /* body is optional */
  }
  const { email: singleEmail, dryRun, kind, ignoreDue } = body || {};

  try {
    const result = await runScheduledEmails({
      env,
      kind: kind || null,
      singleEmail: singleEmail || null,
      dryRun: !!dryRun,
      ignoreDue: !!ignoreDue,
      ignoreEnabled: false,
    });
    // Consider the response failing if we ran something and every attempt
    // failed — same shape the legacy weekly-digest route used.
    const anyRan = result.summary.ran > 0;
    const everyFailed =
      anyRan && result.summary.results.every((r) => r.status === 'failed');
    const status = everyFailed ? 502 : 200;
    return jsonResponse(status, { ok: !everyFailed, summary: result.summary });
  } catch (err) {
    return jsonResponse(500, { ok: false, error: err.message });
  }
};

export const onRequestGet = async ({ env }) => {
  return jsonResponse(200, {
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
  });
};
