// Blog Posts — DB-backed posts stored in the `blog_posts` Supabase table.
// Reads use the ANON key (RLS limits anonymous visitors to published rows).
// Writes require an admin-matched session (see docs/ADD_BLOG_POSTS_TABLE.sql
// and src/utils/adminConfig.js — the same email allowlist).

import { supabase } from './supabase';

const SLUG_RE = /^[a-z0-9-]+$/;

export const isValidSlug = (slug) => typeof slug === 'string' && SLUG_RE.test(slug);

/**
 * Map a raw `blog_posts` row into the shape the public Blog.jsx / BlogArticle.jsx
 * components already consume (same keys as src/utils/blogArticles.js).
 *   published_at      → date
 *   read_time         → readTime
 *   meta_description  → metaDescription
 *   view_count        → viewCount
 * Falls back to updated_at when a post is saved but never published.
 */
export function mapDbPostToArticle(row) {
  if (!row) return null;
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || '',
    category: row.category || 'Best Practices',
    icon: row.icon || '📝',
    content: row.content || '',
    author: row.author || 'Cloud Canvas Team',
    date: row.published_at || row.updated_at || row.created_at,
    readTime: row.read_time || '',
    metaDescription: row.meta_description || row.excerpt || '',
    keywords: row.keywords || '',
    viewCount: row.view_count || 0,
    _source: 'db',
  };
}

/** Fetch every published post, newest first. Used by Blog.jsx on mount. */
export async function fetchPublishedPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(
      'id, slug, title, excerpt, category, icon, content, author, read_time, meta_description, keywords, published_at, updated_at, created_at, view_count'
    )
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.warn('[blogPosts] fetchPublishedPosts failed:', error.message);
    return [];
  }
  return (data || []).map(mapDbPostToArticle);
}

/**
 * Fetch a single published post by slug. Returns null when the slug does not
 * exist or the post is unpublished — in that case BlogArticle.jsx falls back
 * to the static array.
 */
export async function fetchPublishedPostBySlug(slug) {
  if (!isValidSlug(slug)) return null;
  const { data, error } = await supabase
    .from('blog_posts')
    .select(
      'id, slug, title, excerpt, category, icon, content, author, read_time, meta_description, keywords, published_at, updated_at, created_at, view_count'
    )
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    console.warn('[blogPosts] fetchPublishedPostBySlug failed:', error.message);
    return null;
  }
  return mapDbPostToArticle(data);
}

/**
 * Fire-and-forget view-count bump — calls the SECURITY DEFINER RPC defined
 * in the migration so anon visitors can increment without broad UPDATE.
 */
export async function bumpViewCount(slug) {
  if (!isValidSlug(slug)) return;
  try {
    const { error } = await supabase.rpc('increment_blog_post_view', { p_slug: slug });
    if (error) console.warn('[blogPosts] bumpViewCount RPC failed:', error.message);
  } catch (e) {
    console.warn('[blogPosts] bumpViewCount threw:', e?.message || e);
  }
}

// ── Admin-only helpers (RLS enforces permission) ───────────────────────────

/** Admin: list every post, drafts included, newest first. */
export async function adminListPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Admin: create a new post row. Returns the inserted row. */
export async function adminCreatePost(fields, userId) {
  const payload = {
    ...fields,
    created_by: userId || null,
    // Keep published_at in sync with the published flag on first write
    published_at: fields.published ? (fields.published_at || new Date().toISOString()) : null,
  };
  const { data, error } = await supabase
    .from('blog_posts')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Admin: patch an existing post. */
export async function adminUpdatePost(id, fields) {
  const patch = { ...fields };
  // If the caller flips `published` → true but did not set a published_at
  // yet, stamp it now. Flipping back to draft nulls it out.
  if (Object.prototype.hasOwnProperty.call(patch, 'published')) {
    if (patch.published && !patch.published_at) {
      patch.published_at = new Date().toISOString();
    }
    if (!patch.published) {
      patch.published_at = null;
    }
  }
  const { data, error } = await supabase
    .from('blog_posts')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Admin: delete a post by id. */
export async function adminDeletePost(id) {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Convert a Supabase error coming from an insert/update into a human-friendly
 * message. In particular surfaces the 23505 unique-violation on slug.
 */
export function formatPostError(err) {
  if (!err) return 'Unknown error';
  const msg = err.message || String(err);
  if (err.code === '23505' || /duplicate key/i.test(msg)) {
    return 'A post with this slug already exists — pick a different slug.';
  }
  if (err.code === '23514' || /check constraint/i.test(msg)) {
    if (/slug/i.test(msg)) return 'Slug must be lowercase letters, numbers, and hyphens only.';
    if (/title/i.test(msg)) return 'Title must be between 3 and 300 characters.';
    if (/content/i.test(msg)) return 'Content cannot be empty.';
  }
  return msg;
}
