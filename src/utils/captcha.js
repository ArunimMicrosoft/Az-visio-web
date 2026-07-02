// Server-side Turnstile verification helper.
// Never trust the client-obtained token — always POST it to /api/verify-captcha
// which validates it against Cloudflare's siteverify endpoint using the SECRET.

export async function verifyCaptcha(token) {
  if (!token) return { success: false, error: 'missing-token' };
  try {
    const res = await fetch('/api/verify-captcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return await res.json();
  } catch (err) {
    console.error('[captcha] verify failed:', err);
    return { success: false, error: 'network-error' };
  }
}
