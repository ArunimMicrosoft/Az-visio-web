// POST /api/razorpay-create-order — hardened
//
// Defense in depth:
//   - Origin allowlist (CORS) — only our domains call this
//   - Per-IP rate limit (30 req/min)
//   - Strict Content-Type + body size cap (8 KB)
//   - Input validation (length, type, allow-list of plans)
//   - Stripped error messages to clients (full detail only in server log)
//
// Env vars (set as Secret in Cloudflare Pages):
//   RAZORPAY_KEY_ID
//   RAZORPAY_KEY_SECRET

import {
  isAllowedOrigin,
  rateLimit,
  jsonResponse,
  readJsonBody,
  preflight,
} from '../_shared/security.js';

const ALLOWED_PLANS = new Set(['Starter', 'Professional', 'Enterprise']);
const MIN_AMOUNT_PAISE = 100;        // 1 INR
const MAX_AMOUNT_PAISE = 1_000_000;  // 10,000 INR sanity ceiling

export const onRequestOptions = ({ request }) => preflight(request);

export const onRequestPost = async ({ request, env }) => {
  // 1) Origin check
  if (!isAllowedOrigin(request)) {
    return jsonResponse(403, { error: 'Origin not allowed' }, request);
  }

  // 2) Rate limit
  const rl = rateLimit(request);
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rl.retryAfter),
          'Cache-Control': 'no-store',
        },
      },
    );
  }

  // 3) Read + validate body
  let body;
  try {
    body = await readJsonBody(request);
  } catch (e) {
    return jsonResponse(400, { error: e.message }, request);
  }

  const { amount, planName, customerEmail, customerName, customerId } = body || {};

  if (typeof amount !== 'number' || !Number.isInteger(amount)) {
    return jsonResponse(400, { error: 'amount must be an integer (paise)' }, request);
  }
  if (amount < MIN_AMOUNT_PAISE || amount > MAX_AMOUNT_PAISE) {
    return jsonResponse(400, { error: 'amount out of range' }, request);
  }
  if (typeof planName !== 'string' || !ALLOWED_PLANS.has(planName)) {
    return jsonResponse(400, { error: 'planName invalid' }, request);
  }
  if (typeof customerEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return jsonResponse(400, { error: 'customerEmail invalid' }, request);
  }
  if (customerName && (typeof customerName !== 'string' || customerName.length > 200)) {
    return jsonResponse(400, { error: 'customerName invalid' }, request);
  }
  if (customerId && (typeof customerId !== 'string' || customerId.length > 100)) {
    return jsonResponse(400, { error: 'customerId invalid' }, request);
  }

  // 4) Credentials
  const keyId = env.RAZORPAY_KEY_ID || env.VITE_RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    console.error('[razorpay-create-order] missing credentials');
    return jsonResponse(500, { error: 'Server misconfigured' }, request);
  }

  // 5) Call Razorpay
  try {
    const auth = btoa(`${keyId}:${keySecret}`);
    const rzpResp = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: `rcpt_${(customerId || 'guest').slice(0, 20)}_${Date.now()}`.slice(0, 40),
        notes: {
          planName,
          customerEmail: customerEmail.toLowerCase(),
          customerName: customerName || '',
          customerId: customerId || '',
        },
      }),
    });

    const data = await rzpResp.json();
    if (!rzpResp.ok) {
      console.error('[razorpay-create-order] razorpay error:', data);
      return jsonResponse(502, { error: 'Payment provider error' }, request);
    }

    return jsonResponse(
      200,
      { orderId: data.id, amount: data.amount, currency: data.currency },
      request,
    );
  } catch (err) {
    console.error('[razorpay-create-order] exception:', err);
    return jsonResponse(500, { error: 'Internal error' }, request);
  }
};
