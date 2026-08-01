-- Adds an email_preferences JSONB column to profiles so users can opt out of
-- individual email types (weekly_digest, drift_alerts, etc.) without deleting
-- their account or breaking the auth flow.
--
-- Safe to run on live DB — uses IF NOT EXISTS.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{"weekly_digest": true}'::jsonb;

-- Index on the weekly_digest key for fast batch reads by the cron
CREATE INDEX IF NOT EXISTS profiles_weekly_digest_idx
  ON public.profiles ((email_preferences->>'weekly_digest'));

-- Verify — should show all users with defaults where the column was newly added
SELECT
  count(*) AS total_users,
  count(*) FILTER (WHERE email_preferences->>'weekly_digest' = 'false') AS opted_out
FROM public.profiles;
