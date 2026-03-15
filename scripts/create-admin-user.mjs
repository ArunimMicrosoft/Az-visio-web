/**
 * ONE-TIME ADMIN SETUP SCRIPT
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates / fixes admin user profiles in Supabase.
 * Handles both the primary admin and the fallback admin@azuredesigner.com.
 *
 * Usage (run once from project root):
 *   node scripts/create-admin-user.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dir, '..', '.env') });

const SUPABASE_URL      = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌  Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

// ── Admin accounts ────────────────────────────────────────────────────────────
const ADMIN_ACCOUNTS = [
  {
    email:    'arunimpandey2903@hotmail.com',
    password: 'Admin@AzureDesigner2026!',
    name:     'Arunim Pandey (Admin)',
  },
  {
    // Fallback admin — always works even if hotmail account has issues
    email:    'admin@azuredesigner.com',
    password: 'AdminAzure@2026!',
    name:     'Azure Designer Admin',
  },
];

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function ensureAdmin({ email, password, name }) {
  console.log(`\n▶  Processing: ${email}`);

  // Try sign-in first (user may already exist)
  const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
  let userId = signInData?.user?.id;

  if (userId) {
    console.log(`   ✅ Auth user exists (id: ${userId})`);
  } else {
    // Sign-up new user
    console.log(`   Not found — creating auth account...`);
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (signUpErr) {
      console.error(`   ❌  Sign-up failed: ${signUpErr.message}`);
      console.log(`   ℹ️  If "User already registered": go to Supabase → Auth → Users`);
      console.log(`       find ${email} → Send password reset / update password manually`);
      return false;
    }

    userId = signUpData.user?.id;
    if (!userId) {
      console.error(`   ❌  No user id — email confirmation may be required.`);
      console.log(`   ℹ️  Supabase → Auth → Settings → disable "Enable email confirmations"`);
      return false;
    }
    console.log(`   ✅ Auth account created (id: ${userId})`);
  }

  // Upsert profile row → admin + enterprise
  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: userId,
    email: email.toLowerCase(),
    name,
    role: 'admin',
    subscription_tier: 'enterprise',
    trial_exports_used: 0,
    diagrams_created: 0,
    is_active: true,
    created_at: new Date().toISOString(),
  }, { onConflict: 'id' });

  if (profileErr) {
    console.error(`   ❌  Profile upsert failed: ${profileErr.message}`);
    return false;
  }

  console.log(`   ✅ Profile: role=admin, plan=enterprise`);
  return true;
}

async function run() {
  console.log('🔧  Azure Architecture Designer — Admin Setup');
  console.log('─'.repeat(52));

  let allOk = true;
  for (const account of ADMIN_ACCOUNTS) {
    const ok = await ensureAdmin(account);
    if (!ok) allOk = false;
  }

  console.log('\n' + '─'.repeat(52));
  if (allOk) {
    console.log('🎉  All admin accounts ready!\n');
    ADMIN_ACCOUNTS.forEach(a => {
      console.log(`   📧 ${a.email}`);
      console.log(`   🔑 ${a.password}\n`);
    });
    console.log('⚠️   Change passwords after first login!');
  } else {
    console.log('⚠️   Some accounts had issues — check output above.');
    console.log('     Try creating admin@azuredesigner.com manually in Supabase dashboard:');
    console.log('     Auth → Users → "Invite user" or "Add user"');
    console.log('     Then run this script again.');
  }
  console.log('─'.repeat(52));
  process.exit(0);
}

run().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
