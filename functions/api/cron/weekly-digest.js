// POST /api/cron/weekly-digest
//
// LEGACY ENTRY POINT. The real dispatcher now lives at
// /api/cron/scheduled-emails and iterates every enabled row in
// public.email_schedules. This file exists only so the previously
// published cron URL and the GitHub Actions secret keep working during
// the rollout grace period — new work should hit /scheduled-emails.
//
// Both endpoints share the CRON_SECRET bearer guard. This route hard-pins
// the invocation to `kind = 'weekly_digest'` so deleting it from the
// schedule table (or disabling the row) is enough to stop sends — no code
// deploy required.

import { runScheduledEmails } from './scheduled-emails.js';

function authorised(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  return env.CRON_SECRET && token === env.CRON_SECRET;
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export const onRequestPost = async ({ request, env }) => {
  if (!authorised(request, env)) {
    return jsonResponse(401, { error: 'unauthorized' });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    /* optional */
  }
  const { email: singleEmail, dryRun } = body || {};

  try {
    // Force the schedule kind — the legacy route only ever serviced the
    // weekly digest. ignoreDue:true is used because the caller is a direct
    // operator invocation (GH Actions legacy cron, or a manual curl probe)
    // rather than the hourly tick over every schedule.
    const result = await runScheduledEmails({
      env,
      kind: 'weekly_digest',
      singleEmail: singleEmail || null,
      dryRun: !!dryRun,
      // Legacy route is called by the old weekly cron and by manual probes.
      // ignoreDue=true because the caller is driving the cadence externally;
      // ignoreEnabled=false so flipping `enabled` in the admin UI stops sends
      // without a redeploy.
      ignoreDue: true,
      ignoreEnabled: false,
    });
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
    legacy: true,
    hint: 'Use /api/cron/scheduled-emails going forward.',
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
