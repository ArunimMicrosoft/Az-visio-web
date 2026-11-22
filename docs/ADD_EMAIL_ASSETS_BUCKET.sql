-- =========================================================================
-- Storage bucket for images uploaded via the Admin Email composer.
-- Run this in Supabase Dashboard -> SQL Editor. Idempotent / safe to re-run.
--
--   Bucket:  email-assets  (public read)
--   Writes:  admin-only, enforced via auth.jwt() ->> 'email' allowlist
--   Reads:   public (so Resend-delivered emails can load the <img> src)
--
-- Why the auth.jwt() pattern and not `auth.users`? The `authenticated` role
-- has had SELECT on auth.users revoked by Supabase for years; querying it
-- raises "permission denied for table users" and kills the admin dashboard
-- (see the hotfix in docs/ADD_EMAIL_BROADCASTS.sql). The jwt() path reads
-- the email claim directly from the access token and needs no table grants.
--
-- Admin identification mirrors docs/ADD_EMAIL_BROADCASTS.sql and
-- src/utils/adminConfig.js DEFAULT_ADMIN_EMAILS. Keep the three email
-- literals in sync across all three places.
-- =========================================================================

-- ------------------------------------------------------------------ BUCKET

-- Public bucket so unauthenticated email recipients can fetch inline images.
-- The write-side policies below ensure only admins can INSERT/UPDATE/DELETE
-- objects; `public = true` only governs anon SELECT on the metadata row.
INSERT INTO storage.buckets (id, name, public)
VALUES ('email-assets', 'email-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Optional: cap file size at 5 MB server-side as well (the admin client
-- already rejects >5 MB before upload). Supabase added these columns in
-- 2024; guard with an EXCEPTION so the SQL remains safe on older projects.
DO $$
BEGIN
  EXECUTE $cmd$
    UPDATE storage.buckets
       SET file_size_limit = 5242880,
           allowed_mime_types = ARRAY['image/jpeg','image/png','image/gif','image/webp']
     WHERE id = 'email-assets'
  $cmd$;
EXCEPTION WHEN undefined_column THEN
  RAISE NOTICE 'storage.buckets.file_size_limit / allowed_mime_types columns not present on this project — skipping size cap';
END $$;

-- -------------------------------------------------------------------- RLS
-- storage.objects already has RLS enabled by default on hosted Supabase.
-- We only add our policies; we do not re-enable RLS here (that would
-- double-flip it on self-hosted projects).

-- Public (anon + authenticated) SELECT on email-assets objects so the
-- <img src="..."> in a delivered email loads without a login.
DROP POLICY IF EXISTS email_assets_public_select ON storage.objects;
CREATE POLICY email_assets_public_select
  ON storage.objects FOR SELECT
  USING (bucket_id = 'email-assets');

-- Admin-only INSERT (upload)
DROP POLICY IF EXISTS email_assets_admin_insert ON storage.objects;
CREATE POLICY email_assets_admin_insert
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'email-assets'
    AND lower(coalesce(auth.jwt() ->> 'email', '')) IN (
      'arunimpandey2903@hotmail.com',
      'demo@arunimitcaffe.com',
      'admin@azuredesigner.com'
    )
  );

-- Admin-only UPDATE (overwrite / rename)
DROP POLICY IF EXISTS email_assets_admin_update ON storage.objects;
CREATE POLICY email_assets_admin_update
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'email-assets'
    AND lower(coalesce(auth.jwt() ->> 'email', '')) IN (
      'arunimpandey2903@hotmail.com',
      'demo@arunimitcaffe.com',
      'admin@azuredesigner.com'
    )
  )
  WITH CHECK (
    bucket_id = 'email-assets'
    AND lower(coalesce(auth.jwt() ->> 'email', '')) IN (
      'arunimpandey2903@hotmail.com',
      'demo@arunimitcaffe.com',
      'admin@azuredesigner.com'
    )
  );

-- Admin-only DELETE (cleanup)
DROP POLICY IF EXISTS email_assets_admin_delete ON storage.objects;
CREATE POLICY email_assets_admin_delete
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'email-assets'
    AND lower(coalesce(auth.jwt() ->> 'email', '')) IN (
      'arunimpandey2903@hotmail.com',
      'demo@arunimitcaffe.com',
      'admin@azuredesigner.com'
    )
  );

-- Verify — should show the bucket and the four policies above.
SELECT id, name, public, file_size_limit
  FROM storage.buckets
  WHERE id = 'email-assets';

SELECT policyname, cmd
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename  = 'objects'
    AND policyname LIKE 'email_assets_%'
  ORDER BY policyname;
