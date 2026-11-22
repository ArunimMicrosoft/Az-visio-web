// POST /api/admin-run-schedule
//
// Admin-authed one-off trigger of a scheduled email row. Used by the
// "Run now" button in the Admin -> Scheduled Emails tab, and by the
// "Preview" flow (when the admin only wants to send the email to their
// own address). Bypasses cadence (ignoreDue=true) but still respects the
// `enabled` flag unless `force` is set. Writes last_run_at just like the
// hourly cron tick so admins can watch status pills update in the UI.
//
// Request body:
//   { kind: string, dryRun?: boolean, email?: string, force?: boolean }
//
//   - kind    : required. Schedule row key (e.g. 'weekly_digest').
//   - dryRun  : optional. Renders + logs without actually sending.
//   - email   : optional. Limit the audience to a single address — used by
//               the Preview flow to send a sample to the admin themselves.
//   - force   : optional. Fire even if the schedule row is disabled.
//
// Auth: Authorization: Bearer <supabase_access_token>. Caller's email must
// be in the admin allowlist (see functions/_shared/adminAuth.js).

import { requireAdmin } from '../_shared/adminAuth.js';
import { runScheduledEmails } from './cron/scheduled-emails.js';

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export const onRequestPost = async ({ request, env }) => {
  const gate = await requireAdmin(request, env);
  if (!gate.ok) return jsonResponse(gate.status, gate.body);

  if (!env?.SUPABASE_SERVICE_ROLE_KEY || !env?.VITE_SUPABASE_URL) {
    return jsonResponse(500, { error: 'supabase_env_not_configured' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: 'invalid_json_body' });
  }

  const kind = typeof body?.kind === 'string' ? body.kind.trim() : '';
  if (!kind) return jsonResponse(400, { error: 'missing_kind' });

  const dryRun = !!body?.dryRun;
  const force = !!body?.force;
  const singleEmail =
    typeof body?.email === 'string' && body.email.trim() ? body.email.trim() : null;

  try {
    const result = await runScheduledEmails({
      env,
      kind,
      singleEmail,
      dryRun,
      // Admin "Run now" always bypasses the cadence check. The `enabled`
      // gate is only bypassed when `force=true` — otherwise a disabled
      // schedule still returns `disabled` and the UI shows that as feedback.
      ignoreDue: true,
      ignoreEnabled: force,
    });

    return jsonResponse(200, {
      ok: true,
      actor: gate.email,
      summary: result.summary,
    });
  } catch (err) {
    return jsonResponse(500, { ok: false, error: err.message });
  }
};
