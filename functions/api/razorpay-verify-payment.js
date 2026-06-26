// POST /api/razorpay-verify-payment — hardened
//
// Verifies HMAC-SHA256 signature returned by Razorpay checkout.
// Strict: rejects unsigned requests outright (no silent fallback).

import {
  isAllowedOrigin,
  rateLimit,
  jsonResponse,
  readJsonBody,
  preflight,
} from '../_shared/security.js';

// HMAC-SHA256 hex via Web Crypto (Workers-native)
async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time string compare (prevents timing attacks on the signature check)
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export const onRequestOptions = ({ request }) => preflight(request);

export const onRequestPost = async ({ request, env }) => {
  if (!isAllowedOrigin(request)) {
    return jsonResponse(403, { verified: false, error: 'Origin not allowed' }, request);
  }
  const rl = rateLimit(request);
  if (!rl.allowed) {
    return new Response(JSON.stringify({ verified: false, error: 'Too many requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(rl.retryAfter),
        'Cache-Control': 'no-store',
      },
    });
  }

  let body;
  try {
    body = await readJsonBody(request);
  } catch (e) {
    return jsonResponse(400, { verified: false, error: e.message }, request);
  }

  const { orderId, paymentId, signature } = body || {};
  if (
    typeof paymentId !== 'string' ||
    typeof orderId !== 'string' ||
    typeof signature !== 'string' ||
    !/^pay_[a-zA-Z0-9]{10,30}$/.test(paymentId) ||
    !/^order_[a-zA-Z0-9]{10,30}$/.test(orderId) ||
    !/^[a-f0-9]{64}$/i.test(signature)
  ) {
    return jsonResponse(400, { verified: false, error: 'Invalid payload' }, request);
  }

  const secret = env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error('[razorpay-verify-payment] missing RAZORPAY_KEY_SECRET');
    return jsonResponse(500, { verified: false, error: 'Server misconfigured' }, request);
  }

  try {
    const expected = await hmacSha256Hex(secret, `${orderId}|${paymentId}`);
    if (!timingSafeEqual(expected.toLowerCase(), signature.toLowerCase())) {
      console.warn('[razorpay-verify-payment] signature mismatch for', paymentId);
      return jsonResponse(400, { verified: false, error: 'Invalid signature' }, request);
    }
    return jsonResponse(200, { verified: true, paymentId, orderId }, request);
  } catch (err) {
    console.error('[razorpay-verify-payment] exception:', err);
    return jsonResponse(500, { verified: false, error: 'Internal error' }, request);
  }
};
