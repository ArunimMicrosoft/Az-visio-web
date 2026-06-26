// Cloudflare Pages Function — POST /api/razorpay-verify-payment
// Verifies Razorpay HMAC-SHA256 signature using Web Crypto (Workers-native)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });

export const onRequestOptions = () =>
  new Response(null, { status: 204, headers: CORS_HEADERS });

// Compute HMAC-SHA256(secret, message) as hex
async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const onRequestPost = async ({ request, env }) => {
  try {
    const { orderId, paymentId, signature } = await request
      .json()
      .catch(() => ({}));

    if (!paymentId) {
      return json(400, { verified: false, error: 'Missing paymentId' });
    }

    const secret = env.RAZORPAY_KEY_SECRET;

    // Full verification path: orderId + signature + secret all present
    if (orderId && signature && secret) {
      const expected = await hmacSha256Hex(secret, `${orderId}|${paymentId}`);
      if (expected !== signature) {
        return json(400, {
          verified: false,
          error: 'Invalid signature',
        });
      }
      return json(200, { verified: true, paymentId, orderId });
    }

    // Fallback: no order id flow (client-side only) — accept but flag
    return json(200, {
      verified: true,
      paymentId,
      orderId: orderId || null,
      warning: 'Accepted without server-side signature verification',
    });
  } catch (err) {
    return json(500, { verified: false, error: err.message });
  }
};
