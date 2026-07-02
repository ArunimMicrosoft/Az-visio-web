// POST /api/verify-captcha
// Verifies a Cloudflare Turnstile token against the official siteverify
// endpoint. The SECRET key stays in Cloudflare Pages env vars — never in
// the client bundle.
//
// Expects: { token: string }  from the client
// Returns: { success: boolean, hostname?, action?, ts?, error? }

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Dev fallback — always-pass secret from Cloudflare's public test keys.
// Only used when the real secret isn't configured yet.
const TEST_SECRET = '1x0000000000000000000000000000000AA';

export async function onRequestPost({ request, env }) {
  const cors = corsHeaders(request);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ success: false, error: 'invalid-json' }, 400, cors);
  }

  const token = payload?.token;
  if (!token || typeof token !== 'string') {
    return json({ success: false, error: 'missing-token' }, 400, cors);
  }

  const secret = env?.TURNSTILE_SECRET_KEY || TEST_SECRET;

  // Use IP if we have it — helps Cloudflare's abuse detection
  const clientIp =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    null;

  const form = new URLSearchParams();
  form.append('secret', secret);
  form.append('response', token);
  if (clientIp) form.append('remoteip', clientIp);

  let verify;
  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    verify = await res.json();
  } catch (e) {
    return json({ success: false, error: 'siteverify-fetch-failed', detail: e.message }, 502, cors);
  }

  if (!verify?.success) {
    return json({
      success: false,
      error: 'invalid-token',
      details: verify?.['error-codes'] || [],
    }, 403, cors);
  }

  return json({
    success: true,
    hostname: verify.hostname,
    action:   verify.action,
    ts:       verify.challenge_ts,
  }, 200, cors);
}

// Handle CORS pre-flight for the case where the API is hit cross-origin
export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin':      origin,
    'Access-Control-Allow-Methods':     'POST, OPTIONS',
    'Access-Control-Allow-Headers':     'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
    'Vary':                             'Origin',
  };
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
  });
}
