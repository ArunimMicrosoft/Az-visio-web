-- =========================================================================
-- Admin broadcast — per-user recipient targeting.
--
-- Run once in Supabase Dashboard -> SQL Editor. Idempotent / safe to re-run.
--
-- Background:
--   Previous model: `email_broadcasts.audience` was one of
--     ('all','paid','trial','inactive_30d','admin_test')
--   and the recipient list was recomputed from a filter at send time.
--
--   New model: the admin picks the exact users in the UI (checkbox list of
--   every opted-in profile) and we record the ids they chose. Static
--   audience values stay in the CHECK for backward compatibility with
--   rows written before this upgrade.
--
--   The handler for the old "admin_test" / "me" button is now a separate
--   code path (`testMode: true` on the dispatch request) and writes
--   `audience = 'test'`. User-picked lists write `audience = 'custom'`.
-- =========================================================================

-- 1. New column: who was targeted.
ALTER TABLE public.email_broadcasts
  ADD COLUMN IF NOT EXISTS recipient_user_ids uuid[];

-- 2. Broaden the audience CHECK. Postgres can't ALTER a CHECK in place, so
-- we drop + recreate. The new set is a superset — existing rows still
-- satisfy the constraint.
ALTER TABLE public.email_broadcasts
  DROP CONSTRAINT IF EXISTS email_broadcasts_audience_check;

ALTER TABLE public.email_broadcasts
  ADD CONSTRAINT email_broadcasts_audience_check
  CHECK (audience IN (
    'all','paid','trial','inactive_30d','admin_test', -- legacy values
    'custom',                                          -- user-picked list
    'test'                                             -- "Send test to me only"
  ));

-- 3. Optional GIN index — cheap, lets us answer "which broadcasts did user X
-- receive?" without scanning every row.
CREATE INDEX IF NOT EXISTS email_broadcasts_recipient_user_ids_gin
  ON public.email_broadcasts USING GIN (recipient_user_ids);

-- 4. Verify.
SELECT
  count(*)                                          AS total_broadcasts,
  count(*) FILTER (WHERE audience = 'custom')        AS custom_broadcasts,
  count(*) FILTER (WHERE audience = 'test')          AS test_broadcasts,
  count(*) FILTER (WHERE recipient_user_ids IS NOT NULL) AS with_recipients_captured
FROM public.email_broadcasts;
