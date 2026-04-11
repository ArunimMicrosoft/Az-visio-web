// Activity Tracker — lightweight, non-blocking user activity tracking
import { supabase } from './supabase';

let lastActiveUpdate = 0;

export function trackActive(userId) {
  if (!userId) return;
  var now = Date.now();
  if (now - lastActiveUpdate < 300000) return; // 5 min debounce
  lastActiveUpdate = now;
  supabase.from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', userId)
    .then(function(r) { if (r.error) console.warn('trackActive failed:', r.error.message); });
}

export function trackIncrement(userId, column) {
  if (!userId || !column) return;
  supabase.from('profiles').select('*').eq('id', userId).single()
    .then(function(r) {
      if (r.error || !r.data) { console.warn('trackIncrement select failed:', column, r.error?.message); return; }
      if (r.data[column] === undefined) { console.warn('trackIncrement: column', column, 'does not exist in profiles'); return; }
      var val = (r.data[column] || 0) + 1;
      var update = {};
      update[column] = val;
      supabase.from('profiles').update(update).eq('id', userId)
        .then(function(r2) { if (r2.error) console.warn('trackIncrement update failed:', column, r2.error.message); });
    });
}

export function trackExport(userId, type) {
  trackIncrement(userId, 'total_exports');
  var map = { terraform: 'tf_exports', bicep: 'bicep_exports', arm: 'arm_exports', png: 'png_exports', pdf: 'pdf_exports' };
  if (map[type]) trackIncrement(userId, map[type]);
}

export function trackTemplateUsed(userId) { trackIncrement(userId, 'templates_used'); }
export function trackValidation(userId) { trackIncrement(userId, 'validations_run'); }
export function trackCloudSave(userId) { trackIncrement(userId, 'cloud_saves'); }
export function trackLogin(userId) { trackIncrement(userId, 'login_count'); }

export function trackReferral(userId) {
  if (!userId || !document.referrer) return;
  supabase.from('profiles').select('referral_source').eq('id', userId).single()
    .then(function(r) {
      if (r.data && !r.data.referral_source) {
        supabase.from('profiles').update({ referral_source: document.referrer }).eq('id', userId);
      }
    });
}

export async function saveAdminNote(userId, note) {
  var r = await supabase.from('profiles').update({ admin_notes: note }).eq('id', userId);
  if (r.error) throw r.error;
}
