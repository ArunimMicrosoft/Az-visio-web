// Blog comment service — CRUD against the Supabase blog_comments table.
// RLS enforced at the DB layer; this file just provides a clean API for the UI.

import { supabase } from './supabase';

const SLUG_RE = /^[a-z0-9-]+$/;
const MAX_LEN = 2000;
const MIN_LEN = 3;

/**
 * Fetch visible comments for an article slug, newest first.
 * @param {string} slug
 * @returns {Promise<Array<{id, article_slug, user_id, user_name, content, created_at}>>}
 */
export async function fetchComments(slug) {
  if (!slug || !SLUG_RE.test(slug)) return [];
  const { data, error } = await supabase
    .from('blog_comments')
    .select('id, article_slug, user_id, user_name, content, created_at')
    .eq('article_slug', slug)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    console.error('[blogComments] fetch error:', error);
    return [];
  }
  return data || [];
}

/**
 * Post a new comment. RLS ensures user_id = auth.uid().
 * Rate limits (3/article/24h, 20/day total) enforced by DB trigger.
 * @param {{slug: string, content: string, user: {id, name, email}}} params
 * @returns {Promise<{ok: boolean, error?: string, comment?: object}>}
 */
export async function postComment({ slug, content, user }) {
  if (!user?.id) return { ok: false, error: 'You must be signed in to comment.' };
  if (!slug || !SLUG_RE.test(slug)) return { ok: false, error: 'Invalid article.' };

  const clean = (content || '').trim();
  if (clean.length < MIN_LEN) return { ok: false, error: `Comment must be at least ${MIN_LEN} characters.` };
  if (clean.length > MAX_LEN) return { ok: false, error: `Comment must be under ${MAX_LEN} characters.` };

  // Prefer real profile name; fallback to email local part
  const displayName =
    (user.name && user.name.trim()) ||
    (user.email && user.email.split('@')[0]) ||
    'Anonymous';

  const { data, error } = await supabase
    .from('blog_comments')
    .insert({
      article_slug: slug,
      user_id: user.id,
      user_name: displayName.slice(0, 100),
      content: clean,
    })
    .select('id, article_slug, user_id, user_name, content, created_at')
    .single();

  if (error) {
    console.error('[blogComments] post error:', error);
    // Bubble up user-friendly message for known constraints / RLS
    const msg = error.message || 'Failed to post comment.';
    if (msg.includes('limit')) return { ok: false, error: msg };
    if (msg.includes('row-level security')) return { ok: false, error: 'Please sign in again to comment.' };
    return { ok: false, error: 'Could not post comment. Please try again.' };
  }
  return { ok: true, comment: data };
}

/**
 * Delete one of your own comments. RLS lets only the author (or admin) do this.
 */
export async function deleteComment(commentId) {
  if (!commentId) return { ok: false };
  const { error } = await supabase.from('blog_comments').delete().eq('id', commentId);
  if (error) {
    console.error('[blogComments] delete error:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Count visible comments for a batch of slugs — used on the blog listing to show
 * "N comments" per article card. Returns an object { [slug]: count, ... }
 */
export async function fetchCommentCounts(slugs) {
  if (!Array.isArray(slugs) || slugs.length === 0) return {};
  const { data, error } = await supabase
    .from('blog_comments')
    .select('article_slug')
    .eq('is_hidden', false)
    .in('article_slug', slugs);

  if (error) {
    console.error('[blogComments] count error:', error);
    return {};
  }
  const counts = {};
  for (const row of data || []) {
    counts[row.article_slug] = (counts[row.article_slug] || 0) + 1;
  }
  return counts;
}
