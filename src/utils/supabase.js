// Supabase Client Configuration
// Handles authentication, user profiles, and database access

import { createClient } from '@supabase/supabase-js';
import { isAdminEmail } from './adminConfig';

// Public Supabase credentials — these are the ANON key (designed to be in the browser).
// Hardcoded as fallback so the app works even when host env vars are not wired correctly.
// The real security boundary is Supabase Row-Level Security policies, not these values.
const FALLBACK_SUPABASE_URL = 'https://quknseohpwzlbbisgfpi.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1a25zZW9ocHd6bGJiaXNnZnBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMDcxMjQsImV4cCI6MjA4ODc4MzEyNH0.1IlN3FpRVff30GftpWnqOl1Am3bwucu54x_lW_45SpQ';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

// Create Supabase client
// Using localStorage instead of indexedDB to avoid
// "AbortError: Lock broken by another request with the 'steal' option"
// which occurs on hot-reload / multiple tabs with indexedDB locks
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: window.localStorage,
    storageKey: 'azure-arch-auth',
    flowType: 'pkce',
  },
});

/**
 * Check if Supabase is configured and available
 * @returns {boolean}
 */
export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey);
}

// ==========================================
// AUTH FUNCTIONS
// ==========================================

/**
 * Sign up a new user with email and password
 * Also creates a profile row in the `profiles` table
 */
export async function supabaseSignUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || email.split('@')[0],
      },
    },
  });

  if (error) {
    await writeAuditLog({ email, event: 'SIGNUP_FAILED', details: { reason: error.message } });
    throw error;
  }

  // Create profile row in profiles table
  if (data.user) {
    const now = new Date().toISOString();
    const trialExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const isAdminSignup = isAdminEmail(email);

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      role: isAdminSignup ? 'admin' : 'architect',
      subscription_tier: isAdminSignup ? 'enterprise' : 'trial',
      trial_start_date: now,
      trial_expires_at: trialExpiresAt,
      trial_exports_used: 0,
      diagrams_created: 0,
      is_active: true,
      created_at: now,
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    // Log successful signup
    await writeAuditLog({
      userId: data.user.id,
      email: email.toLowerCase(),
      event: 'SIGNUP',
      details: {
        name: name || email.split('@')[0],
        plan: isAdminSignup ? 'enterprise' : 'trial',
        role: isAdminSignup ? 'admin' : 'architect',
      },
    });
  }

  return data;
}

/**
 * Write an audit log entry to the audit_logs table.
 * Silently ignores errors so it never blocks normal auth flows.
 */
export async function writeAuditLog({ userId, email, event, details = null, ip = null }) {
  try {
    // Capture device/browser info automatically
    const deviceInfo = {
      userAgent: navigator.userAgent || null,
      platform: navigator.platform || null,
      language: navigator.language || null,
      screen: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      referrer: document.referrer || null,
      online: navigator.onLine,
      cookiesEnabled: navigator.cookieEnabled,
      touchDevice: 'ontouchstart' in window,
      deviceMemory: navigator.deviceMemory || null,
      cpuCores: navigator.hardwareConcurrency || null,
      colorDepth: window.screen.colorDepth || null,
      pixelRatio: window.devicePixelRatio || null,
    };

    // Try to get IP address (non-blocking, best-effort)
    let clientIp = ip;
    if (!clientIp) {
      // Try Cloudflare trace (most reliable if DNS is on Cloudflare)
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3000);
        const resp = await fetch('https://1.1.1.1/cdn-cgi/trace', { signal: controller.signal });
        clearTimeout(timer);
        if (resp.ok) {
          const text = await resp.text();
          const ipLine = text.split('\n').find(l => l.startsWith('ip='));
          if (ipLine) clientIp = ipLine.split('=')[1];
        }
      } catch (_) {}
      // Fallback: ipify
      if (!clientIp) {
        try {
          const controller2 = new AbortController();
          const timer2 = setTimeout(() => controller2.abort(), 3000);
          const resp2 = await fetch('https://api.ipify.org?format=json', { signal: controller2.signal });
          clearTimeout(timer2);
          if (resp2.ok) { const d = await resp2.json(); clientIp = d.ip; }
        } catch (_2) {}
      }
    }

    // Merge device info into details
    const fullDetails = details
      ? { ...(typeof details === 'string' ? { message: details } : details), device: deviceInfo }
      : { device: deviceInfo };

    await supabase.from('audit_logs').insert({
      user_id: userId || null,
      email: email || null,
      event,
      details: JSON.stringify(fullDetails),
      ip_address: clientIp || null,
      created_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Audit log write failed (non-blocking):', e.message);
  }
}

/**
 * Sign up a new user with email and password
 * Also creates a profile row in the `profiles` table
 */

/**
 * Sign in an existing user with email and password
 */
export async function supabaseSignIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Log failed login attempt
    await writeAuditLog({ email, event: 'LOGIN_FAILED', details: { reason: error.message } });
    throw error;
  }

  // Update last_login in profiles
  if (data.user) {
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id);

    // Log successful login
    await writeAuditLog({
      userId: data.user.id,
      email: data.user.email,
      event: 'LOGIN',
      details: { provider: 'email' },
    });
  }

  return data;
}

/**
 * Sign out the current user
 */
export async function supabaseSignOut(userId = null, email = null) {
  // Log logout before signing out (session still valid)
  if (userId || email) {
    await writeAuditLog({ userId, email, event: 'LOGOUT' });
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Send password reset email via Supabase
 */
export async function supabaseResetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  });
  if (error) {
    await writeAuditLog({ email, event: 'PASSWORD_RESET_FAILED', details: { reason: error.message } });
    throw error;
  }
  await writeAuditLog({ email, event: 'PASSWORD_RESET_REQUESTED' });
}

/**
 * Get current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// ==========================================
// PROFILE FUNCTIONS
// ==========================================

/**
 * Get user profile from the profiles table
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // If profile doesn't exist yet (e.g., migrating user), return null
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Update user profile fields
 */
export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Convert Supabase profile to the app user format
 * Maps snake_case DB columns to camelCase used in the app
 */
export function profileToAppUser(supabaseUser, profile) {
  if (!profile) return null;

  // Admin/demo accounts always get enterprise tier regardless of DB value
  const isAdmin = isAdminEmail((profile.email || supabaseUser.email || ''));

  // Compute 30-day expiry from upgraded_at if subscription_expires_at column missing
  let subscriptionExpiresAt = profile.subscription_expires_at || null;
  if (!subscriptionExpiresAt && profile.upgraded_at && profile.subscription_tier !== 'trial') {
    subscriptionExpiresAt = new Date(
      new Date(profile.upgraded_at).getTime() + 30 * 24 * 60 * 60 * 1000
    ).toISOString();
  }

  return {
    id: supabaseUser.id,
    email: profile.email || supabaseUser.email,
    name: profile.name || supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
    role: isAdmin ? 'admin' : (profile.role || 'architect'),
    subscriptionTier: isAdmin ? 'enterprise' : (profile.subscription_tier || 'trial'),
    subscriptionExpiresAt: isAdmin ? null : subscriptionExpiresAt,
    upgradedAt: profile.upgraded_at || null,
    trialStartDate: profile.trial_start_date,
    trialExpiresAt: profile.trial_expires_at,
    trialExportsUsed: profile.trial_exports_used || 0,
    diagramsCreated: profile.diagrams_created || 0,
    discoveriesUsed: profile.discoveries_used || 0,
    discoveriesResetAt: profile.discoveries_reset_at || null,
    createdAt: profile.created_at,
    lastLogin: profile.last_login,
    isActive: profile.is_active !== false,
    isAdmin,
  };
}

// ==========================================
// TRIAL & SUBSCRIPTION HELPERS (DB-backed)
// ==========================================

/**
 * Record a PNG export for a user (increment counter in DB)
 */
export async function recordExportInDB(userId) {
  const profile = await getUserProfile(userId);
  if (profile && profile.subscription_tier === 'trial') {
    await updateUserProfile(userId, {
      trial_exports_used: (profile.trial_exports_used || 0) + 1,
    });
  }
}

/**
 * Record a diagram creation for a user (increment counter in DB)
 */
export async function recordDiagramInDB(userId) {
  const profile = await getUserProfile(userId);
  if (profile && profile.subscription_tier === 'trial') {
    await updateUserProfile(userId, {
      diagrams_created: (profile.diagrams_created || 0) + 1,
    });
  }
}

/**
 * Upgrade user subscription tier in the DB
 */
export async function upgradeSubscriptionInDB(userId, tier) {
  await updateUserProfile(userId, {
    subscription_tier: tier,
    upgraded_at: new Date().toISOString(),
  });
}

/**
 * Listen for auth state changes
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

export { supabase };
export default supabase;
