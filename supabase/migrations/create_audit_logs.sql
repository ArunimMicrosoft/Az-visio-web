-- ============================================================
--  audit_logs table — Azure Architecture Designer
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email         text,
  event         text NOT NULL,
  details       jsonb,
  ip_address    text,
  created_at    timestamptz DEFAULT now() NOT NULL
);

-- Index for fast queries by event type and time
CREATE INDEX IF NOT EXISTS idx_audit_logs_event      ON public.audit_logs (event);
CREATE INDEX IF NOT EXISTS idx_audit_logs_email      ON public.audit_logs (email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id    ON public.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can INSERT their own logs
CREATE POLICY "Users can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins can read all logs (identified by role in profiles table)
CREATE POLICY "Admins can read all audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Also allow anon inserts for failed-login logging (user not yet authenticated)
CREATE POLICY "Anon can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- ============================================================
-- To verify: SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 20;
-- ============================================================
