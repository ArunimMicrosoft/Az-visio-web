// Admin authentication helper for Cloudflare Pages Functions.
//
// Client sends: `Authorization: Bearer <supabase_access_token>`.
// Server verifies the token with Supabase Auth and matches the returned
// email against the admin allowlist.
//
// Allowlist assembly mirrors src/utils/adminConfig.js: a baseline of three
// hardcoded emails, optionally extended by the comma-separated env vars
// `ADMIN_EMAILS` (preferred) or `VITE_ADMIN_EMAILS`.

const DEFAULT_ADMIN_EMAILS = [
  'arunimpandey2903@hotmail.com',
  'demo@arunimitcaffe.com',
  'admin@azuredesigner.com',
];

function buildAllowlist(env) {
  const extra = (env.ADMIN_EMAILS || env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...DEFAULT_ADMIN_EMAILS, ...extra]);
}

/**
 * Verify the caller is an admin.
 *
 * @returns {Promise<
 *   { ok: true, email: string, userId: string|null } |
 *   { ok: false, status: number, body: object }
 * >}
 */
export async function requireAdmin(request, env) {
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

  const allow = buildAllowlist(env);
  if (!allow.has(email)) {
    return { ok: false, status: 403, body: { error: 'not_admin' } };
  }

  return { ok: true, email, userId: userData?.id || null };
}

/**
 * Build the admin allowlist as an array of lowercased emails. Used by the
 * broadcast handler for the `admin_test` audience.
 */
export function adminAllowlist(env) {
  return [...buildAllowlist(env)];
}
