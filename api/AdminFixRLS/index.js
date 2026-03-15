// AdminFixRLS/index.js
// Runs the RLS fix SQL using Supabase service role key
// One-time setup endpoint — only accessible by admin emails

const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://quknseohpwzlbbisgfpi.supabase.co';
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ADMIN_EMAILS = ['arunimpandey2903@hotmail.com', 'demo@arunimitcaffe.com'];

const FIX_SQL = `
-- Drop conflicting policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read all profiles"    ON public.profiles;
  DROP POLICY IF EXISTS "Users can read own profile"      ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile"    ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile"    ON public.profiles;
  DROP POLICY IF EXISTS "Admins can update all profiles"  ON public.profiles;
  DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE email IN ('arunimpandey2903@hotmail.com','demo@arunimitcaffe.com')
    )
  );

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE email IN ('arunimpandey2903@hotmail.com','demo@arunimitcaffe.com')
    )
  );

INSERT INTO public.profiles (id, email, name, role, subscription_tier,
  trial_start_date, trial_expires_at, trial_exports_used, diagrams_created, is_active, created_at)
SELECT
  au.id, au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email,'@',1)),
  CASE WHEN au.email IN ('arunimpandey2903@hotmail.com','demo@arunimitcaffe.com') THEN 'admin' ELSE 'architect' END,
  CASE WHEN au.email IN ('arunimpandey2903@hotmail.com','demo@arunimitcaffe.com') THEN 'enterprise' ELSE 'trial' END,
  au.created_at, (au.created_at + INTERVAL '7 days'), 0, 0, true, au.created_at
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
`;

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-email',
  };
}

function supabaseRpc(sql, serviceKey) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + '/rest/v1/rpc/exec_sql');
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = async function (context, req) {
  context.res = { headers: corsHeaders() };

  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    return;
  }

  const callerEmail = (req.headers['x-admin-email'] || '').toLowerCase().trim();
  if (!ADMIN_EMAILS.includes(callerEmail)) {
    context.res.status = 403;
    context.res.body = { error: 'Forbidden' };
    return;
  }

  if (!SERVICE_KEY) {
    context.res.status = 500;
    context.res.body = {
      error: 'SUPABASE_SERVICE_ROLE_KEY not set',
      hint: 'Add it to local.settings.json and Azure Function App Settings',
    };
    return;
  }

  try {
    const result = await supabaseRpc(FIX_SQL, SERVICE_KEY);
    context.res.status = 200;
    context.res.body = { success: true, status: result.status, detail: result.body };
  } catch (err) {
    context.res.status = 500;
    context.res.body = { error: err.message };
  }
};
