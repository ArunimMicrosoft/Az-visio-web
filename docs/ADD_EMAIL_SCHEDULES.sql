-- =========================================================================
-- Admin-controlled email schedules.
-- Run this in Supabase Dashboard -> SQL Editor. Idempotent / safe to re-run.
--
--   email_schedules : one row per scheduled campaign. The hourly cron reads
--                     every enabled row, checks the cadence, and dispatches
--                     the due ones. The admin "Scheduled Emails" tab in the
--                     Admin Dashboard is the ONLY place these rows should be
--                     edited. Service role (used by Cloudflare Functions)
--                     bypasses RLS; interactive users must be in the admin
--                     allowlist to read or write.
--
-- Admin identification mirrors docs/ADD_EMAIL_BROADCASTS.sql and
-- src/utils/adminConfig.js DEFAULT_ADMIN_EMAILS. Keep the three email
-- literals in sync across all three places.
-- =========================================================================

-- ------------------------------------------------------------------ TABLE

CREATE TABLE IF NOT EXISTS public.email_schedules (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  kind              text        NOT NULL UNIQUE,                           -- 'weekly_digest', ...
  subject_template  text        NOT NULL,
  body_template     text        NOT NULL,                                  -- markdown; supports {{vars}}
  enabled           boolean     NOT NULL DEFAULT true,
  cadence           text        NOT NULL DEFAULT 'weekly_mon_09',
                      -- known presets: weekly_mon_09, weekly_fri_17,
                      -- daily_09, monthly_1st_09, custom (uses custom_cron)
  custom_cron       text,                                                  -- only when cadence = 'custom'
  last_run_at       timestamptz,
  last_run_status   text,                                                  -- sent | failed | skipped | disabled | empty_audience
  last_run_count    integer,
  updated_by        uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------ INDEX

CREATE INDEX IF NOT EXISTS email_schedules_enabled_idx
  ON public.email_schedules (enabled)
  WHERE enabled = true;

-- -------------------------------------------------------------------- RLS

ALTER TABLE public.email_schedules ENABLE ROW LEVEL SECURITY;

-- Admin check uses auth.jwt() -> 'email' so the authenticated role never needs
-- SELECT privilege on auth.users (revoked in Supabase by default).

-- Admin-only SELECT
DROP POLICY IF EXISTS email_schedules_admin_select ON public.email_schedules;
CREATE POLICY email_schedules_admin_select
  ON public.email_schedules FOR SELECT TO authenticated
  USING (
    lower(coalesce(auth.jwt() ->> 'email', '')) IN (
      'arunimpandey2903@hotmail.com',
      'demo@arunimitcaffe.com',
      'admin@azuredesigner.com'
    )
  );

-- Admin-only INSERT
DROP POLICY IF EXISTS email_schedules_admin_insert ON public.email_schedules;
CREATE POLICY email_schedules_admin_insert
  ON public.email_schedules FOR INSERT TO authenticated
  WITH CHECK (
    lower(coalesce(auth.jwt() ->> 'email', '')) IN (
      'arunimpandey2903@hotmail.com',
      'demo@arunimitcaffe.com',
      'admin@azuredesigner.com'
    )
  );

-- Admin-only UPDATE
DROP POLICY IF EXISTS email_schedules_admin_update ON public.email_schedules;
CREATE POLICY email_schedules_admin_update
  ON public.email_schedules FOR UPDATE TO authenticated
  USING (
    lower(coalesce(auth.jwt() ->> 'email', '')) IN (
      'arunimpandey2903@hotmail.com',
      'demo@arunimitcaffe.com',
      'admin@azuredesigner.com'
    )
  )
  WITH CHECK (
    lower(coalesce(auth.jwt() ->> 'email', '')) IN (
      'arunimpandey2903@hotmail.com',
      'demo@arunimitcaffe.com',
      'admin@azuredesigner.com'
    )
  );

-- Admin-only DELETE (defensive; the UI does not expose delete today)
DROP POLICY IF EXISTS email_schedules_admin_delete ON public.email_schedules;
CREATE POLICY email_schedules_admin_delete
  ON public.email_schedules FOR DELETE TO authenticated
  USING (
    lower(coalesce(auth.jwt() ->> 'email', '')) IN (
      'arunimpandey2903@hotmail.com',
      'demo@arunimitcaffe.com',
      'admin@azuredesigner.com'
    )
  );

-- Keep updated_at fresh on every write
CREATE OR REPLACE FUNCTION public.touch_email_schedules_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_touch_email_schedules_updated_at ON public.email_schedules;
CREATE TRIGGER trg_touch_email_schedules_updated_at
  BEFORE UPDATE ON public.email_schedules
  FOR EACH ROW EXECUTE FUNCTION public.touch_email_schedules_updated_at();

-- ------------------------------------------------------------------ SEED
-- Seed the weekly_digest row with a markdown template that mirrors the
-- shape the hardcoded builder has been sending. Admins can edit it from
-- Admin -> Scheduled Emails -> Edit without a redeploy.

INSERT INTO public.email_schedules (
  kind,
  subject_template,
  body_template,
  enabled,
  cadence
) VALUES (
  'weekly_digest',
  'Your Cloud Canvas week — {{recent_diagrams_count}} diagrams',
  $BODY$# Hey {{first_name}} 👋

Here's your Monday digest from **Cloud Canvas Designer** — a quick snapshot of your workspace this week.

- You have **{{recent_diagrams_count}}** recent diagrams on the canvas.
- It's been **{{days_since_last_visit}}** days since you last signed in.

## Suggested this week

Read our latest guide: [{{suggested_article_title}}]({{suggested_article_url}}).

Open your dashboard and keep building: [cloudcanvas.co/home](https://cloudcanvas.co/home).

Thanks,
The Cloud Canvas team
$BODY$,
  true,
  'weekly_mon_09'
)
ON CONFLICT (kind) DO NOTHING;

-- Verify — should show at least the weekly_digest row
SELECT kind, enabled, cadence, last_run_at, last_run_status, updated_at
  FROM public.email_schedules
  ORDER BY kind;
