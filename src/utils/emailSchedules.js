// Client helpers for the Admin -> Scheduled Emails tab.
//
// Every DB call goes through the Supabase client (RLS enforces admin-only
// access). The /api/admin-run-schedule endpoint requires a bearer token in
// the admin allowlist, so a non-admin opening this file in devtools and
// calling the exports will fail server-side.

import { supabase } from './supabase';

// Shared with functions/_shared/cadence.js — keep the keys in sync.
// Pseudo-value used only by the admin UI — never written to the DB. When the
// admin picks this in the cadence dropdown, the save handler translates it to
// { enabled: false } while preserving the previously-set real cadence so the
// schedule can be resumed later without losing its config.
export const PAUSED_CADENCE_VALUE = '__paused__';

export const CADENCE_OPTIONS = [
  { value: PAUSED_CADENCE_VALUE, label: '⏸ Paused — stop sending' },
  { value: 'weekly_mon_09',  label: 'Weekly — Monday 09:00 UTC' },
  { value: 'weekly_fri_17',  label: 'Weekly — Friday 17:00 UTC' },
  { value: 'daily_09',       label: 'Daily — 09:00 UTC' },
  { value: 'monthly_1st_09', label: 'Monthly — 1st at 09:00 UTC' },
  { value: 'custom',         label: 'Custom (cron expression)' },
  // Fired by application events (e.g. user signup) rather than the
  // hourly cron. The dispatcher in functions/api/cron/scheduled-emails.js
  // skips any row with this cadence.
  { value: 'transactional',  label: 'Transactional — fires on app events' },
];

export const CADENCE_LABELS = CADENCE_OPTIONS.reduce((acc, o) => {
  acc[o.value] = o.label;
  return acc;
}, {});

export function cadenceFriendly(row) {
  if (!row) return '—';
  if (row.cadence === 'custom') {
    return row.custom_cron ? `Custom: ${row.custom_cron}` : 'Custom (not configured)';
  }
  if (row.cadence === 'transactional') {
    // Mapped per-kind in the admin UI; fall back to a generic label here.
    return 'Transactional (app event)';
  }
  return CADENCE_LABELS[row.cadence] || row.cadence;
}

export async function listSchedules() {
  const { data, error } = await supabase
    .from('email_schedules')
    .select('*')
    .order('kind', { ascending: true });
  if (error) throw error;
  return data || [];
}

/**
 * Patch one schedule row. `updates` is passed through directly.
 */
export async function updateSchedule(id, updates, userId) {
  const patch = { ...updates };
  if (userId) patch.updated_by = userId;
  const { data, error } = await supabase
    .from('email_schedules')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/**
 * Trigger `/api/admin-run-schedule` for an immediate dispatch. Returns the
 * parsed JSON response.
 */
export async function runScheduleNow({ kind, accessToken, dryRun, email, force }) {
  const resp = await fetch('/api/admin-run-schedule', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      kind,
      dryRun: !!dryRun,
      email: email || undefined,
      force: !!force,
    }),
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(json?.error || `HTTP ${resp.status}`);
  }
  return json;
}
