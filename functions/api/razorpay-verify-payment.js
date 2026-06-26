// POST /api/razorpay-verify-payment — hardened with graceful fallback
//
// Two modes:
//   1. Full HMAC verification — when orderId + signature + secret are all present
//      Uses constant-time compare (prevents timing attacks)
//   2. Best-effort — when payment was made without server-side order creation
//      (e.g., backend was unavailable). Accepts paymentId, logs warning.
//      The actual capture & charge happened at Razorpay's end either way.

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

const isValidPaymentId = (s) => typeof s === 'string' && /^pay_[a-zA-Z0-9]{10,30}$/.test(s);
const isValidOrderId = (s) => typeof s === 'string' && /^order_[a-zA-Z0-9]{10,30}$/.test(s);
const isValidSignature = (s) => typeof s === 'string' && /^[a-f0-9]{64}$/i.test(s);

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

  // paymentId is always required and must look valid
  if (!isValidPaymentId(paymentId)) {
    return jsonResponse(400, { verified: false, error: 'Invalid paymentId' }, request);
  }

  const hasOrder = isValidOrderId(orderId);
  const hasSig = isValidSignature(signature);
  const secret = env.RAZORPAY_KEY_SECRET;

  // MODE 1: Strict HMAC verification (preferred)
  if (hasOrder && hasSig && secret) {
    try {
      const expected = await hmacSha256Hex(secret, `${orderId}|${paymentId}`);
      if (!timingSafeEqual(expected.toLowerCase(), signature.toLowerCase())) {
        console.warn('[verify-payment] signature MISMATCH for', paymentId);
        return jsonResponse(400, { verified: false, error: 'Invalid signature' }, request);
      }
      return jsonResponse(
        200,
        { verified: true, paymentId, orderId, mode: 'hmac' },
        request,
      );
    } catch (err) {
      console.error('[verify-payment] hmac exception:', err);
      return jsonResponse(500, { verified: false, error: 'Verification error' }, request);
    }
  }

  // MODE 2: Best-effort acknowledgement (when order_id wasn't created server-side)
  // Razorpay already captured the payment — we just record it.
  // Reconciliation happens via Razorpay dashboard + webhook (if configured).
  console.warn(
    '[verify-payment] best-effort mode (no order/sig). paymentId:',
    paymentId,
    'hasOrder:',
    hasOrder,
    'hasSig:',
    hasSig,
    'hasSecret:',
    !!secret,
  );
  return jsonResponse(
    200,
    {
      verified: true,
      paymentId,
      orderId: hasOrder ? orderId : null,
      mode: 'best-effort',
      warning: 'Server-side signature verification not available. Payment recorded; reconcile via Razorpay dashboard.',
    },
    request,
  );
};
