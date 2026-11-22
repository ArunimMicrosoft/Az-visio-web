// User-authentication helper for Cloudflare Pages Functions.
//
// This is the non-admin counterpart to functions/_shared/adminAuth.js. It
// verifies the caller's Supabase JWT and returns their identity, but does
// NOT check the admin allowlist — endpoints that merely need "this is a
// real signed-in user" (e.g. /api/send-welcome) use this instead.
//
// Client sends: `Authorization: Bearer <supabase_access_token>`.
// Server verifies the token with Supabase Auth and returns email + id.

/**
 * Verify the caller has a valid Supabase session.
 *
 * @returns {Promise<
 *   { ok: true, email: string, userId: string|null } |
 *   { ok: false, status: number, body: object }
 * >}
 */
export async function requireUser(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return { ok: false, status: 401, body: { error: 'missing_bearer_token' } };
  }
  if (!env?.VITE_SUPABASE_URL || !env?.VITE_SUPABASE_ANON_KEY) {
    return {
      ok: false,
      status: 500,
      body: { error: 'supabase_env_not_configured' },
    };
  }

  let userData;
  try {
    const resp = await fetch(`${env.VITE_SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: {
        apikey: env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      return {
        ok: false,
        status: resp.status === 401 ? 401 : 502,
        body: { error: 'auth_lookup_failed', detail: txt.slice(0, 300) },
      };
    }
    userData = await resp.json();
  } catch (err) {
    return {
      ok: false,
      status: 502,
      body: { error: 'auth_upstream_error', detail: err.message },
    };
  }

  const email = (userData?.email || '').toLowerCase();
  if (!email) {
    return { ok: false, status: 401, body: { error: 'token_missing_email' } };
  }

  return { ok: true, email, userId: userData?.id || null };
}
