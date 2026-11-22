// Client helpers for the Admin Email Broadcast tab.
//
// Audience filters below mirror functions/api/admin-broadcast.js exactly.
// If you change a filter here, change it there too.

import { supabase } from './supabase';
import { ADMIN_EMAILS } from './adminConfig';

export const AUDIENCE_LABELS = {
  all:           'All users (opted in)',
  paid:          'Paid only',
  trial:         'Trial only',
  inactive_30d:  'Inactive 30+ days',
  admin_test:    'Admin test (just me)',
};

const OPT_IN_OR_FILTER =
  'email_preferences.is.null,email_preferences->>weekly_digest.not.eq.false';

/**
 * Return `{ count }` for the given audience. Uses PostgREST's count-only
 * mode (head=true) so no row data is transferred.
 */
export async function countAudience(audience) {
  if (audience === 'admin_test') {
    return { count: ADMIN_EMAILS.length };
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

  // Honour opt-out: include rows whose email_preferences is NULL or whose
  // weekly_digest key is not 'false'.
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
 */
export async function createBroadcast({ subject, body, audience, userId }) {
  const { data, error } = await supabase
    .from('email_broadcasts')
    .insert({
      subject,
      body,
      audience,
      recipient_count: 0,
      status: 'queued',
      created_by: userId || null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/**
 * Trigger the server-side dispatcher. Returns the parsed JSON response.
 */
export async function dispatchBroadcast({ broadcastId, audience, subject, body, accessToken }) {
  const resp = await fetch('/api/admin-broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      broadcast_id: broadcastId,
      audience,
      subject,
      body,
    }),
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
