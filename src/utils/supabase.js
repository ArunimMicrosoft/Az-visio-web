// Supabase Client Configuration
// Handles authentication, user profiles, and database access

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
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

  if (error) throw error;

  // Create profile row in profiles table
  if (data.user) {
    const now = new Date().toISOString();
    const trialExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      role: email.toLowerCase() === 'admin@azuredesigner.com' ? 'admin' : 'architect',
      subscription_tier: 'trial',
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
  }

  return data;
}

/**
 * Sign in an existing user with email and password
 */
export async function supabaseSignIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Update last_login in profiles
  if (data.user) {
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id);
  }

  return data;
}

/**
 * Sign out the current user
 */
export async function supabaseSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
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

  return {
    id: supabaseUser.id,
    email: profile.email || supabaseUser.email,
    name: profile.name || supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
    role: profile.role || 'architect',
    subscriptionTier: profile.subscription_tier || 'trial',
    trialStartDate: profile.trial_start_date,
    trialExpiresAt: profile.trial_expires_at,
    trialExportsUsed: profile.trial_exports_used || 0,
    diagramsCreated: profile.diagrams_created || 0,
    createdAt: profile.created_at,
    lastLogin: profile.last_login,
    isActive: profile.is_active !== false,
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
