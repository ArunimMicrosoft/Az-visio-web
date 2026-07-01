-- =========================================================================
-- Blog Likes — one like per user per article
-- Run this in Supabase Dashboard → SQL Editor once
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.blog_likes (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug text        NOT NULL,
  user_id      uuid        NOT NULL,
  is_seed      boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT blog_likes_slug_shape CHECK (article_slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT blog_likes_unique     UNIQUE (article_slug, user_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_likes_slug ON public.blog_likes (article_slug);
CREATE INDEX IF NOT EXISTS idx_blog_likes_user ON public.blog_likes (user_id);

ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read likes"          ON public.blog_likes;
DROP POLICY IF EXISTS "Users can like as themselves"   ON public.blog_likes;
DROP POLICY IF EXISTS "Users can unlike their own"     ON public.blog_likes;

CREATE POLICY "Anyone can read likes"
  ON public.blog_likes FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Users can like as themselves"
  ON public.blog_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own"
  ON public.blog_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Also add is_seed column to blog_comments so we can distinguish seed from real
ALTER TABLE public.blog_comments
  ADD COLUMN IF NOT EXISTS is_seed boolean NOT NULL DEFAULT false;

-- Drop the FK on blog_comments.user_id so seed data (with synthetic UUIDs)
-- can be inserted. RLS on INSERT still enforces auth.uid() = user_id
-- for real user-authored comments — seed inserts run as postgres/service_role
-- which bypasses RLS.
ALTER TABLE public.blog_comments
  DROP CONSTRAINT IF EXISTS blog_comments_user_id_fkey;
