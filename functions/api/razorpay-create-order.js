// Cloudflare Pages Function — POST /api/razorpay-create-order
// Creates a Razorpay order using fetch (no SDK, no node deps)
//
// Env vars (set in Cloudflare Pages dashboard → Settings → Environment variables):
//   RAZORPAY_KEY_ID      — public key id (rzp_live_... or rzp_test_...)
//   RAZORPAY_KEY_SECRET  — server secret (NEVER expose in frontend)

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

// CORS preflight
export const onRequestOptions = () =>
  new Response(null, { status: 204, headers: CORS_HEADERS });

export const onRequestPost = async ({ request, env }) => {
  try {
    const keyId = env.RAZORPAY_KEY_ID || env.VITE_RAZORPAY_KEY_ID;
    const keySecret = env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return json(500, {
        error: 'Razorpay credentials not configured on server',
      });
    }

    const body = await request.json().catch(() => ({}));
    const { amount, planName, customerEmail, customerName, customerId } = body;

    if (!amount || !planName || !customerEmail) {
      return json(400, { error: 'Missing required fields' });
    }

    // Razorpay Orders API: Basic auth with keyId:keySecret
    const auth = btoa(`${keyId}:${keySecret}`);

    const rzpResp = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount, // in paise; frontend converts
        currency: 'INR',
        receipt: `rcpt_${customerId || 'guest'}_${Date.now()}`.slice(0, 40),
        notes: {
          planName,
          customerEmail,
          customerName: customerName || '',
          customerId: customerId || '',
        },
      }),
    });

    const data = await rzpResp.json();

    if (!rzpResp.ok) {
      return json(rzpResp.status, {
        error: 'Razorpay order creation failed',
        detail: data,
      });
    }

    return json(200, {
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
    });
  } catch (err) {
    return json(500, { error: 'Internal error', message: err.message });
  }
};
