// filepath: c:\Users\labadmin\Desktop\python-mini\Az visio web\src\utils\authSecurity.js
// Trial & Subscription Management
// Pure functions that work with the camelCase user object from AuthContext
// DB writes go through Supabase 'profiles' table

import { supabase } from './supabase';
import { isAdminEmail } from './adminConfig';

// ============================================================
// Trial Management Functions
// ============================================================

/**
 * Check if user is an admin/demo account
 */
export function isAdminUser(user) {
  return user && isAdminEmail(user.email);
}

/**
 * Get the trial status for a user (pure function, no DB call)
 */
export function getTrialStatus(user) {
  // Admin accounts always have full access — never show trial limits
  if (isAdminUser(user)) return { isTrial: false };

  if (!user || user.subscriptionTier !== 'trial') {
    return { isTrial: false };
  }

  const now = Date.now();
  const expiresAt = new Date(user.trialExpiresAt).getTime();

  const daysRemaining = Math.ceil((expiresAt - now) / (24 * 60 * 60 * 1000));
  const isExpired    = now > expiresAt;  // Hard-expired immediately after 7 days — no grace
  const isHardExpired = isExpired;

  return {
    isTrial: true,
    isActive: !isHardExpired,
    isExpired,
    isGracePeriod: false,           // No grace period
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
  if (isAdminUser(user)) return { allowed: true, unlimited: true };
  const trialStatus = getTrialStatus(user);
  if (trialStatus.isTrial) {
    if (trialStatus.isHardExpired) return { allowed: false, reason: 'Trial expired. Please upgrade to continue.', requiresUpgrade: true };
    if (trialStatus.exportsRemaining <= 0) return { allowed: false, reason: 'PNG export limit reached (5/5). Upgrade for unlimited exports.', requiresUpgrade: true };
    return { allowed: true, remaining: trialStatus.exportsRemaining };
  }
  // Starter: 50 PNG exports
  if (user?.subscriptionTier === 'starter') {
    const used = user.trialExportsUsed || 0;
    if (used >= 50) return { allowed: false, reason: 'Starter PNG limit reached (50/50). Upgrade to Professional for unlimited.', requiresUpgrade: true };
    return { allowed: true, remaining: 50 - used };
  }
  return { allowed: true, unlimited: true };
}

/**
 * Check if user can create a new diagram (pure function)
 */
export function canCreateDiagram(user) {
  if (isAdminUser(user)) return { allowed: true, unlimited: true };
  const trialStatus = getTrialStatus(user);
  if (trialStatus.isTrial) {
    if (trialStatus.isHardExpired) return { allowed: false, reason: 'Trial expired. Please upgrade to continue.', requiresUpgrade: true };
    if (trialStatus.diagramsRemaining <= 0) return { allowed: false, reason: 'Diagram limit reached (3/3). Upgrade for unlimited diagrams.', requiresUpgrade: true };
    return { allowed: true, remaining: trialStatus.diagramsRemaining };
  }
  // Starter: 25 diagrams
  if (user?.subscriptionTier === 'starter') {
    const used = user.diagramsCreated || 0;
    if (used >= 25) return { allowed: false, reason: 'Starter diagram limit reached (25/25). Upgrade to Professional for unlimited.', requiresUpgrade: true };
    return { allowed: true, remaining: 25 - used };
  }
  return { allowed: true, unlimited: true };
}

/**
 * Check if user can use IaC exports (Terraform/Bicep/ARM) — Professional+ only
 */
export function canExportIaC(user) {
  if (isAdminUser(user)) return true;
  const tier = user?.subscriptionTier || 'trial';
  return tier === 'professional' || tier === 'enterprise';
}

// ============================================================
// DB Write Functions (Supabase)
// ============================================================

/**
 * Record a PNG export in Supabase (increments counter)
 */
export async function recordPNGExport(userId) {
  // Atomic increment via rpc if available, else SELECT+UPDATE
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

export async function recordDiagramCreation(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('diagrams_created')
    .eq('id', userId)
    .single();
  if (data) {
    const { error } = await supabase
      .from('profiles')
      .update({ diagrams_created: (data.diagrams_created || 0) + 1 })
      .eq('id', userId);
    if (error) console.error('recordDiagramCreation error:', error);
  }
}

/**
 * Upgrade user subscription tier in Supabase.
 * Sets subscription_tier, upgraded_at, and subscription_expires_at (30 days from now).
 */
export async function upgradeToPaid(userId, tier) {
  const now = new Date();
  // Try with subscription_expires_at first; fall back without it if column missing
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  let { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: tier,
      upgraded_at: now.toISOString(),
      subscription_expires_at: expiresAt,
    })
    .eq('id', userId);

  if (error && error.code === '42703') {
    // Column doesn't exist yet — update without it
    console.warn('subscription_expires_at column missing, updating without it');
    const result = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        upgraded_at: now.toISOString(),
      })
      .eq('id', userId);
    error = result.error;
  }

  if (error) {
    console.error('upgradeToPaid error:', error);
  }
  return !error;
}
