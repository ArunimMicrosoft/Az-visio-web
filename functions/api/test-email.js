// GET|POST /api/test-email?to=<email>
//
// Admin-only probe that fires a single real email through the Resend path
// and logs the attempt into public.email_sends. Use this to confirm the
// outbound pipeline after any env-var change.
//
// Auth: Authorization: Bearer <supabase_access_token>. Caller's email must
// be in the admin allowlist (see functions/_shared/adminAuth.js).
//
// Returns 200 on Resend success with `{ ok, provider, status, id? }`.
// Returns 502 on Resend failure with the same shape plus `error`.

import { requireAdmin } from '../_shared/adminAuth.js';
import { sendEmail, logEmailSend } from '../_shared/emailDelivery.js';

const APP_URL = 'https://cloudcanvas.co';

function testEmail({ recipient, actor }) {
  const subject = 'Cloud Canvas — test email';
  const plain = [
    `This is a test email from Cloud Canvas Designer.`,
    `Triggered by admin: ${actor}`,
    `Recipient: ${recipient}`,
    `Timestamp: ${new Date().toISOString()}`,
    ``,
    `If you received this, the Resend pipeline is working.`,
  ].join('\n');
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px 24px;box-shadow:0 4px 12px -6px rgba(15,23,42,0.1);">
      <div style="font-size:12px;color:#64748b;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:6px;">Pipeline probe</div>
      <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px;">Test email delivered \u2705</h1>
      <p style="font-size:14px;color:#475569;line-height:1.55;margin:0 0 16px;">
        This is a one-off test email from the <strong>Cloud Canvas Designer</strong> admin dashboard.
      </p>
      <table role="presentation" width="100%" style="font-size:13px;color:#475569;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#64748b;">Triggered by</td><td style="padding:4px 0;color:#0f172a;font-weight:600;">${escapeHtml(actor)}</td></tr>
        <tr><td style="padding:4px 0;color:#64748b;">Recipient</td><td style="padding:4px 0;color:#0f172a;font-weight:600;">${escapeHtml(recipient)}</td></tr>
        <tr><td style="padding:4px 0;color:#64748b;">Timestamp</td><td style="padding:4px 0;color:#0f172a;font-weight:600;">${new Date().toISOString()}</td></tr>
      </table>
      <p style="font-size:13px;color:#64748b;line-height:1.55;margin:16px 0 0;">
        If you received this message, the Resend outbound pipeline is working end to end.
      </p>
      <div style="text-align:center;margin:24px 0 4px;">
        <a href="${APP_URL}/home" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#0078D4 0%,#0091EA 100%);color:#fff;text-decoration:none;font-size:14px;font-weight:700;border-radius:10px;">Open dashboard</a>
      </div>
    </div>
    <div style="text-align:center;padding:16px 8px;color:#94a3b8;font-size:11.5px;">
      Cloud Canvas Designer \u00b7 admin test \u00b7 do not reply
    </div>
  </div>
</body></html>`;
  return { subject, html, text: plain };
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isEmailish(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;
}

async function pickRecipient(request) {
  const url = new URL(request.url);
  const qTo = url.searchParams.get('to');
  if (qTo) return qTo.trim();
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      if (body && typeof body.to === 'string') return body.to.trim();
    } catch { /* ignore */ }
  }
  return null;
}

async function handler({ request, env }) {
  const gate = await requireAdmin(request, env);
  if (!gate.ok) {
    return new Response(JSON.stringify(gate.body), {
      status: gate.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  const recipient = await pickRecipient(request);
  if (!recipient || !isEmailish(recipient)) {
    return new Response(
      JSON.stringify({ error: 'missing_or_invalid_recipient', hint: "pass ?to=<email>" }),
      { status: 400, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
    );
  }

  const { subject, html, text } = testEmail({ recipient, actor: gate.email });
  const result = await sendEmail({ to: recipient, subject, html, text, env });

  // Fire-and-forget persistence (never blocks the response path)
  await logEmailSend(env, { to: recipient, kind: 'test', broadcast_id: null, result });

  const payload = {
    ok: result.ok,
    provider: result.provider,
    status: result.status,
    id: result.id || null,
    error: result.error || null,
    to: recipient,
    actor: gate.email,
  };
  return new Response(JSON.stringify(payload), {
    status: result.ok ? 200 : 502,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export const onRequestGet = handler;
export const onRequestPost = handler;
