-- Run this in Supabase SQL Editor to add user tracking columns
-- Safe to run on live DB — uses IF NOT EXISTS

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_exports INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tf_exports INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bicep_exports INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS arm_exports INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS png_exports INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pdf_exports INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS templates_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS validations_run INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cloud_saves INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_source TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- RPC function for atomic counter increment (avoids race conditions)
CREATE OR REPLACE FUNCTION increment_profile_counter(user_id UUID, counter_name TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  EXECUTE format(
    'UPDATE profiles SET %I = COALESCE(%I, 0) + 1 WHERE id = $1',
    counter_name, counter_name
  ) USING user_id;
END;
$$;
