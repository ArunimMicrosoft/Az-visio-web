-- =========================================================================
-- Blog Posts — admin-publishable blog posts stored in Supabase.
-- Run this in Supabase Dashboard → SQL Editor once.
--
-- Hybrid model: the existing 67 static articles in src/utils/blogArticles.js
-- stay untouched (SEO-indexed URLs must not break). New posts live in this
-- table and are merged into the public list/article pages at read time.
--
-- Admin identification mirrors docs/BLOG_COMMENTS_TABLE.sql and
-- src/utils/adminConfig.js — the hardcoded DEFAULT_ADMIN_EMAILS list. Keep
-- the three email literals in sync across all three places.
-- =========================================================================

-- 1. Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text        NOT NULL UNIQUE,
  title            text        NOT NULL,
  excerpt          text,
  category         text,
  icon             text,
  content          text        NOT NULL,
  author           text        NOT NULL DEFAULT 'Cloud Canvas Team',
  read_time        text,
  meta_description text,
  keywords         text,
  published        boolean     NOT NULL DEFAULT false,
  published_at     timestamptz,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  created_by       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  view_count       integer     NOT NULL DEFAULT 0,

  CONSTRAINT blog_posts_slug_shape  CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT blog_posts_title_len   CHECK (char_length(title) BETWEEN 3 AND 300),
  CONSTRAINT blog_posts_content_len CHECK (char_length(content) >= 1)
);

-- 2. Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_posts_slug         ON public.blog_posts (slug);
CREATE        INDEX IF NOT EXISTS idx_blog_posts_published    ON public.blog_posts (published);
CREATE        INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts (published_at DESC);

-- 3. updated_at trigger — refreshes the column on every UPDATE
CREATE OR REPLACE FUNCTION public.blog_posts_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS blog_posts_updated_at_trigger ON public.blog_posts;
CREATE TRIGGER blog_posts_updated_at_trigger
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.blog_posts_set_updated_at();

-- 4. Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies (idempotent — safe to re-run)
DROP POLICY IF EXISTS "Anyone can read published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can read all blog posts"       ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts"         ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts"         ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts"         ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can increment view_count"      ON public.blog_posts;

-- 6. Policies
--    Admin identification uses the same email allowlist as
--    docs/BLOG_COMMENTS_TABLE.sql, which in turn matches
--    DEFAULT_ADMIN_EMAILS in src/utils/adminConfig.js.

-- Everyone (anon + authenticated) can read a post as long as it is published.
CREATE POLICY "Anyone can read published blog posts"
  ON public.blog_posts FOR SELECT TO anon, authenticated
  USING (published = true);

-- Admins can read every post, published or draft.
CREATE POLICY "Admins can read all blog posts"
  ON public.blog_posts FOR SELECT TO authenticated
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

-- Admins create posts.
CREATE POLICY "Admins can insert blog posts"
  ON public.blog_posts FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE email IN (
        'arunimpandey2903@hotmail.com',
        'demo@arunimitcaffe.com',
        'admin@azuredesigner.com'
      )
    )
  );

-- Admins update posts.
CREATE POLICY "Admins can update blog posts"
  ON public.blog_posts FOR UPDATE TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE email IN (
        'arunimpandey2903@hotmail.com',
        'demo@arunimitcaffe.com',
        'admin@azuredesigner.com'
      )
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles
      WHERE email IN (
        'arunimpandey2903@hotmail.com',
        'demo@arunimitcaffe.com',
        'admin@azuredesigner.com'
      )
    )
  );

-- Admins delete posts.
CREATE POLICY "Admins can delete blog posts"
  ON public.blog_posts FOR DELETE TO authenticated
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

-- 7. View-count bump — called by the public article page on load.
--    SECURITY DEFINER so anon visitors can increment view_count on a
--    published post without needing broad UPDATE on the table.
CREATE OR REPLACE FUNCTION public.increment_blog_post_view(p_slug TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.blog_posts
     SET view_count = view_count + 1
   WHERE slug = p_slug
     AND published = true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_blog_post_view(TEXT) TO anon, authenticated;

-- Refresh PostgREST schema cache so the new table and RPC are visible
NOTIFY pgrst, 'reload schema';

-- Done — you can verify with:
--   SELECT slug, title, published, published_at FROM public.blog_posts ORDER BY updated_at DESC;
