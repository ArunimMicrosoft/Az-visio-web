-- =========================================================================
-- Email broadcasts + per-send log.
-- Run this in Supabase Dashboard -> SQL Editor once. Safe to re-run.
--
--   email_broadcasts : one row per composed admin broadcast
--   email_sends      : one row per actual email attempt (digest, broadcast,
--                      reengagement, test). Service role writes. Admin reads.
--
-- Admin identification mirrors docs/ADD_BLOG_POSTS_TABLE.sql and
-- src/utils/adminConfig.js DEFAULT_ADMIN_EMAILS. Keep the three email
-- literals in sync across all three places.
-- =========================================================================

-- ------------------------------------------------------------------ TABLES

CREATE TABLE IF NOT EXISTS public.email_broadcasts (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  subject          text        NOT NULL,
  body             text        NOT NULL,                                  -- raw markdown
  audience         text        NOT NULL
                     CHECK (audience IN ('all','paid','trial','inactive_30d','admin_test')),
  recipient_count  integer     NOT NULL DEFAULT 0,
  status           text        NOT NULL DEFAULT 'queued'
                     CHECK (status IN ('queued','sending','sent','partial','failed')),
  error            text,
  created_by       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  completed_at     timestamptz
);

CREATE TABLE IF NOT EXISTS public.email_sends (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email               text        NOT NULL,
  kind                   text        NOT NULL
                           CHECK (kind IN ('digest','broadcast','reengagement','test')),
  broadcast_id           uuid        REFERENCES public.email_broadcasts(id) ON DELETE SET NULL,
  status                 text        NOT NULL CHECK (status IN ('sent','failed')),
  provider_response_code integer,
  error                  text,
  sent_at                timestamptz NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------- INDEXES

CREATE INDEX IF NOT EXISTS email_broadcasts_created_at_idx ON public.email_broadcasts (created_at DESC);
CREATE INDEX IF NOT EXISTS email_sends_sent_at_idx         ON public.email_sends       (sent_at DESC);
CREATE INDEX IF NOT EXISTS email_sends_broadcast_idx       ON public.email_sends       (broadcast_id);
CREATE INDEX IF NOT EXISTS email_sends_to_email_idx        ON public.email_sends       (to_email);

-- --------------------------------------------------------------------- RLS

ALTER TABLE public.email_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sends       ENABLE ROW LEVEL SECURITY;

-- Admin check uses auth.jwt() -> 'email' so the authenticated role never needs
-- SELECT privilege on auth.users (which is revoked in Supabase by default and
-- was causing "permission denied for table users" errors).

-- email_broadcasts: admin-only SELECT / INSERT / UPDATE
DROP POLICY IF EXISTS email_broadcasts_admin_select ON public.email_broadcasts;
CREATE POLICY email_broadcasts_admin_select
  ON public.email_broadcasts FOR SELECT TO authenticated
  USING (
    lower(coalesce(auth.jwt() ->> 'email', '')) IN (
      'arunimpandey2903@hotmail.com',
      'demo@arunimitcaffe.com',
      'admin@azuredesigner.com'
    )
  );

DROP POLICY IF EXISTS email_broadcasts_admin_insert ON public.email_broadcasts;
CREATE POLICY email_broadcasts_admin_insert
  ON public.email_broadcasts FOR INSERT TO authenticated
  WITH CHECK (
    lower(coalesce(auth.jwt() ->> 'email', '')) IN (
      'arunimpandey2903@hotmail.com',
      'demo@arunimitcaffe.com',
      'admin@azuredesigner.com'
    )
  );

DROP POLICY IF EXISTS email_broadcasts_admin_update ON public.email_broadcasts;
CREATE POLICY email_broadcasts_admin_update
  ON public.email_broadcasts FOR UPDATE TO authenticated
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

-- email_sends: admin-only SELECT. Service role writes (bypasses RLS).
DROP POLICY IF EXISTS email_sends_admin_select ON public.email_sends;
CREATE POLICY email_sends_admin_select
  ON public.email_sends FOR SELECT TO authenticated
  USING (
    lower(coalesce(auth.jwt() ->> 'email', '')) IN (
      'arunimpandey2903@hotmail.com',
      'demo@arunimitcaffe.com',
      'admin@azuredesigner.com'
    )
  );
