// Email delivery abstraction.
// Tries providers in this order:
//   1. Resend (if RESEND_API_KEY is set) — simple REST API, 100/day free tier
//   2. MailChannels (Cloudflare-native, free from Pages Functions)
//
// Both need the sender domain to have proper SPF/DKIM DNS on cloudcanvas.co.
// See docs/EMAIL_SETUP.md for the one-time DNS setup.

export async function sendEmail({ to, from, subject, html, text, env }) {
  if (!to || !subject || !html) {
    throw new Error('sendEmail: to, subject, html are required');
  }

  const sender = from || env.EMAIL_FROM || 'hello@cloudcanvas.co';
  const senderName = env.EMAIL_FROM_NAME || 'Cloud Canvas Designer';

  // Provider 1: Resend
  if (env.RESEND_API_KEY) {
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
        return { ok: true, provider: 'resend', id: body.id };
      }
      console.error('[email] Resend failed:', resp.status, body);
    } catch (err) {
      console.error('[email] Resend exception:', err.message);
    }
  }

  // Provider 2: MailChannels (Cloudflare-native, free)
  try {
    const resp = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: Array.isArray(to) ? to[0] : to }] }],
        from: { email: sender, name: senderName },
        subject,
        content: [
          { type: 'text/plain', value: text || html.replace(/<[^>]*>/g, ' ') },
          { type: 'text/html', value: html },
        ],
      }),
    });
    if (resp.ok) {
      return { ok: true, provider: 'mailchannels' };
    }
    const errText = await resp.text().catch(() => '');
    console.error('[email] MailChannels failed:', resp.status, errText);
    return { ok: false, provider: 'mailchannels', error: `${resp.status} ${errText}` };
  } catch (err) {
    console.error('[email] MailChannels exception:', err.message);
    return { ok: false, error: err.message };
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
  // Check the signature against today AND the previous 30 days
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
