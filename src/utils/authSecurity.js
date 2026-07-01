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
 * Get combined subscription status for ANY tier (trial + starter + pro + enterprise).
 * This is the single source of truth for "can this user access the app right now?"
 *
 * Returns { tier, isHardExpired, expiresAt, daysRemaining, kind }
 *   kind: 'admin' | 'trial' | 'paid' | 'unknown'
 *   isHardExpired: TRUE ⇒ user must renew before accessing /app
 */
export function getSubscriptionStatus(user) {
  if (!user) return { tier: 'none', isHardExpired: true, kind: 'unknown' };

  // Admins never expire
  if (isAdminUser(user)) {
    return { tier: 'enterprise', isHardExpired: false, kind: 'admin' };
  }

  const tier = user.subscriptionTier || 'trial';

  // Trial tier — reuse existing logic
  if (tier === 'trial') {
    const trial = getTrialStatus(user);
    return {
      tier: 'trial',
      isHardExpired: !!trial.isHardExpired,
      expiresAt: trial.expiresAt,
      daysRemaining: trial.daysRemaining ?? 0,
      kind: 'trial',
    };
  }

  // Paid tiers — check subscriptionExpiresAt
  const exp = user.subscriptionExpiresAt;
  if (!exp) {
    // Legacy paid accounts with no expiry recorded — treat as active but flag
    return {
      tier,
      isHardExpired: false,
      expiresAt: null,
      daysRemaining: null,
      kind: 'paid',
    };
  }

  const now = Date.now();
  const expTs = new Date(exp).getTime();
  if (Number.isNaN(expTs)) {
    return { tier, isHardExpired: false, expiresAt: exp, kind: 'paid' };
  }

  const isExpired = now > expTs;
  const daysRemaining = Math.ceil((expTs - now) / (24 * 60 * 60 * 1000));

  return {
    tier,
    isHardExpired: isExpired,
    expiresAt: exp,
    daysRemaining: Math.max(0, daysRemaining),
    kind: 'paid',
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

/**
 * Check minimum tier required for a feature
 * Tier order: trial < starter < professional < enterprise
 */
export function hasTier(user, minTier) {
  if (isAdminUser(user)) return true;
  const order = { trial: 0, starter: 1, professional: 2, enterprise: 3 };
  const userTier = order[user?.subscriptionTier || 'trial'] || 0;
  const required = order[minTier] || 0;
  return userTier >= required;
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

// ============================================================
// Architecture Discovery quotas
// ============================================================

// Per-plan Discovery limits.
//   trial        → 2 total (lifetime, no reset)
//   starter      → 10 per calendar-30-day cycle
//   professional → 100 per calendar-30-day cycle
//   enterprise   → unlimited
// null limit == unlimited.
export const DISCOVERY_LIMITS = {
  trial:        { limit: 2,    period: 'lifetime' },
  starter:      { limit: 10,   period: 'monthly'  },
  professional: { limit: 100,  period: 'monthly'  },
  enterprise:   { limit: null, period: 'unlimited' },
};

/**
 * Compute a user's current Discovery quota state (pure function).
 * @returns { allowed, used, limit, remaining, isUnlimited, period, resetAt, tier }
 */
export function getDiscoveryStatus(user) {
  if (!user) {
    return { allowed: false, used: 0, limit: 0, remaining: 0, isUnlimited: false, period: 'none', tier: 'none' };
  }
  if (isAdminUser(user)) {
    return { allowed: true, used: user.discoveriesUsed || 0, limit: null, remaining: Infinity, isUnlimited: true, period: 'unlimited', tier: 'admin' };
  }

  const tier = user.subscriptionTier || 'trial';
  const cfg  = DISCOVERY_LIMITS[tier] || DISCOVERY_LIMITS.trial;

  // Unlimited plans
  if (cfg.limit == null) {
    return { allowed: true, used: user.discoveriesUsed || 0, limit: null, remaining: Infinity, isUnlimited: true, period: cfg.period, tier };
  }

  // Determine effective "used" — for monthly plans, count resets when the cycle ends
  const now = Date.now();
  const resetTs = user.discoveriesResetAt ? new Date(user.discoveriesResetAt).getTime() : 0;
  const cycleExpired = cfg.period === 'monthly' && resetTs > 0 && now > resetTs;
  const used = cycleExpired ? 0 : (user.discoveriesUsed || 0);
  const remaining = Math.max(0, cfg.limit - used);

  return {
    allowed:  remaining > 0,
    used,
    limit:    cfg.limit,
    remaining,
    isUnlimited: false,
    period:   cfg.period,
    resetAt:  cfg.period === 'monthly' ? user.discoveriesResetAt : null,
    tier,
  };
}

/**
 * Increment a user's Discovery counter in Supabase.
 * Handles monthly cycle reset when the current cycle has expired.
 */
export async function recordDiscoveryUse(user) {
  if (!user || !user.id) return { success: false };
  if (isAdminUser(user)) return { success: true };

  const tier = user.subscriptionTier || 'trial';
  const cfg  = DISCOVERY_LIMITS[tier] || DISCOVERY_LIMITS.trial;
  if (cfg.limit == null) return { success: true };

  const now = Date.now();
  const resetTs = user.discoveriesResetAt ? new Date(user.discoveriesResetAt).getTime() : 0;
  const cycleExpired = cfg.period === 'monthly' && resetTs > 0 && now > resetTs;

  // Compute next values
  let nextUsed;
  let nextResetAt;
  if (cfg.period === 'lifetime') {
    nextUsed = (user.discoveriesUsed || 0) + 1;
    nextResetAt = user.discoveriesResetAt || null; // never used
  } else {
    if (cycleExpired || !resetTs) {
      nextUsed = 1;
      nextResetAt = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else {
      nextUsed = (user.discoveriesUsed || 0) + 1;
      nextResetAt = user.discoveriesResetAt;
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      discoveries_used: nextUsed,
      discoveries_reset_at: nextResetAt,
    })
    .eq('id', user.id);

  if (error) {
    // Column-missing → tell caller to run the SQL migration
    if (error.code === '42703') {
      console.warn('discoveries_used column missing. Run docs/ADD_DISCOVERY_TRACKING.sql');
      return { success: false, needsMigration: true };
    }
    console.error('recordDiscoveryUse error:', error);
    return { success: false };
  }
  return { success: true, used: nextUsed, resetAt: nextResetAt };
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
