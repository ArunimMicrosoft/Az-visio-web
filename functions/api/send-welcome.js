// POST /api/send-welcome
//
// Fire-and-forget endpoint called by the client right after a successful
// signup. Verifies the caller's JWT, confirms the profile is freshly
// created, and dispatches the admin-editable welcome email (email_schedules
// row where kind='welcome').
//
// Deliberately permissive-return: every skip path still returns HTTP 200
// so the client's `.catch(() => {})` never sees a network error that would
// surface in the browser console. The precise reason lives in the body
// (`skipped: 'admin' | 'not_new' | 'already_sent' | 'disabled' | ...`) for
// admin debugging via the Network tab.
//
// Required Cloudflare Pages env vars:
//   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY     — for JWT verification
//   SUPABASE_SERVICE_ROLE_KEY                     — for profile/sends reads
//   EMAIL_FROM, EMAIL_FROM_NAME                   — Resend sender identity
//   RESEND_API_KEY                                — required for real sends
//   UNSUBSCRIBE_SECRET (or CRON_SECRET fallback)  — HMAC for unsubscribe URL
//   ADMIN_EMAILS / VITE_ADMIN_EMAILS              — allowlist (optional)

import { requireUser } from '../_shared/userAuth.js';
import {
  sendEmail,
  logEmailSend,
  makeUnsubscribeToken,
} from '../_shared/emailDelivery.js';
import {
  renderBroadcastMarkdown,
  buildBroadcastEmail,
} from '../_shared/broadcastTemplate.js';
import {
  renderTemplate,
  buildRecipientContext,
} from '../_shared/templateRender.js';

const APP_URL = 'https://cloudcanvas.co';
// Welcome must only trigger for a genuinely-new profile. Signup -> client
// fires /api/send-welcome within milliseconds; a 5-minute floor catches
// any realistic retry while rejecting replays by an attacker who stole an
// older JWT and tries to spam themselves. The idempotency guard below
// catches the common case (double-tap on the signup button, two tabs).
const FRESH_SIGNUP_WINDOW_MS = 5 * 60 * 1000;
const RESEND_LOOKBACK_MS = 24 * 60 * 60 * 1000;

// Mirrors functions/_shared/adminAuth.js. Keep these three literals in sync
// with src/utils/adminConfig.js DEFAULT_ADMIN_EMAILS.
const DEFAULT_ADMIN_EMAILS = [
  'arunimpandey2903@hotmail.com',
  'demo@arunimitcaffe.com',
  'admin@azuredesigner.com',
];

function buildAdminAllowlist(env) {
  const extra = (env.ADMIN_EMAILS || env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...DEFAULT_ADMIN_EMAILS, ...extra]);
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

async function supabaseJson(env, path) {
  const resp = await fetch(`${env.VITE_SUPABASE_URL}${path}`, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      Accept: 'application/json',
    },
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`Supabase ${resp.status}: ${txt.slice(0, 300)}`);
  }
  return resp.json();
}

export const onRequestPost = async ({ request, env }) => {
  const gate = await requireUser(request, env);
  if (!gate.ok) return jsonResponse(gate.status, gate.body);

  if (!env?.SUPABASE_SERVICE_ROLE_KEY || !env?.VITE_SUPABASE_URL) {
    return jsonResponse(500, { error: 'supabase_env_not_configured' });
  }

  const callerEmail = gate.email;

  // 1. Never auto-send to admins. They're the people EDITING this template;
  //    silently drop self-triggered sends so admin test signups don't pile
  //    up real deliveries.
  const allowlist = buildAdminAllowlist(env);
  if (allowlist.has(callerEmail)) {
    return jsonResponse(200, { ok: true, skipped: 'admin' });
  }

  // 2. Fetch the profile row. Service role bypasses RLS so we see the row
  //    even on the millisecond after signup.
  let profile;
  try {
    const rows = await supabaseJson(
      env,
      `/rest/v1/profiles?select=id,email,name,created_at,last_active_at,last_login,email_preferences` +
        `&id=eq.${encodeURIComponent(gate.userId || '')}` +
        `&limit=1`
    );
    profile = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  } catch (err) {
    return jsonResponse(502, { error: 'profile_lookup_failed', detail: err.message });
  }
  if (!profile) {
    return jsonResponse(200, { ok: true, skipped: 'no_profile' });
  }

  // Belt-and-braces: client-sent JWT could claim a different email than the
  // profile. Prefer the profile's address for the actual send.
  const recipientEmail = (profile.email || callerEmail || '').toLowerCase();
  if (!recipientEmail) {
    return jsonResponse(200, { ok: true, skipped: 'no_email' });
  }

  // 3. Must be genuinely new — profiles.created_at within the window. This
  //    prevents an existing user from replaying their JWT to resend the
  //    welcome mail forever.
  if (profile.created_at) {
    const ageMs = Date.now() - new Date(profile.created_at).getTime();
    if (!Number.isFinite(ageMs) || ageMs > FRESH_SIGNUP_WINDOW_MS) {
      return jsonResponse(200, { ok: true, skipped: 'not_new' });
    }
  }

  // 4. Opt-out guard — if the user already turned off product email we don't
  //    auto-send the welcome. Default is opt-in (see supabaseSignUp) so this
  //    rarely fires, but respect any explicit `false` the user set in the
  //    tiny window between signup and this call.
  const prefs = profile.email_preferences || {};
  if (prefs.weekly_digest === false) {
    return jsonResponse(200, { ok: true, skipped: 'opted_out' });
  }

  // 5. Idempotency — did we already send a welcome to this address in the
  //    last 24h? Covers double-tap, two tabs, retries after soft errors.
  try {
    const cutoff = new Date(Date.now() - RESEND_LOOKBACK_MS).toISOString();
    const recent = await supabaseJson(
      env,
      `/rest/v1/email_sends?select=id` +
        `&kind=eq.welcome` +
        `&status=eq.sent` +
        `&to_email=eq.${encodeURIComponent(recipientEmail)}` +
        `&sent_at=gte.${encodeURIComponent(cutoff)}` +
        `&limit=1`
    );
    if (Array.isArray(recent) && recent.length > 0) {
      return jsonResponse(200, { ok: true, skipped: 'already_sent' });
    }
  } catch (err) {
    // Non-fatal — if the lookup fails we still attempt the send; worst
    // case is a duplicate greeting which is better than no greeting.
    console.warn('[send-welcome] idempotency lookup failed:', err.message);
  }

  // 6. Load the admin-editable welcome template.
  let schedule = null;
  try {
    const rows = await supabaseJson(
      env,
      `/rest/v1/email_schedules?select=*&kind=eq.welcome&limit=1`
    );
    schedule = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  } catch (err) {
    return jsonResponse(502, { error: 'schedule_lookup_failed', detail: err.message });
  }
  if (!schedule) {
    return jsonResponse(200, { ok: true, skipped: 'template_missing' });
  }
  if (!schedule.enabled) {
    return jsonResponse(200, { ok: true, skipped: 'disabled' });
  }

  // 7. Render the template + build the email shell. Uses the same helpers
  //    as broadcasts/weekly-digest so deliverability headers, plaintext
  //    alternative, and HMAC unsubscribe all behave identically.
  const unsubSecret = env.UNSUBSCRIBE_SECRET || env.CRON_SECRET;
  const unsubToken = unsubSecret
    ? await makeUnsubscribeToken(recipientEmail, unsubSecret)
    : '';
  const unsubscribeUrl = unsubSecret
    ? `${APP_URL}/api/email-unsubscribe?token=${encodeURIComponent(unsubToken)}`
    : `${APP_URL}/home`;

  const context = buildRecipientContext({
    profile,
    recentDiagramsCount: 0,
    suggestedArticle: null,
    unsubscribeUrl,
    appUrl: APP_URL,
  });

  const subject =
    renderTemplate(schedule.subject_template, context) || schedule.subject_template;
  const substitutedBody = renderTemplate(schedule.body_template, context);
  const bodyHtml = renderBroadcastMarkdown(substitutedBody);
  const { html, text, headers, replyTo } = buildBroadcastEmail({
    subject,
    bodyHtml,
    unsubscribeUrl,
    appUrl: APP_URL,
    broadcastId: schedule.id || null,
  });

  // 8. Ship it + log every outcome.
  const sendResult = await sendEmail({
    to: recipientEmail,
    subject,
    html,
    text,
    env,
    headers,
    replyTo,
  });
  await logEmailSend(env, {
    to: recipientEmail,
    kind: 'welcome',
    broadcast_id: null,
    result: sendResult,
  });

  if (!sendResult.ok) {
    return jsonResponse(200, {
      ok: false,
      sent: false,
      error: sendResult.error || 'send_failed',
    });
  }
  return jsonResponse(200, { ok: true, sent: true });
};

// Any other method short-circuits before any work is done.
export const onRequest = async ({ request }) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        Allow: 'POST, OPTIONS',
        'Cache-Control': 'no-store',
      },
    });
  }
  return jsonResponse(405, { error: 'method_not_allowed' });
};
