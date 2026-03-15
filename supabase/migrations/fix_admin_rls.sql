-- ============================================================
--  FIX: Admin RLS — NO RECURSION VERSION
--  Uses SECURITY DEFINER function to prevent infinite recursion
--  Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- ============================================================
--  FIX: Admin RLS — NO RECURSION VERSION
--  Uses SECURITY DEFINER function to prevent infinite recursion
--  Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- ─────────────────────────────────────────────
-- STEP 1: Drop ALL existing policies on profiles
-- ─────────────────────────────────────────────
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'profiles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

-- ─────────────────────────────────────────────
-- STEP 2: Create SECURITY DEFINER function
-- Runs as superuser → no RLS recursion
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND email IN ('arunimpandey2903@hotmail.com', 'demo@arunimitcaffe.com')
  );
$$;

-- ─────────────────────────────────────────────
-- STEP 3: Recreate clean policies
-- ─────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own_read"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_admin_read"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "profiles_own_insert"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_own_update"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_update"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "profiles_anon_insert"
  ON public.profiles FOR INSERT TO anon
  WITH CHECK (true);

-- ─────────────────────────────────────────────
-- STEP 4: Create audit_logs table
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email         text,
  event         text NOT NULL,
  details       jsonb,
  ip_address    text,
  created_at    timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event      ON public.audit_logs (event);
CREATE INDEX IF NOT EXISTS idx_audit_logs_email      ON public.audit_logs (email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert audit logs"   ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can read all audit logs" ON public.audit_logs;

CREATE POLICY "Anyone can insert audit logs"
  ON public.audit_logs FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read all audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_admin());

-- ─────────────────────────────────────────────
-- STEP 5: Backfill missing profiles from auth.users
-- ─────────────────────────────────────────────
INSERT INTO public.profiles (
  id, email, name, role, subscription_tier,
  trial_start_date, trial_expires_at,
  trial_exports_used, diagrams_created, is_active, created_at
)
SELECT
  au.id, au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  CASE WHEN au.email IN ('arunimpandey2903@hotmail.com', 'demo@arunimitcaffe.com')
    THEN 'admin' ELSE 'architect' END,
  CASE WHEN au.email IN ('arunimpandey2903@hotmail.com', 'demo@arunimitcaffe.com')
    THEN 'enterprise' ELSE 'trial' END,
  au.created_at,
  (au.created_at + INTERVAL '7 days'),
  0, 0, true, au.created_at
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- VERIFY
-- ─────────────────────────────────────────────
SELECT email, role, subscription_tier, created_at
FROM public.profiles
ORDER BY created_at DESC;

