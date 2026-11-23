// POST /api/admin-delete-user
//
// Admin-authed destructive endpoint that removes a user from the system.
// Two modes:
//
//   hard delete (default) — deletes the row from auth.users via the
//     Supabase Admin API. The profiles row is explicitly deleted FIRST so
//     the delete works whether or not the live DB has
//     `profiles.id REFERENCES auth.users(id) ON DELETE CASCADE`. All
//     migration files that reference auth.users via a nullable column
//     (email_broadcasts.created_by, email_schedules.updated_by,
//     blog_posts.created_by) use ON DELETE SET NULL, so those rows survive
//     with a NULL actor — audit trail intact.
//
//   soft delete (soft: true) — rewrites the profile and auth.users row to
//     a scrubbed, non-reclaimable address so the user cannot log back in
//     but the original email becomes available for re-signup. Diagrams,
//     blog drafts, email history stay intact.
//
// Guards (fail with 400):
//   - user_id matches a real profile row
//   - target email is NOT in the admin allowlist (prevent admin lockout)
//   - target is NOT the caller themselves
//
// Request body: { user_id: uuid, soft?: boolean }
// Response:     { ok: true, mode: 'soft' | 'hard', freed_email: string }
//
// Required env:
//   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY — for admin JWT verification
//   SUPABASE_SERVICE_ROLE_KEY                 — for Admin API + service reads

import { requireAdmin, adminAllowlist } from '../_shared/adminAuth.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

async function supabaseFetch(env, path, opts = {}) {
  const resp = await fetch(`${env.VITE_SUPABASE_URL}${path}`, {
    ...opts,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(opts.headers || {}),
    },
  });
  return resp;
}

async function supabaseJson(env, path, opts = {}) {
  const resp = await supabaseFetch(env, path, opts);
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`Supabase ${resp.status}: ${txt.slice(0, 300)}`);
  }
  return resp.json();
}

/**
 * Write a server-side audit log entry via the service role so the trail
 * exists even when the client UI is bypassed. Mirrors the shape produced
 * by src/utils/supabase.js writeAuditLog — `details` is a JSON string.
 */
async function writeServerAuditLog(env, { userId, email, event, details, request }) {
  try {
    const body = {
      user_id: userId || null,
      email: email || null,
      event,
      details: JSON.stringify(details || {}),
      ip_address: request?.headers?.get?.('cf-connecting-ip') || null,
      created_at: new Date().toISOString(),
    };
    const resp = await supabaseFetch(env, `/rest/v1/audit_logs`, {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      console.warn('[admin-delete-user] audit log non-2xx:', resp.status, txt);
    }
  } catch (err) {
    console.warn('[admin-delete-user] audit log failed:', err.message);
  }
}

/**
 * Supabase Admin API — DELETE /auth/v1/admin/users/{id}
 * Uses the service-role key as the bearer. This is the only path that
 * actually removes the auth row (cascades or not depending on live schema).
 */
async function adminApiDeleteAuthUser(env, userId) {
  const resp = await fetch(
    `${env.VITE_SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`auth_admin_delete ${resp.status}: ${txt.slice(0, 300)}`);
  }
}

/**
 * Supabase Admin API — PATCH /auth/v1/admin/users/{id}
 * Rewrites the auth.users.email so the original email can be reused.
 * `email_confirm: true` suppresses a confirmation round-trip for the
 * (synthetic) replacement address.
 */
async function adminApiUpdateAuthEmail(env, userId, newEmail) {
  const resp = await fetch(
    `${env.VITE_SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(userId)}`,
    {
      method: 'PUT',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: newEmail, email_confirm: true }),
    }
  );
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`auth_admin_update ${resp.status}: ${txt.slice(0, 300)}`);
  }
}

export const onRequestPost = async ({ request, env }) => {
  const gate = await requireAdmin(request, env);
  if (!gate.ok) return jsonResponse(gate.status, gate.body);

  if (!env?.SUPABASE_SERVICE_ROLE_KEY || !env?.VITE_SUPABASE_URL) {
    return jsonResponse(500, { error: 'supabase_env_not_configured' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: 'invalid_json_body' });
  }

  const userId = typeof body?.user_id === 'string' ? body.user_id.trim() : '';
  const soft = body?.soft === true;

  if (!userId) return jsonResponse(400, { error: 'missing_user_id' });
  if (!UUID_RE.test(userId)) return jsonResponse(400, { error: 'invalid_user_id' });

  // Guard 1: don't let an admin delete themselves (either through the UI or
  // via a crafted curl). Caller's user id is on the gate when the token
  // verifies.
  if (gate.userId && gate.userId === userId) {
    return jsonResponse(400, { error: 'cannot_delete_self' });
  }

  // Load the profile so we know the real email (for allowlist check + for
  // the `freed_email` response field + for the scrubbed address on soft
  // delete).
  let profile;
  try {
    const rows = await supabaseJson(
      env,
      `/rest/v1/profiles?select=id,email,name&id=eq.${encodeURIComponent(userId)}&limit=1`
    );
    profile = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  } catch (err) {
    return jsonResponse(502, { error: 'profile_lookup_failed', detail: err.message });
  }
  if (!profile) return jsonResponse(400, { error: 'user_not_found' });

  const targetEmail = (profile.email || '').toLowerCase();
  if (!targetEmail) return jsonResponse(400, { error: 'profile_missing_email' });

  // Guard 2: never delete another admin via this endpoint.
  const allow = new Set(adminAllowlist(env).map((e) => e.toLowerCase()));
  if (allow.has(targetEmail)) {
    return jsonResponse(400, { error: 'target_is_admin' });
  }

  if (soft) {
    const scrubbedEmail = `deleted-${userId}@removed.local`;
    // Update auth.users first — if the Admin API call fails, profiles
    // stays intact so we don't leave a half-scrubbed record behind.
    try {
      await adminApiUpdateAuthEmail(env, userId, scrubbedEmail);
    } catch (err) {
      return jsonResponse(502, { error: 'auth_update_failed', detail: err.message });
    }
    try {
      const resp = await supabaseFetch(
        env,
        `/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            is_active: false,
            name: null,
            email: scrubbedEmail,
            email_preferences: null,
          }),
        }
      );
      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        return jsonResponse(502, {
          error: 'profile_scrub_failed',
          detail: `${resp.status} ${txt.slice(0, 200)}`,
        });
      }
    } catch (err) {
      return jsonResponse(502, { error: 'profile_scrub_failed', detail: err.message });
    }

    await writeServerAuditLog(env, {
      userId: gate.userId,
      email: gate.email,
      event: 'USER_SOFT_DELETED',
      details: { targetEmail, user_id: userId, soft: true },
      request,
    });

    return jsonResponse(200, {
      ok: true,
      mode: 'soft',
      freed_email: targetEmail,
    });
  }

  // Hard delete. Done in dependency order so it works whether or not the
  // live schema has ON DELETE CASCADE wired into every FK that points at
  // auth.users:
  //
  //   1. Delete the user's diagrams. Safe no-op if cascade would have done
  //      it. Prevents an "update_or_delete_on_table violates foreign key
  //      constraint" error on step 3 when diagrams.user_id has no cascade.
  //   2. Delete the public.profiles row. Same reasoning.
  //   3. Delete the auth.users row via the Admin API — the only step that
  //      actually frees the email. email_broadcasts.created_by,
  //      email_schedules.updated_by, and blog_posts.created_by all use
  //      ON DELETE SET NULL (see docs/ADD_EMAIL_*.sql, ADD_BLOG_POSTS_*),
  //      so those rows survive with a NULL actor — audit trail intact.
  //      email_sends.to_email is a plain string (no FK), so delivery
  //      history survives the delete.
  async function hardDeleteRows(path, label) {
    try {
      const resp = await supabaseFetch(env, path, {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' },
      });
      if (!resp.ok && resp.status !== 404) {
        const txt = await resp.text().catch(() => '');
        return {
          ok: false,
          error: `${label}_failed`,
          detail: `${resp.status} ${txt.slice(0, 200)}`,
        };
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: `${label}_failed`, detail: err.message };
    }
  }

  const diagramsRes = await hardDeleteRows(
    `/rest/v1/diagrams?user_id=eq.${encodeURIComponent(userId)}`,
    'diagrams_delete'
  );
  if (!diagramsRes.ok) return jsonResponse(502, diagramsRes);

  const profileRes = await hardDeleteRows(
    `/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
    'profile_delete'
  );
  if (!profileRes.ok) return jsonResponse(502, profileRes);

  try {
    await adminApiDeleteAuthUser(env, userId);
  } catch (err) {
    return jsonResponse(502, { error: 'auth_delete_failed', detail: err.message });
  }

  await writeServerAuditLog(env, {
    userId: gate.userId,
    email: gate.email,
    event: 'USER_DELETED',
    details: { targetEmail, user_id: userId, soft: false },
    request,
  });

  return jsonResponse(200, {
    ok: true,
    mode: 'hard',
    freed_email: targetEmail,
  });
};
