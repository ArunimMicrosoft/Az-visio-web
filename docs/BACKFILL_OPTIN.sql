-- =========================================================================
-- BACKFILL weekly_digest opt-in for existing profiles.
--
-- UNCOMMENT TO EXECUTE.
-- This script is wrapped in a block comment so running it by accident is a
-- no-op. Owner runs this manually in Supabase -> SQL Editor only after
-- confirming the intent to opt everyone in.
--
-- What it does:
--   For every profile whose email_preferences is NULL or does not have a
--   'weekly_digest' key yet, set the key to true. Users who explicitly
--   opted out (weekly_digest = 'false') are LEFT ALONE.
-- =========================================================================

/*
UPDATE public.profiles
SET email_preferences = COALESCE(email_preferences, '{}'::jsonb)
                        || '{"weekly_digest": true}'::jsonb
WHERE email_preferences IS NULL
   OR email_preferences->>'weekly_digest' IS NULL;

-- Sanity check after running:
SELECT
  count(*) AS total_users,
  count(*) FILTER (WHERE email_preferences->>'weekly_digest' = 'true')  AS opted_in,
  count(*) FILTER (WHERE email_preferences->>'weekly_digest' = 'false') AS opted_out
FROM public.profiles;
*/
