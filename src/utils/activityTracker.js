// Activity Tracker — lightweight, non-blocking user activity tracking
// All updates are fire-and-forget (never blocks UI or throws)

import { supabase } from './supabase';

// Debounce last_active_at updates to avoid spamming DB (max once per 5 min)
let lastActiveUpdate = 0;
const ACTIVE_DEBOUNCE = 5 * 60 * 1000;

/**
 * Update last_active_at timestamp (debounced)
 */
export function trackActive(userId) {
  if (!userId) return;
  const now = Date.now();
  if (now - lastActiveUpdate < ACTIVE_DEBOUNCE) return;
  lastActiveUpdate = now;
  supabase.from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', userId)
    .then(() => {})
    .catch(() => {});
}

/**
 * Increment a counter column on the profile (non-blocking)
 */
export function trackIncrement(userId, column) {
  if (!userId || !column) return;
  // Use raw SQL increment to avoid race conditions
  supabase.rpc('increment_profile_counter', { user_id: userId, counter_name: column })
    .then(() => {})
    .catch(() => {
      // Fallback: read-then-write if RPC doesn't exist
      supabase.from('profiles').select(column).eq('id', userId).single()
        .then(({ data }) => {
          if (data) {
            const val = (data[column] || 0) + 1;
            supabase.from('profiles').update({ [column]: val }).eq('id', userId)
              .then(() => {}).catch(() => {});
          }
        }).catch(() => {});
    });
}

/**
 * Track a specific export type
 */
export function trackExport(userId, exportType) {
  trackIncrement(userId, 'total_exports');
  const columnMap = {
    terraform: 'tf_exports',
    bicep: 'bicep_exports',
    arm: 'arm_exports',
    png: 'png_exports',
    pdf: 'pdf_exports',
  };
  if (columnMap[exportType]) {
    trackIncrement(userId, columnMap[exportType]);
  }
}

/**
 * Track template usage
 */
export function trackTemplateUsed(userId) {
  trackIncrement(userId, 'templates_used');
}

/**
 * Track validation run
 */
export function trackValidation(userId) {
  trackIncrement(userId, 'validations_run');
}

/**
 * Track cloud save
 */
export function trackCloudSave(userId) {
  trackIncrement(userId, 'cloud_saves');
}

/**
 * Increment login count
 */
export function trackLogin(userId) {
  trackIncrement(userId, 'login_count');
}

/**
 * Save referral source (only once, on first visit)
 */
export function trackReferral(userId) {
  if (!userId) return;
  const ref = document.referrer;
  if (!ref) return;
  // Only set if not already set
  supabase.from('profiles').select('referral_source').eq('id', userId).single()
    .then(({ data }) => {
      if (data && !data.referral_source) {
        supabase.from('profiles').update({ referral_source: ref }).eq('id', userId)
          .then(() => {}).catch(() => {});
      }
    }).catch(() => {});
}

/**
 * Save admin note for a user
 */
export async function saveAdminNote(userId, note) {
  const { error } = await supabase.from('profiles')
    .update({ admin_notes: note })
    .eq('id', userId);
  if (error) throw error;
}
