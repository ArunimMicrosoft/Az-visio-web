// Blog likes service — one like per user per article.
// Read count is public; toggling requires auth (RLS enforced).

import { supabase } from './supabase';

const SLUG_RE = /^[a-z0-9-]+$/;

/**
 * Fetch total like count for an article slug, plus whether the current user liked it.
 * @param {string} slug
 * @param {string|null} userId
 */
export async function fetchLikeState(slug, userId) {
  if (!slug || !SLUG_RE.test(slug)) return { count: 0, likedByUser: false };

  const [{ count }, mineRes] = await Promise.all([
    supabase
      .from('blog_likes')
      .select('*', { head: true, count: 'exact' })
      .eq('article_slug', slug),
    userId
      ? supabase
          .from('blog_likes')
          .select('id')
          .eq('article_slug', slug)
          .eq('user_id', userId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  return {
    count: count || 0,
    likedByUser: !!mineRes?.data,
  };
}

/** Add a like for the current user. */
export async function likeArticle(slug, userId) {
  if (!userId) return { ok: false, error: 'Sign in to like this article.' };
  if (!slug || !SLUG_RE.test(slug)) return { ok: false, error: 'Invalid article.' };

  const { error } = await supabase
    .from('blog_likes')
    .insert({ article_slug: slug, user_id: userId });

  if (error) {
    // Unique constraint means already liked — treat as no-op success
    if (error.code === '23505') return { ok: true };
    console.error('[blogLikes] like error:', error);
    return { ok: false, error: error.message || 'Failed to like.' };
  }
  return { ok: true };
}

/** Remove a like. */
export async function unlikeArticle(slug, userId) {
  if (!userId) return { ok: false };
  const { error } = await supabase
    .from('blog_likes')
    .delete()
    .eq('article_slug', slug)
    .eq('user_id', userId);

  if (error) {
    console.error('[blogLikes] unlike error:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Batch-count likes for multiple slugs — used on the blog listing.
 * Returns { [slug]: count, ... }
 */
export async function fetchLikeCounts(slugs) {
  if (!Array.isArray(slugs) || slugs.length === 0) return {};
  const { data, error } = await supabase
    .from('blog_likes')
    .select('article_slug')
    .in('article_slug', slugs);

  if (error) {
    console.error('[blogLikes] counts error:', error);
    return {};
  }
  const counts = {};
  for (const row of data || []) counts[row.article_slug] = (counts[row.article_slug] || 0) + 1;
  return counts;
}
