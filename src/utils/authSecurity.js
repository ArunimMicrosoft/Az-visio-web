// filepath: c:\Users\labadmin\Desktop\python-mini\Az visio web\src\utils\authSecurity.js
// Trial & Subscription Management
// Pure functions that work with the camelCase user object from AuthContext
// DB writes go through Supabase 'profiles' table

import { supabase } from './supabase';

// ============================================================
// Trial Management Functions
// ============================================================

/**
 * Get the trial status for a user (pure function, no DB call)
 */
export function getTrialStatus(user) {
  if (!user || user.subscriptionTier !== 'trial') {
    return { isTrial: false };
  }

  const now = Date.now();
  const expiresAt = new Date(user.trialExpiresAt).getTime();
  const gracePeriodEnd = expiresAt + 2 * 24 * 60 * 60 * 1000; // 2 days grace

  const daysRemaining = Math.ceil((expiresAt - now) / (24 * 60 * 60 * 1000));
  const isExpired = now > expiresAt;
  const isGracePeriod = isExpired && now <= gracePeriodEnd;
  const isHardExpired = now > gracePeriodEnd;

  return {
    isTrial: true,
    isActive: !isHardExpired,
    isExpired,
    isGracePeriod,
    isHardExpired,
    daysRemaining: Math.max(0, daysRemaining),
    exportsRemaining: Math.max(0, 5 - (user.trialExportsUsed || 0)),
    diagramsRemaining: Math.max(0, 3 - (user.diagramsCreated || 0)),
    expiresAt: user.trialExpiresAt,
  };
}

/**
 * Check if user can export PNG (pure function)
 */
export function canExportPNG(user) {
  const trialStatus = getTrialStatus(user);
  if (!trialStatus.isTrial) return { allowed: true, unlimited: true };
  if (trialStatus.isHardExpired) return { allowed: false, reason: 'Trial expired. Please upgrade to continue.', requiresUpgrade: true };
  if (trialStatus.exportsRemaining <= 0) return { allowed: false, reason: 'PNG export limit reached (5/5). Upgrade for unlimited exports.', requiresUpgrade: true };
  return { allowed: true, remaining: trialStatus.exportsRemaining, isGracePeriod: trialStatus.isGracePeriod };
}

/**
 * Check if user can create a new diagram (pure function)
 */
export function canCreateDiagram(user) {
  const trialStatus = getTrialStatus(user);
  if (!trialStatus.isTrial) return { allowed: true, unlimited: true };
  if (trialStatus.isHardExpired) return { allowed: false, reason: 'Trial expired. Please upgrade to continue.', requiresUpgrade: true };
  if (trialStatus.diagramsRemaining <= 0) return { allowed: false, reason: 'Diagram limit reached (3/3). Upgrade for unlimited diagrams.', requiresUpgrade: true };
  return { allowed: true, remaining: trialStatus.diagramsRemaining, isGracePeriod: trialStatus.isGracePeriod };
}

// ============================================================
// DB Write Functions (Supabase)
// ============================================================

/**
 * Record a PNG export in Supabase (increments counter)
 */
export async function recordPNGExport(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('trial_exports_used')
    .eq('id', userId)
    .single();

  if (data) {
    await supabase
      .from('profiles')
      .update({ trial_exports_used: (data.trial_exports_used || 0) + 1 })
      .eq('id', userId);
  }
}

/**
 * Record a diagram creation in Supabase (increments counter)
 */
export async function recordDiagramCreation(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('diagrams_created')
    .eq('id', userId)
    .single();

  if (data) {
    await supabase
      .from('profiles')
      .update({ diagrams_created: (data.diagrams_created || 0) + 1 })
      .eq('id', userId);
  }
}

/**
 * Upgrade user subscription tier in Supabase.
 * Sets subscription_tier, upgraded_at, and subscription_expires_at (30 days from now).
 */
export async function upgradeToPaid(userId, tier) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: tier,
      upgraded_at: now.toISOString(),
      subscription_expires_at: expiresAt.toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('upgradeToPaid error:', error);
  }
  return !error;
}
