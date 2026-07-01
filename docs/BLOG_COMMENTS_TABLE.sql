-- =========================================================================
-- Blog Comments — logged-in users leave notes on articles
-- Run this in Supabase Dashboard → SQL Editor once
-- =========================================================================

-- 1. Table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug text        NOT NULL,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name    text        NOT NULL,
  content      text        NOT NULL,
  is_hidden    boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT content_length_check   CHECK (char_length(content) BETWEEN 3 AND 2000),
  CONSTRAINT username_length_check  CHECK (char_length(user_name) BETWEEN 1 AND 100),
  CONSTRAINT slug_shape_check       CHECK (article_slug ~ '^[a-z0-9-]+$')
);

-- 2. Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_blog_comments_slug         ON public.blog_comments (article_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user         ON public.blog_comments (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_comments_visible_slug ON public.blog_comments (article_slug, created_at DESC) WHERE is_hidden = false;

-- 3. Enable Row Level Security
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies (idempotent — safe to re-run)
DROP POLICY IF EXISTS "Anyone can read non-hidden comments"       ON public.blog_comments;
DROP POLICY IF EXISTS "Authenticated users can post comments"     ON public.blog_comments;
DROP POLICY IF EXISTS "Users can update their own comments"      ON public.blog_comments;
DROP POLICY IF EXISTS "Users can delete their own comments"      ON public.blog_comments;
DROP POLICY IF EXISTS "Admins can moderate all comments"          ON public.blog_comments;

-- 5. Policies

-- Anyone (even anonymous) can read visible comments — public engagement on blog
CREATE POLICY "Anyone can read non-hidden comments"
  ON public.blog_comments FOR SELECT TO anon, authenticated
  USING (is_hidden = false);

-- Only signed-in users can insert, and only as themselves
CREATE POLICY "Authenticated users can post comments"
  ON public.blog_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can edit their own comment (but not change ownership or hidden flag)
CREATE POLICY "Users can update their own comments"
  ON public.blog_comments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND is_hidden = false);

-- Users can delete their own comment
CREATE POLICY "Users can delete their own comments"
  ON public.blog_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Admins (by email allowlist) can moderate any comment
CREATE POLICY "Admins can moderate all comments"
  ON public.blog_comments FOR ALL TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE email IN (
        'arunimpandey2903@hotmail.com',
        'demo@arunimitcaffe.com',
        'admin@azuredesigner.com'
      )
    )
  );

-- 6. Rate-limit helper: reject if user posted > 3 comments on this article
--    or > 20 comments in the last 24h across all articles
CREATE OR REPLACE FUNCTION public.blog_comments_rate_limit()
RETURNS trigger AS $$
BEGIN
  IF (SELECT count(*) FROM public.blog_comments
      WHERE user_id = NEW.user_id
        AND article_slug = NEW.article_slug
        AND created_at > now() - interval '24 hours') >= 3 THEN
    RAISE EXCEPTION 'You have reached the limit of 3 comments per article per day.';
  END IF;

  IF (SELECT count(*) FROM public.blog_comments
      WHERE user_id = NEW.user_id
        AND created_at > now() - interval '24 hours') >= 20 THEN
    RAISE EXCEPTION 'You have reached the daily comment limit. Please try again tomorrow.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS blog_comments_rate_limit_trigger ON public.blog_comments;
CREATE TRIGGER blog_comments_rate_limit_trigger
  BEFORE INSERT ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION public.blog_comments_rate_limit();

-- Done — you can verify with:
--   SELECT * FROM public.blog_comments;
