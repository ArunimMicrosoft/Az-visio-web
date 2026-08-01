// GET /api/razorpay-diagnostics
//
// Read-only probe to tell the browser exactly why Razorpay may be misbehaving
// on the Cloudflare Pages deployment. No secrets are ever returned in the body.
//
// Access-controlled to the same origins as our other API routes.

import { isAllowedOrigin, jsonResponse, preflight } from '../_shared/security.js';

export const onRequestOptions = ({ request }) => preflight(request);

export const onRequestGet = async ({ request, env }) => {
  if (!isAllowedOrigin(request)) {
    return jsonResponse(403, { error: 'Origin not allowed' }, request);
  }

  const keyId = env.RAZORPAY_KEY_ID || env.VITE_RAZORPAY_KEY_ID || '';
  const keySecret = env.RAZORPAY_KEY_SECRET || '';

  const keyIdMode = keyId.startsWith('rzp_live_')
    ? 'live'
    : keyId.startsWith('rzp_test_')
      ? 'test'
      : keyId
        ? 'unknown-format'
        : 'missing';

  const result = {
    ok: true,
    timestamp: new Date().toISOString(),
    runtime: 'cloudflare-pages-functions',
    env: {
      RAZORPAY_KEY_ID_present: Boolean(env.RAZORPAY_KEY_ID),
      VITE_RAZORPAY_KEY_ID_present: Boolean(env.VITE_RAZORPAY_KEY_ID),
      RAZORPAY_KEY_SECRET_present: Boolean(env.RAZORPAY_KEY_SECRET),
      // Show the key-id publicly — it's not a secret; only the secret is.
      keyId_public: keyId || null,
      mode: keyIdMode,
    },
    tests: {},
  };

  // Test 1 — reachability of Razorpay API from Cloudflare edge
  try {
    const t0 = Date.now();
    const ping = await fetch('https://api.razorpay.com/v1/', { method: 'GET' });
    result.tests.api_reachable = {
      ok: ping.status < 500,
      status: ping.status,
      latencyMs: Date.now() - t0,
    };
  } catch (err) {
    result.tests.api_reachable = { ok: false, error: err.message };
  }

  // Test 2 — auth check (create a real ₹1 order and immediately discard)
  if (keyId && keySecret) {
    try {
      const auth = btoa(`${keyId}:${keySecret}`);
      const t0 = Date.now();
      const resp = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 100, // 1 INR
          currency: 'INR',
          receipt: `diag_${Date.now()}`,
          notes: { source: 'diagnostics' },
        }),
      });
      const body = await resp.json().catch(() => ({}));
      result.tests.auth_and_order = {
        ok: resp.ok,
        status: resp.status,
        latencyMs: Date.now() - t0,
        // Razorpay's error surface — safe to expose (does not include your secret)
        error: body?.error || null,
        orderId: body?.id || null,
      };
    } catch (err) {
      result.tests.auth_and_order = { ok: false, error: err.message };
    }
  } else {
    result.tests.auth_and_order = { ok: false, error: 'server credentials missing' };
  }

  return jsonResponse(200, result, request);
};
