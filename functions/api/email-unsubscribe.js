// GET /api/email-unsubscribe?token=SIGNED
// One-click unsubscribe. Returns a small confirmation HTML page.
// Token is HMAC-signed with UNSUBSCRIBE_SECRET (or CRON_SECRET fallback).

import { verifyUnsubscribeToken } from '../_shared/emailDelivery.js';

async function updatePreference(env, email) {
  const url = `${env.VITE_SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`;
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      email_preferences: { weekly_digest: false, updated_at: new Date().toISOString() },
    }),
  });
  return resp.ok;
}

const okPage = (email) => `<!doctype html>
<html><head><meta charset="utf-8"/><title>Unsubscribed</title>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; background: #f1f5f9; margin: 0; }
  .wrap { max-width: 480px; margin: 80px auto; padding: 32px; background: #fff; border-radius: 16px; text-align: center; box-shadow: 0 6px 24px -12px rgba(15,23,42,0.15); }
  h1 { color: #0f172a; font-size: 22px; margin: 0 0 12px; }
  p { color: #475569; font-size: 14px; line-height: 1.55; margin: 0 0 16px; }
  a { color: #0078D4; text-decoration: none; font-weight: 600; }
  .mark { font-size: 40px; margin-bottom: 8px; }
</style></head>
<body><div class="wrap">
  <div class="mark">📭</div>
  <h1>You've been unsubscribed</h1>
  <p><strong>${email.replace(/</g, '&lt;')}</strong> will no longer receive the weekly digest email.</p>
  <p>Changed your mind? You can re-enable it any time from your account settings.</p>
  <p><a href="https://cloudcanvas.co/home">← Return to Cloud Canvas Designer</a></p>
</div></body></html>`;

const failPage = (msg) => `<!doctype html>
<html><head><meta charset="utf-8"/><title>Link expired</title>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; background: #f1f5f9; margin: 0; }
  .wrap { max-width: 480px; margin: 80px auto; padding: 32px; background: #fff; border-radius: 16px; text-align: center; box-shadow: 0 6px 24px -12px rgba(15,23,42,0.15); }
  h1 { color: #0f172a; font-size: 22px; margin: 0 0 12px; }
  p { color: #475569; font-size: 14px; line-height: 1.55; margin: 0 0 16px; }
  a { color: #0078D4; text-decoration: none; font-weight: 600; }
</style></head>
<body><div class="wrap">
  <h1>Link expired or invalid</h1>
  <p>${msg}</p>
  <p><a href="https://cloudcanvas.co/home">← Return to Cloud Canvas Designer</a></p>
</div></body></html>`;

export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const secret = env.UNSUBSCRIBE_SECRET || env.CRON_SECRET;

  if (!token || !secret) {
    return new Response(failPage('Missing or invalid unsubscribe token.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const email = await verifyUnsubscribeToken(token, secret);
  if (!email) {
    return new Response(failPage('This unsubscribe link is expired or invalid. If you keep receiving emails, reply to any digest and we will remove you manually.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const ok = await updatePreference(env, email);
  if (!ok) {
    return new Response(failPage('We could not update your preference right now — please try again in a minute.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  return new Response(okPage(email), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
};
