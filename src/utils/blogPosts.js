// Blog Posts — DB-backed posts stored in the `blog_posts` Supabase table.
// Reads use the ANON key (RLS limits anonymous visitors to published rows).
// Writes require either an admin-matched session (see docs/ADD_BLOG_POSTS_TABLE.sql
// and src/utils/adminConfig.js — the same email allowlist) OR the row's own
// author for user-scoped drafts / pending submissions (see
// docs/ADD_BLOG_USER_SUBMISSIONS.sql).

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
 *
 * Also passes through `submitted_for_review` and `created_by` so admin + user
 * surfaces can tell draft from pending from published without extra fetches.
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
    submittedForReview: !!row.submitted_for_review,
    createdBy: row.created_by || null,
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

/**
 * Admin: list every post, drafts included, newest first. The returned rows
 * are augmented with `author_email` resolved via a secondary lookup on
 * `public.profiles` (same table the admin dashboard loads users from — see
 * AdminDashboard.jsx `loadUsers`). We join client-side so this file does not
 * depend on a server-side view.
 */
export async function adminListPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  const rows = data || [];

  // Collect distinct author uuids and resolve emails in a single round-trip.
  const uuids = Array.from(
    new Set(rows.map((r) => r.created_by).filter(Boolean))
  );
  let emailById = new Map();
  if (uuids.length > 0) {
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', uuids);
    if (pErr) {
      // Non-fatal — table may be RLS-limited for non-service callers; the
      // admin dashboard shows a similar banner and falls back gracefully.
      console.warn('[blogPosts] author email lookup failed:', pErr.message);
    } else {
      emailById = new Map((profiles || []).map((p) => [p.id, p.email]));
    }
  }

  return rows.map((r) => ({
    ...r,
    author_email: r.created_by ? emailById.get(r.created_by) || null : null,
  }));
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

/**
 * Admin convenience: publish a post. Always clears `submitted_for_review`
 * (a post that reached "published" is no longer "pending review") and stamps
 * `published_at` if not already set.
 */
export async function adminPublishPost(id) {
  return adminUpdatePost(id, {
    published: true,
    submitted_for_review: false,
    published_at: new Date().toISOString(),
  });
}

/**
 * Admin convenience: send a pending submission back to the author as a draft
 * without publishing it. Clears `submitted_for_review` but leaves ownership
 * and content alone, so the user can keep editing and re-submit later.
 */
export async function adminReturnToDraft(id) {
  return adminUpdatePost(id, {
    submitted_for_review: false,
    published: false,
  });
}

/** Admin: delete a post by id. */
export async function adminDeletePost(id) {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) throw error;
}

// ── User-scoped helpers (RLS enforces ownership) ───────────────────────────

const USER_WRITABLE_FIELDS = [
  'slug',
  'title',
  'excerpt',
  'category',
  'icon',
  'content',
  'author',
  'read_time',
  'meta_description',
  'keywords',
  'submitted_for_review',
];

// Keep `published` and `created_by` out of any user payload. RLS also blocks
// these, but filtering client-side avoids confusing 42501 errors on a typo.
const pickUserWritable = (fields) => {
  const out = {};
  for (const k of USER_WRITABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(fields, k)) out[k] = fields[k];
  }
  return out;
};

/** User: list the posts the current user has authored, newest first. */
export async function fetchMyPosts(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('created_by', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * User: create a new draft (or submit) owned by the caller. `published` is
 * never sent and will default to false per the DB; `submitted_for_review`
 * may be set to `true` when calling from the "Submit for Review" action.
 */
export async function userCreatePost(fields, userId) {
  if (!userId) throw new Error('Not signed in');
  const payload = {
    ...pickUserWritable(fields),
    created_by: userId,
    // Do not send `published` — DB default is false and RLS requires false on insert.
  };
  const { data, error } = await supabase
    .from('blog_posts')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * User: patch one of their own non-published posts. The RLS policy already
 * blocks editing a published row, but we also strip `published` and
 * `created_by` from the payload so a careless caller cannot accidentally
 * attempt to flip either field.
 */
export async function userUpdatePost(id, fields, userId) {
  if (!userId) throw new Error('Not signed in');
  const payload = pickUserWritable(fields);
  const { data, error } = await supabase
    .from('blog_posts')
    .update(payload)
    .eq('id', id)
    .eq('created_by', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** User: flip `submitted_for_review=true` on their own non-published row. */
export async function userSubmitForReview(id, userId) {
  return userUpdatePost(id, { submitted_for_review: true }, userId);
}

/** User: delete one of their own non-published posts. */
export async function userDeletePost(id, userId) {
  if (!userId) throw new Error('Not signed in');
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)
    .eq('created_by', userId);
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
  if (err.code === '42501' || /row-level security/i.test(msg)) {
    return 'You do not have permission to change this post. Published posts cannot be edited by the author — contact an admin.';
  }
  return msg;
}
