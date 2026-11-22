// Email delivery abstraction — Resend-only.
//
// Rationale (see docs/EMAIL_DIGEST_SETUP.md -> Troubleshooting): we previously
// fell through to MailChannels when RESEND_API_KEY was unset, but MailChannels
// stopped accepting free Cloudflare Pages traffic. That silent fallback is why
// the weekly digest appeared to succeed while delivering zero emails. Resend
// is now the single required provider; a missing API key returns a loud error
// rather than falling through.
//
// Every attempt (success or failure) should be persisted via `logEmailSend`
// so admins can inspect delivery after the fact.

/**
 * Send one email through Resend.
 *
 * @returns {Promise<{
 *   ok: boolean,
 *   provider: 'resend',
 *   id?: string,
 *   status: number,     // Resend HTTP status, or 0 on exception / missing key
 *   error?: string,
 * }>}
 */
export async function sendEmail({ to, from, subject, html, text, env }) {
  if (!to || !subject || !html) {
    throw new Error('sendEmail: to, subject, html are required');
  }

  const sender = from || env.EMAIL_FROM || 'hello@cloudcanvas.co';
  const senderName = env.EMAIL_FROM_NAME || 'Cloud Canvas Designer';

  if (!env.RESEND_API_KEY) {
    console.error('[email] RESEND_API_KEY is not set; refusing to send');
    return { ok: false, provider: 'resend', status: 0, error: 'resend_api_key_missing' };
  }

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${senderName} <${sender}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text: text || undefined,
      }),
    });
    const body = await resp.json().catch(() => ({}));
    if (resp.ok) {
      return { ok: true, provider: 'resend', id: body.id, status: resp.status };
    }
    const errMsg = body?.message || body?.error || `HTTP ${resp.status}`;
    console.error('[email] Resend failed:', resp.status, body);
    return { ok: false, provider: 'resend', status: resp.status, error: errMsg };
  } catch (err) {
    console.error('[email] Resend exception:', err.message);
    return { ok: false, provider: 'resend', status: 0, error: err.message };
  }
}

/**
 * Append one row to public.email_sends via the Supabase REST API.
 *
 * Service-role key bypasses RLS. Never throws — a failing log must not break
 * the surrounding send loop; we only `console.error` on failure.
 *
 * @param {object} env
 * @param {{
 *   to: string,
 *   kind: 'digest'|'broadcast'|'reengagement'|'test',
 *   broadcast_id?: string|null,
 *   result: { ok: boolean, status?: number, error?: string }
 * }} entry
 */
export async function logEmailSend(env, { to, kind, broadcast_id = null, result }) {
  if (!env?.VITE_SUPABASE_URL || !env?.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[email] logEmailSend: Supabase env missing, skipping log');
    return;
  }
  try {
    const row = {
      to_email: to,
      kind,
      broadcast_id,
      status: result?.ok ? 'sent' : 'failed',
      provider_response_code: typeof result?.status === 'number' ? result.status : null,
      error: result?.ok ? null : (result?.error ? String(result.error).slice(0, 2000) : null),
    };
    const resp = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/email_sends`, {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      console.error('[email] logEmailSend non-2xx:', resp.status, txt);
    }
  } catch (err) {
    console.error('[email] logEmailSend exception:', err.message);
  }
}

// HMAC-signed unsubscribe token — one-click safe unsubscribe from email footer.
export async function makeUnsubscribeToken(email, secret) {
  const enc = new TextEncoder();
  const payload = `${email}:${Math.floor(Date.now() / 86_400_000)}`; // per-day epoch bucket
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const sigHex = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${btoa(email)}.${sigHex}`;
}

export async function verifyUnsubscribeToken(token, secret) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [emailB64, sig] = token.split('.');
  let email;
  try {
    email = atob(emailB64);
  } catch {
    return null;
  }
  // Check the signature against today AND the previous 60 days
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const todayBucket = Math.floor(Date.now() / 86_400_000);
  for (let d = 0; d <= 60; d++) {
    const payload = `${email}:${todayBucket - d}`;
    const s = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    const sHex = [...new Uint8Array(s)].map((b) => b.toString(16).padStart(2, '0')).join('');
    if (sHex === sig) return email;
  }
  return null;
}
