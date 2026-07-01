-- Discovery usage tracking columns
-- Adds a counter + monthly reset timestamp to the profiles table.
-- Run this in the Supabase SQL editor.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS discoveries_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discoveries_reset_at TIMESTAMPTZ;

-- Backfill: existing rows get NULL reset_at meaning "no cycle started yet".
-- First discovery for a paid plan will initialize it to now + 30 days.

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
