// Client helpers for the Admin Email Broadcast tab.
//
// The admin UI now picks recipients as an explicit list of user ids
// (checkbox list of every opted-in profile). The legacy audience-dropdown
// filters (`all` / `paid` / `trial` / `inactive_30d` / `admin_test`) are
// deprecated — kept as a no-op for any external callers still hitting
// `countAudience`, but every new broadcast ships an explicit user-id list.
//
// Mirrored on the server by functions/api/admin-broadcast.js.

import { supabase } from './supabase';

export const AUDIENCE_LABELS = {
  all:           'All users (opted in)',
  paid:          'Paid only',
  trial:         'Trial only',
  inactive_30d:  'Inactive 30+ days',
  admin_test:    'Admin test (just me)',
  custom:        'Custom (picked users)',
  test:          'Test (admin only)',
};

const OPT_IN_OR_FILTER =
  'email_preferences.is.null,email_preferences->>weekly_digest.not.eq.false';

/**
 * Fetch every profile that is a candidate for a broadcast — currently
 * `is_active = true` AND opted-in (email_preferences.weekly_digest is
 * either true or absent, treating absent as the default-on).
 *
 * Returned rows power the admin's per-user checkbox audience picker; the
 * admin ticks the actual recipients.
 *
 * RLS: the `profiles` table already restricts reads to the row owner OR
 * admin. The admin tab sits behind the admin-email allowlist (see
 * src/utils/adminConfig.js), so this query returns the full table for
 * admins and nothing for everyone else.
 */
export async function fetchEligibleUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, name, subscription_tier, last_active_at, is_active')
    .eq('is_active', true)
    .or(OPT_IN_OR_FILTER)
    .order('email', { ascending: true })
    .limit(10000);
  if (error) throw error;
  return (data || []).filter((u) => u.email);
}

/**
 * @deprecated — the audience-dropdown UX was replaced by a per-user
 * checkbox list. Left behind so external callers (none in-tree at time of
 * writing) don't error out; returns the historical shape.
 */
export async function countAudience(audience) {
  if (audience === 'admin_test' || audience === 'test') {
    return { count: 1 };
  }

  let query = supabase.from('profiles').select('id', { count: 'exact', head: true });
  query = query.eq('is_active', true);

  if (audience === 'paid') {
    query = query.neq('subscription_tier', 'trial');
  } else if (audience === 'trial') {
    query = query.eq('subscription_tier', 'trial');
  } else if (audience === 'inactive_30d') {
    const cutoff = new Date(Date.now() - 30 * 86_400_000).toISOString();
    query = query.lt('last_active_at', cutoff);
  }
  query = query.or(OPT_IN_OR_FILTER);

  const { count, error } = await query;
  if (error) throw error;
  return { count: count || 0 };
}

/**
 * Most recent broadcasts (default 25).
 */
export async function listPastBroadcasts(limit = 25) {
  const { data, error } = await supabase
    .from('email_broadcasts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

/**
 * Insert a `queued` broadcast row and return its id. The server-side
 * dispatcher then transitions it through `sending` -> `sent|partial|failed`.
 *
 * When `recipientUserIds` is passed we write it to the new
 * `recipient_user_ids` column (see docs/ADD_EMAIL_BROADCASTS_RECIPIENTS.sql)
 * and stamp `audience='custom'` so the "Past broadcasts" tab labels it.
 * For admin-only tests we write `audience='test'`.
 */
export async function createBroadcast({
  subject,
  body,
  audience,
  userId,
  recipientUserIds = null,
}) {
  const row = {
    subject,
    body,
    audience: audience || 'custom',
    recipient_count: Array.isArray(recipientUserIds) ? recipientUserIds.length : 0,
    status: 'queued',
    created_by: userId || null,
  };
  if (Array.isArray(recipientUserIds)) {
    row.recipient_user_ids = recipientUserIds;
  }
  const { data, error } = await supabase
    .from('email_broadcasts')
    .insert(row)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/**
 * Trigger the server-side dispatcher. Returns the parsed JSON response.
 *
 * Two mutually-exclusive modes:
 *   - testMode: true                 -> server sends to the current admin
 *                                       only (never fans out to ADMIN_EMAILS).
 *   - recipientUserIds: uuid[]       -> server loads those profiles and
 *                                       sends to the opted-in subset.
 */
export async function dispatchBroadcast({
  broadcastId,
  subject,
  body,
  accessToken,
  recipientUserIds = null,
  testMode = false,
}) {
  const payload = {
    broadcast_id: broadcastId,
    subject,
    body,
  };
  if (testMode) {
    payload.test_mode = true;
  } else if (Array.isArray(recipientUserIds)) {
    payload.recipient_user_ids = recipientUserIds;
  }

  const resp = await fetch('/api/admin-broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(json?.error || `HTTP ${resp.status}`);
  }
  return json;
}

/**
 * Admin-only health probe: single test email through the real send path.
 */
export async function sendTestEmail({ to, accessToken }) {
  const url = `/api/test-email?to=${encodeURIComponent(to)}`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(json?.error || `HTTP ${resp.status}`);
  }
  return json;
}
