/**
 * ONE-TIME ADMIN SETUP SCRIPT
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates / fixes the admin user profile in Supabase so they get full access.
 *
 * Usage (run once from project root):
 *   node scripts/create-admin-user.mjs
 *
 * Requirements: npm install @supabase/supabase-js dotenv  (already installed)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Load .env from project root
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, '..', '.env');
config({ path: envPath });

const SUPABASE_URL      = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌  Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

// ── Admin credentials ─────────────────────────────────────────────────────────
const ADMIN_EMAIL    = 'arunimpandey2903@hotmail.com';
const ADMIN_PASSWORD = 'Admin@AzureDesigner2026!';  // change after first login
const ADMIN_NAME     = "Arunim Pandey (Admin)";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log('🔧  Azure Architecture Designer — Admin Setup');
  console.log('─'.repeat(50));

  // 1. Try to sign in — if it works, user already exists
  console.log(`\n1️⃣  Checking if admin user exists: ${ADMIN_EMAIL}`);
  const { data: signInData, error: signInErr } =
    await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

  let userId;

  if (signInData?.user) {
    userId = signInData.user.id;
    console.log(`   ✅ User already exists  (id: ${userId})`);
  } else {
    // 2. Sign up
    console.log('   User not found — creating new admin account...');
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      options: { data: { name: ADMIN_NAME } },
    });

    if (signUpErr) {
      console.error('   ❌  Sign-up failed:', signUpErr.message);
      process.exit(1);
    }

    userId = signUpData.user?.id;
    if (!userId) {
      console.error('   ❌  No user id returned — check if email confirmation is required.');
      console.log('   ℹ️  In Supabase dashboard → Auth → Settings → disable "Enable email confirmations"');
      process.exit(1);
    }
    console.log(`   ✅ Admin account created (id: ${userId})`);
  }

  // 3. Upsert the profile row with admin / enterprise settings
  console.log('\n2️⃣  Upserting profile with enterprise + admin role...');
  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: userId,
    email: ADMIN_EMAIL.toLowerCase(),
    name: ADMIN_NAME,
    role: 'admin',
    subscription_tier: 'enterprise',
    trial_exports_used: 0,
    diagrams_created: 0,
    is_active: true,
    created_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  if (profileErr) {
    console.error('   ❌  Profile upsert failed:', profileErr.message);
    process.exit(1);
  }
  console.log('   ✅ Profile set: role=admin, subscription_tier=enterprise');

  // 4. Summary
  console.log('\n' + '─'.repeat(50));
  console.log('🎉  Admin user is ready!\n');
  console.log('   Email    :', ADMIN_EMAIL);
  console.log('   Password :', ADMIN_PASSWORD);
  console.log('   Role     : admin');
  console.log('   Plan     : Enterprise (full access, no watermark, no limits)');
  console.log('\n⚠️   Change the password after first login!');
  console.log('─'.repeat(50));

  process.exit(0);
}

run().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
