-- =========================================================================
-- Welcome email schedule — admin-editable template fired when a user signs up.
-- Run this in Supabase Dashboard -> SQL Editor. Idempotent / safe to re-run.
--
--   1. Seeds a new row in public.email_schedules with kind='welcome' and
--      cadence='transactional'. Transactional rows are NEVER fired by the
--      hourly cron — they are dispatched only by /api/send-welcome when a
--      new user finishes signup (see functions/api/send-welcome.js).
--
--   2. Extends the CHECK constraint on public.email_sends.kind so the log
--      row written by the welcome handler is accepted. Original constraint
--      covered only ('digest','broadcast','reengagement','test').
--
-- Admin identification mirrors docs/ADD_EMAIL_SCHEDULES.sql — admin
-- allowlist policies are defined once there and already apply to every
-- row in email_schedules, including the welcome row this file inserts.
-- =========================================================================

-- ----------------------------------------------------------------- SEED
-- Seed the welcome row. ON CONFLICT (kind) DO NOTHING means re-running the
-- migration never overwrites an admin edit — once the row exists, all
-- future edits go through Admin -> Scheduled Emails.

INSERT INTO public.email_schedules (
  kind,
  subject_template,
  body_template,
  enabled,
  cadence
) VALUES (
  'welcome',
  'Welcome to Cloud Canvas Designer, {{first_name}}',
  $BODY$<p>Hey {{first_name}},</p>
<p>Welcome to <strong>Cloud Canvas Designer</strong>. Your workspace is ready and we're glad to have you on board.</p>
<h3>Three steps to design your first Azure architecture</h3>
<ul>
  <li><strong>Open the canvas</strong> and drag Azure services from the sidebar to sketch your design &mdash; <a href="{{canvas_url}}">start designing</a>.</li>
  <li><strong>Try a reference template</strong> &mdash; in the canvas go to <em>File &rarr; Templates</em> to drop a hub-and-spoke, 3-tier web app, or AKS blueprint onto the page.</li>
  <li><strong>Read the Product Guide (SOP)</strong> for a walkthrough of every panel &mdash; validation, cost, Terraform export. <a href="{{sop_url}}">Open the guide</a>.</li>
</ul>
<h3>Why Cloud Canvas is different</h3>
<p>Every diagram is checked against the Microsoft Well-Architected Framework, priced with live Azure rates, and exported as production-ready Terraform &mdash; all from the same canvas, in one click.</p>
<p>Open your workspace at <a href="{{home_url}}">cloudcanvas.co/home</a> whenever you&rsquo;re ready. Need a hand? Reply to this email and a human will get back to you. You can <a href="{{unsubscribe_url}}">unsubscribe</a> from product updates any time.</p>
$BODY$,
  true,
  'transactional'
)
ON CONFLICT (kind) DO NOTHING;

-- -------------------------------------------- EXTEND email_sends.kind CHECK
-- The original CHECK is inline on the column with the PostgreSQL-generated
-- name `email_sends_kind_check`. We drop-and-recreate inside a DO block so
-- re-running the migration is safe whether the old constraint still exists,
-- the new one is already in place, or the constraint has been renamed.

DO $$
DECLARE
  cons_name text;
BEGIN
  SELECT c.conname INTO cons_name
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
   WHERE n.nspname = 'public'
     AND t.relname = 'email_sends'
     AND c.contype = 'c'
     AND pg_get_constraintdef(c.oid) ILIKE '%kind%IN%';

  IF cons_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.email_sends DROP CONSTRAINT %I', cons_name);
  END IF;

  ALTER TABLE public.email_sends
    ADD CONSTRAINT email_sends_kind_check
    CHECK (kind IN ('digest','broadcast','reengagement','test','welcome'));
END $$;

-- ----------------------- (defensive) EXTEND email_schedules.cadence CHECK
-- docs/ADD_EMAIL_SCHEDULES.sql seeded email_schedules WITHOUT a CHECK on
-- cadence, but a later migration may have added one. If any such CHECK
-- exists and does NOT list 'transactional', rewrite it so the welcome row
-- is accepted. Silent no-op when no cadence CHECK exists at all.

DO $$
DECLARE
  cons_name text;
  cons_def  text;
BEGIN
  SELECT c.conname, pg_get_constraintdef(c.oid)
    INTO cons_name, cons_def
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
   WHERE n.nspname = 'public'
     AND t.relname = 'email_schedules'
     AND c.contype = 'c'
     AND pg_get_constraintdef(c.oid) ILIKE '%cadence%IN%';

  IF cons_name IS NOT NULL AND cons_def NOT ILIKE '%transactional%' THEN
    EXECUTE format('ALTER TABLE public.email_schedules DROP CONSTRAINT %I', cons_name);
    ALTER TABLE public.email_schedules
      ADD CONSTRAINT email_schedules_cadence_check
      CHECK (cadence IN (
        'weekly_mon_09','weekly_fri_17','daily_09','monthly_1st_09',
        'custom','transactional'
      ));
  END IF;
END $$;

-- Verify — should return the welcome row alongside any pre-existing rows.
SELECT kind, enabled, cadence, last_run_at, updated_at
  FROM public.email_schedules
  ORDER BY kind;
