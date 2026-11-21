-- =========================================================================
-- Blog User Submissions — delta migration on top of ADD_BLOG_POSTS_TABLE.sql
--
-- Adds support for logged-in users drafting and submitting blog posts that
-- an admin later publishes from the admin portal. Existing admin behaviour
-- is preserved verbatim — the admin email allowlist policies from
-- ADD_BLOG_POSTS_TABLE.sql (mirrored in BLOG_COMMENTS_TABLE.sql and
-- src/utils/adminConfig.js: DEFAULT_ADMIN_EMAILS) still apply ON TOP of the
-- new user-scoped policies and continue to override them for every
-- operation (admins get FOR ALL via the cumulative OR of RLS policies).
--
-- Row-state semantics (same `published` column, new `submitted_for_review`):
--   admin draft           : submitted_for_review=false, published=false, created_by=admin uuid
--   user draft            : submitted_for_review=false, published=false, created_by=user uuid
--   user pending review   : submitted_for_review=true,  published=false, created_by=user uuid
--   published (any author): submitted_for_review=false, published=true
--
-- Idempotent — safe to run multiple times.
-- Run this in Supabase Dashboard → SQL Editor once (after ADD_BLOG_POSTS_TABLE.sql).
-- =========================================================================

-- 1. New column + supporting index
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS submitted_for_review boolean NOT NULL DEFAULT false;

-- Partial index — the admin review queue only cares about pending rows.
CREATE INDEX IF NOT EXISTS idx_blog_posts_pending_review
  ON public.blog_posts (updated_at DESC)
  WHERE submitted_for_review = true;

-- 2. User-scoped RLS policies (role: authenticated)
--    These sit alongside the existing admin-allowlist policies from
--    ADD_BLOG_POSTS_TABLE.sql; a user who is ALSO in the admin allowlist
--    continues to get admin rights via the admin policies, which remain
--    unchanged. Postgres RLS is permissive-OR, so adding these does not
--    narrow what admins can do.

-- Drop first (idempotent re-run)
DROP POLICY IF EXISTS "Users can read their own blog posts"   ON public.blog_posts;
DROP POLICY IF EXISTS "Users can insert their own drafts"     ON public.blog_posts;
DROP POLICY IF EXISTS "Users can update their own drafts"     ON public.blog_posts;
DROP POLICY IF EXISTS "Users can delete their own drafts"     ON public.blog_posts;

-- SELECT own: a user can see every row they created, regardless of status.
CREATE POLICY "Users can read their own blog posts"
  ON public.blog_posts FOR SELECT TO authenticated
  USING (auth.uid() = created_by);

-- INSERT own: user may only create rows as themselves AND cannot self-publish.
CREATE POLICY "Users can insert their own drafts"
  ON public.blog_posts FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND published = false
  );

-- UPDATE own non-published: user can edit a row only if they own it AND it
-- is not already published. WITH CHECK keeps them from flipping published,
-- transferring ownership, or editing a published post via a status flip.
CREATE POLICY "Users can update their own drafts"
  ON public.blog_posts FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    AND published = false
  )
  WITH CHECK (
    created_by = auth.uid()
    AND published = false
  );

-- DELETE own non-published: users may remove their own drafts / pending
-- submissions, never a published post.
CREATE POLICY "Users can delete their own drafts"
  ON public.blog_posts FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    AND published = false
  );

-- 3. Verification notes
--    After running, the policy set on public.blog_posts should be:
--      - Anyone can read published blog posts        (SELECT, anon+auth)
--      - Admins can read all blog posts              (SELECT, auth)
--      - Admins can insert blog posts                (INSERT, auth)
--      - Admins can update blog posts                (UPDATE, auth)
--      - Admins can delete blog posts                (DELETE, auth)
--      - Users can read their own blog posts         (SELECT, auth)
--      - Users can insert their own drafts           (INSERT, auth)
--      - Users can update their own drafts           (UPDATE, auth)
--      - Users can delete their own drafts           (DELETE, auth)
--
--    Confirm with:
--      SELECT policyname, cmd FROM pg_policies
--       WHERE schemaname='public' AND tablename='blog_posts'
--       ORDER BY cmd, policyname;
--
--    The admin-allowlist policies (email allowlist matching the three
--    DEFAULT_ADMIN_EMAILS entries in src/utils/adminConfig.js) take effect
--    for every operation via RLS permissive-OR evaluation and continue to
--    override these user-scoped policies for admins.

-- Refresh PostgREST schema cache so the new column is visible to the API
NOTIFY pgrst, 'reload schema';
