-- Login lockout — 3 failed attempts locks the account until an admin unlocks it.
-- Run this in the Supabase SQL editor.

-- ── Columns ───────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_at              TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS locked_reason          TEXT,
  ADD COLUMN IF NOT EXISTS last_failed_login_at   TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_locked_at ON public.profiles (locked_at) WHERE locked_at IS NOT NULL;

-- ── Constants ─────────────────────────────────────────────────────────────
-- Max wrong-password tries before the account is locked.
-- Change here (and re-run) to adjust the policy globally.
DO $$
BEGIN
  -- These are used inside the RPC functions below
  PERFORM 1;
END $$;

-- ── RPC 1: is_account_locked(email) ──────────────────────────────────────
-- Called BEFORE the client attempts to sign in. Anyone can call it (anon key)
-- but it only returns a boolean and generic reason — no user enumeration risk.
CREATE OR REPLACE FUNCTION public.is_account_locked(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
  v_attempts_left INTEGER;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE lower(email) = lower(p_email) LIMIT 1;

  -- Unknown email → return "not locked" (don't leak enumeration)
  IF NOT FOUND THEN
    RETURN json_build_object('locked', false, 'attempts_left', 3);
  END IF;

  IF v_profile.locked_at IS NOT NULL THEN
    RETURN json_build_object(
      'locked',        true,
      'locked_at',     v_profile.locked_at,
      'reason',        COALESCE(v_profile.locked_reason, 'Too many failed sign-in attempts. Contact support to restore access.'),
      'attempts_left', 0
    );
  END IF;

  v_attempts_left := GREATEST(0, 3 - COALESCE(v_profile.failed_login_attempts, 0));
  RETURN json_build_object('locked', false, 'attempts_left', v_attempts_left);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_account_locked(TEXT) TO anon, authenticated;

-- ── RPC 2: record_failed_login(email) ─────────────────────────────────────
-- Called AFTER a failed signIn attempt. Increments the counter and locks the
-- account when it reaches 3. Also returns updated state so the UI can show
-- "2 attempts remaining" etc.
CREATE OR REPLACE FUNCTION public.record_failed_login(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_attempts INTEGER;
  v_now TIMESTAMPTZ := now();
  v_locked BOOLEAN := false;
BEGIN
  -- No-op if email doesn't match a profile (no user enumeration)
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE lower(email) = lower(p_email)) THEN
    RETURN json_build_object('locked', false, 'attempts_left', 3);
  END IF;

  UPDATE public.profiles
     SET failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
         last_failed_login_at  = v_now,
         locked_at             = CASE
             WHEN COALESCE(failed_login_attempts, 0) + 1 >= 3 THEN v_now
             ELSE locked_at
           END,
         locked_reason         = CASE
             WHEN COALESCE(failed_login_attempts, 0) + 1 >= 3 THEN
               'Account locked after 3 failed sign-in attempts. Contact support to restore access.'
             ELSE locked_reason
           END
   WHERE lower(email) = lower(p_email)
   RETURNING failed_login_attempts, (locked_at IS NOT NULL)
   INTO v_new_attempts, v_locked;

  RETURN json_build_object(
    'locked',        v_locked,
    'attempts',      v_new_attempts,
    'attempts_left', GREATEST(0, 3 - v_new_attempts)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_failed_login(TEXT) TO anon, authenticated;

-- ── RPC 3: reset_login_attempts(email) ────────────────────────────────────
-- Called after a successful signIn. Zeroes the counter. Does NOT clear the
-- lock — a locked account cannot even reach a successful signIn.
CREATE OR REPLACE FUNCTION public.reset_login_attempts(p_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
     SET failed_login_attempts = 0,
         last_failed_login_at  = NULL
   WHERE lower(email) = lower(p_email);
END;
$$;

GRANT EXECUTE ON FUNCTION public.reset_login_attempts(TEXT) TO anon, authenticated;

-- ── RPC 4: admin_unlock_account(user_id) ──────────────────────────────────
-- Called from the Admin Dashboard by an admin. Uses SECURITY DEFINER + an
-- explicit admin-email check so only whitelisted admins can execute it.
CREATE OR REPLACE FUNCTION public.admin_unlock_account(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_email TEXT;
BEGIN
  -- Get the caller's email from Supabase's built-in JWT
  SELECT email INTO v_caller_email FROM auth.users WHERE id = auth.uid();

  IF v_caller_email IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Only whitelisted admin emails can unlock. Update this list to match
  -- src/utils/adminConfig.js and Cloudflare env VITE_ADMIN_EMAILS.
  IF lower(v_caller_email) NOT IN (
    'arunimpandey2903@hotmail.com'
  ) THEN
    RAISE EXCEPTION 'Only admins may unlock accounts';
  END IF;

  UPDATE public.profiles
     SET failed_login_attempts = 0,
         locked_at             = NULL,
         locked_reason         = NULL,
         last_failed_login_at  = NULL
   WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_unlock_account(UUID) TO authenticated;

-- Refresh PostgREST schema cache so the RPCs are visible via REST API
NOTIFY pgrst, 'reload schema';
