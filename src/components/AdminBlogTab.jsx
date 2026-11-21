// Admin dashboard tab: manage DB-backed blog posts (list + editor + preview).
// Lives under src/components/ to match the convention used by other admin
// surfaces (BlogComments, LikeButton, etc.) and keeps AdminDashboard.jsx
// surgical.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  adminListPosts,
  adminCreatePost,
  adminUpdatePost,
  adminDeletePost,
  adminPublishPost,
  adminReturnToDraft,
  formatPostError,
  isValidSlug,
} from '../utils/blogPosts';
import { renderMarkdown } from '../utils/blogRenderer';
import EmojiPicker from './EmojiPicker';
import './AdminBlogTab.css';

const EMPTY_DRAFT = {
  id: null,
  slug: '',
  title: '',
  excerpt: '',
  category: 'Best Practices',
  icon: '📝',
  content: '',
  author: 'Cloud Canvas Team',
  read_time: '',
  meta_description: '',
  keywords: '',
  published: false,
  published_at: null,
  submitted_for_review: false,
};

const CATEGORY_OPTIONS = [
  'Best Practices',
  'Networking',
  'DevOps',
  'Compute',
  'Cost',
  'Security',
  'Data',
  'Identity',
  'Observability',
  'Migration',
  'Architecture',
  'Product Guide',
];

const fmt = (iso) =>
  iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const slugify = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);

// Which row-state bucket a post belongs to — mirrors the four filter options.
const bucketOf = (p) => {
  if (p.published) return 'published';
  if (p.submitted_for_review) return 'pending';
  return 'draft';
};

export default function AdminBlogTab({ user, onFlash }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null); // null = no editor open
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [filter, setFilter] = useState('all'); // all | draft | pending | published
  const [previewPost, setPreviewPost] = useState(null); // inline preview modal (any status)

  const flash = useCallback(
    (type, text) => {
      if (typeof onFlash === 'function') onFlash(type, text);
    },
    [onFlash]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await adminListPosts();
      setPosts(rows);
    } catch (err) {
      flash('error', 'Failed to load blog posts: ' + formatPostError(err));
    } finally {
      setLoading(false);
    }
  }, [flash]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === 'all') return posts;
    return posts.filter((p) => bucketOf(p) === filter);
  }, [posts, filter]);

  const stats = useMemo(
    () => ({
      total: posts.length,
      published: posts.filter((p) => p.published).length,
      pending: posts.filter((p) => !p.published && p.submitted_for_review).length,
      drafts: posts.filter((p) => !p.published && !p.submitted_for_review).length,
    }),
    [posts]
  );

  const openNew = () => {
    setLocalError(null);
    setDraft({ ...EMPTY_DRAFT });
  };

  const openEdit = (post) => {
    setLocalError(null);
    setDraft({
      id: post.id,
      slug: post.slug || '',
      title: post.title || '',
      excerpt: post.excerpt || '',
      category: post.category || 'Best Practices',
      icon: post.icon || '📝',
      content: post.content || '',
      author: post.author || 'Cloud Canvas Team',
      read_time: post.read_time || '',
      meta_description: post.meta_description || '',
      keywords: post.keywords || '',
      published: !!post.published,
      published_at: post.published_at || null,
      submitted_for_review: !!post.submitted_for_review,
    });
  };

  const closeEditor = () => {
    setDraft(null);
    setLocalError(null);
  };

  const patchDraft = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const validate = (d) => {
    if (!d.title || d.title.trim().length < 3) return 'Title must be at least 3 characters.';
    if (!d.slug) return 'Slug is required.';
    if (!isValidSlug(d.slug)) return 'Slug must be lowercase letters, numbers, and hyphens only.';
    if (!d.content || !d.content.trim()) return 'Content cannot be empty.';
    // Client-side uniqueness check (DB still enforces via UNIQUE index).
    const clash = posts.find((p) => p.slug === d.slug && p.id !== d.id);
    if (clash) return 'A post with this slug already exists — pick a different slug.';
    return null;
  };

  const persist = async (overrides = {}) => {
    const d = { ...draft, ...overrides };
    const err = validate(d);
    if (err) {
      setLocalError(err);
      return;
    }
    setSaving(true);
    setLocalError(null);
    try {
      const nowPublishing = !!d.published;
      const fields = {
        slug: d.slug,
        title: d.title.trim(),
        excerpt: d.excerpt || null,
        category: d.category || null,
        icon: d.icon || null,
        content: d.content,
        author: d.author || 'Cloud Canvas Team',
        read_time: d.read_time || null,
        meta_description: d.meta_description || null,
        keywords: d.keywords || null,
        published: nowPublishing,
        // Publishing always clears any pending-review flag; unpublishing leaves it alone.
        submitted_for_review: nowPublishing ? false : !!d.submitted_for_review,
      };
      let saved;
      if (d.id) {
        saved = await adminUpdatePost(d.id, fields);
        flash('success', `✅ Saved "${saved.title}"`);
      } else {
        saved = await adminCreatePost(fields, user?.id);
        flash('success', `✅ Created "${saved.title}"`);
      }
      await load();
      // keep the editor open on the freshly saved row for continued editing
      setDraft({
        id: saved.id,
        slug: saved.slug,
        title: saved.title,
        excerpt: saved.excerpt || '',
        category: saved.category || 'Best Practices',
        icon: saved.icon || '📝',
        content: saved.content || '',
        author: saved.author || 'Cloud Canvas Team',
        read_time: saved.read_time || '',
        meta_description: saved.meta_description || '',
        keywords: saved.keywords || '',
        published: !!saved.published,
        published_at: saved.published_at || null,
        submitted_for_review: !!saved.submitted_for_review,
      });
    } catch (err) {
      setLocalError(formatPostError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = () => persist({ published: false });
  const handlePublish = () => persist({ published: true });
  const handleUnpublish = () => persist({ published: false });

  const handleQuickPublishToggle = async (post) => {
    const wantPublish = !post.published;
    const msg = wantPublish
      ? `Publish "${post.title}"?\n\nAnyone visiting /blog/${post.slug} will see it.`
      : `Unpublish "${post.title}"?\n\nIt will disappear from /blog but stay as a draft.`;
    if (!window.confirm(msg)) return;
    try {
      if (wantPublish) {
        await adminPublishPost(post.id);
      } else {
        await adminUpdatePost(post.id, { published: false });
      }
      flash('success', wantPublish ? `✅ Published "${post.title}"` : `✅ Unpublished "${post.title}"`);
      await load();
    } catch (err) {
      flash('error', formatPostError(err));
    }
  };

  const handleReturnToDraft = async (post) => {
    if (
      !window.confirm(
        `Return "${post.title}" to the author as a draft?\n\nThe post leaves the review queue and the author can keep editing. It will not be published.`
      )
    )
      return;
    try {
      await adminReturnToDraft(post.id);
      flash('success', `↩️ Returned "${post.title}" to draft`);
      await load();
    } catch (err) {
      flash('error', formatPostError(err));
    }
  };

  const handleDelete = async (post) => {
    if (
      !window.confirm(
        `Delete "${post.title}" permanently?\n\nThis removes it from Supabase. Static articles in blogArticles.js are not affected.`
      )
    )
      return;
    try {
      await adminDeletePost(post.id);
      flash('success', `🗑️ Deleted "${post.title}"`);
      if (draft && draft.id === post.id) closeEditor();
      await load();
    } catch (err) {
      flash('error', formatPostError(err));
    }
  };

  // Live preview HTML — reuse the same renderer the public article page uses.
  const previewHtml = useMemo(
    () => (draft ? renderMarkdown(draft.content || '') : ''),
    [draft]
  );

  // Standalone preview modal HTML — rendered from the already-loaded list row
  // (adminListPosts returns `select('*')` so `content` is already present).
  const previewModalHtml = useMemo(
    () => (previewPost ? renderMarkdown(previewPost.content || '') : ''),
    [previewPost]
  );

  // Esc closes the standalone preview modal. Scoped to when it is open so we
  // don't attach a listener while idle.
  useEffect(() => {
    if (!previewPost) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setPreviewPost(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewPost]);

  return (
    <div className="ad-blog-tab">
      <div className="ad-blog-toolbar">
        <div className="ad-blog-stats">
          <span className="ad-blog-stat">
            <strong>{stats.total}</strong> total
          </span>
          <span className="ad-blog-stat ad-blog-stat-pub">
            <strong>{stats.published}</strong> published
          </span>
          <span className="ad-blog-stat ad-blog-stat-pending">
            <strong>{stats.pending}</strong> pending review
          </span>
          <span className="ad-blog-stat ad-blog-stat-draft">
            <strong>{stats.drafts}</strong> drafts
          </span>
        </div>
        <div className="ad-blog-toolbar-right">
          <select
            className="ad-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            title="Filter by status"
          >
            <option value="all">All posts</option>
            <option value="draft">Admin Drafts</option>
            <option value="pending">Pending Review</option>
            <option value="published">Published</option>
          </select>
          <button className="ad-btn ad-btn-outline" onClick={load} disabled={loading}>
            {loading ? '⏳' : '🔄'} Refresh
          </button>
          <button className="ad-btn ad-btn-primary" onClick={openNew}>
            ＋ New Post
          </button>
        </div>
      </div>

      <div className="ad-table-wrap">
        {loading ? (
          <div className="ad-loading">⏳ Loading posts…</div>
        ) : filtered.length === 0 ? (
          <div className="ad-empty">
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            <div>
              {posts.length === 0
                ? 'No blog posts yet. Click "＋ New Post" to create one.'
                : 'No posts match this filter.'}
            </div>
            {posts.length === 0 && (
              <small style={{ color: '#9ca3af', marginTop: 8, display: 'block' }}>
                Make sure the <code>blog_posts</code> table and RLS policies from{' '}
                <code>docs/ADD_BLOG_POSTS_TABLE.sql</code> have been applied to Supabase.
              </small>
            )}
          </div>
        ) : (
          <table className="ad-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Icon</th>
                <th>Title / Slug</th>
                <th style={{ width: 160 }}>Author</th>
                <th style={{ width: 140 }}>Category</th>
                <th style={{ width: 130 }}>Status</th>
                <th style={{ width: 170 }}>Updated</th>
                <th style={{ width: 80 }}>Views</th>
                <th style={{ width: 300 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => {
                const bucket = bucketOf(post);
                return (
                  <tr key={post.id} className="ad-row">
                    <td style={{ fontSize: 22, textAlign: 'center' }}>{post.icon || '📝'}</td>
                    <td className="ad-cell-email" style={{ maxWidth: 'none' }}>
                      <div style={{ fontWeight: 700 }}>{post.title}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'Consolas, monospace' }}>
                        /blog/{post.slug}
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: '#374151' }}>
                      <div style={{ fontWeight: 600 }}>{post.author || '—'}</div>
                      {post.author_email && (
                        <div style={{ fontSize: 11, color: '#6b7280' }}>{post.author_email}</div>
                      )}
                    </td>
                    <td>
                      <span className="ad-blog-cat-pill">{post.category || '—'}</span>
                    </td>
                    <td>
                      {bucket === 'published' && (
                        <span className="ad-blog-status ad-blog-published">● Published</span>
                      )}
                      {bucket === 'pending' && (
                        <span className="ad-blog-status ad-blog-pending">⏳ Pending Review</span>
                      )}
                      {bucket === 'draft' && (
                        <span className="ad-blog-status ad-blog-draft">○ Draft</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: '#6b7280' }}>{fmt(post.updated_at)}</td>
                    <td className="ad-center">{post.view_count || 0}</td>
                    <td>
                      <div className="ad-actions">
                        <button
                          className="ad-act ad-act-reset"
                          onClick={() => setPreviewPost(post)}
                          title="Preview rendered post (works for drafts and pending too)"
                        >
                          👁 Preview
                        </button>
                        <button
                          className="ad-act ad-act-plan"
                          onClick={() => openEdit(post)}
                          title="Edit this post"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className={`ad-act ${post.published ? 'ad-act-revoke' : 'ad-act-extend'}`}
                          onClick={() => handleQuickPublishToggle(post)}
                          title={post.published ? 'Hide from /blog' : 'Make visible on /blog'}
                        >
                          {post.published ? '🚫 Unpublish' : '🚀 Publish'}
                        </button>
                        {bucket === 'pending' && (
                          <button
                            className="ad-act ad-act-reset"
                            onClick={() => handleReturnToDraft(post)}
                            title="Clear the review flag without publishing"
                          >
                            ↩️ Return to Draft
                          </button>
                        )}
                        <a
                          className="ad-act ad-act-reset"
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title={post.published ? 'Open live article' : 'Preview (only you can see drafts)'}
                        >
                          🔗 Open
                        </a>
                        <button
                          className="ad-act ad-act-ban"
                          onClick={() => handleDelete(post)}
                          title="Delete permanently"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {draft && (
        <div className="ad-overlay" onClick={closeEditor}>
          <div
            className="ad-modal ad-blog-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="ad-modal-x" onClick={closeEditor}>
              ✕
            </button>
            <h3>{draft.id ? '✏️ Edit Blog Post' : '＋ New Blog Post'}</h3>
            {draft.id && (
              <p className="ad-modal-email">
                /blog/{draft.slug} ·{' '}
                {draft.published
                  ? 'Published'
                  : draft.submitted_for_review
                  ? 'Pending Review'
                  : 'Draft'}
                {' · updated '}
                {fmt(draft.published_at || null) || 'not yet published'}
              </p>
            )}

            {localError && <div className="ad-blog-err">⚠️ {localError}</div>}

            <div className="ad-blog-form">
              <div className="ad-blog-form-grid">
                <label className="ad-blog-field ad-blog-field-wide">
                  <span>Title *</span>
                  <input
                    className="ad-modal-input"
                    value={draft.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      patchDraft({
                        title,
                        // auto-fill slug while creating, never overwrite on edit
                        slug: !draft.id && !draft.slug ? slugify(title) : draft.slug,
                      });
                    }}
                    placeholder="e.g. Azure Hub-Spoke with Private Endpoints in Terraform"
                  />
                </label>

                <label className="ad-blog-field ad-blog-field-wide">
                  <span>Slug * (lowercase, hyphens only — appears as /blog/your-slug)</span>
                  <input
                    className="ad-modal-input"
                    value={draft.slug}
                    onChange={(e) => patchDraft({ slug: slugify(e.target.value) })}
                    placeholder="hub-spoke-private-endpoints-terraform"
                  />
                </label>

                <label className="ad-blog-field">
                  <span>Category</span>
                  <select
                    className="ad-modal-input"
                    value={draft.category}
                    onChange={(e) => patchDraft({ category: e.target.value })}
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="ad-blog-field">
                  <span>Icon</span>
                  <EmojiPicker
                    className="ad-modal-input"
                    value={draft.icon}
                    onChange={(v) => patchDraft({ icon: v })}
                  />
                </label>

                <label className="ad-blog-field">
                  <span>Author</span>
                  <input
                    className="ad-modal-input"
                    value={draft.author}
                    onChange={(e) => patchDraft({ author: e.target.value })}
                    placeholder="Cloud Canvas Team"
                  />
                </label>

                <label className="ad-blog-field">
                  <span>Read time</span>
                  <input
                    className="ad-modal-input"
                    value={draft.read_time}
                    onChange={(e) => patchDraft({ read_time: e.target.value })}
                    placeholder="6 min read"
                  />
                </label>

                <label className="ad-blog-field ad-blog-field-wide">
                  <span>Excerpt (shows on the /blog listing card)</span>
                  <textarea
                    className="ad-modal-input"
                    style={{ minHeight: 70, resize: 'vertical' }}
                    value={draft.excerpt}
                    onChange={(e) => patchDraft({ excerpt: e.target.value })}
                    placeholder="One or two sentences that make a reader want to click."
                  />
                </label>

                <label className="ad-blog-field ad-blog-field-wide">
                  <span>Meta description (SEO — ~155 chars)</span>
                  <textarea
                    className="ad-modal-input"
                    style={{ minHeight: 60, resize: 'vertical' }}
                    value={draft.meta_description}
                    onChange={(e) => patchDraft({ meta_description: e.target.value })}
                    placeholder="Shown in Google search results below the title."
                  />
                </label>

                <label className="ad-blog-field ad-blog-field-wide">
                  <span>Keywords (comma-separated)</span>
                  <input
                    className="ad-modal-input"
                    value={draft.keywords}
                    onChange={(e) => patchDraft({ keywords: e.target.value })}
                    placeholder="azure, hub-spoke, terraform, private endpoints"
                  />
                </label>
              </div>

              <div className="ad-blog-editor-split">
                <div className="ad-blog-editor-pane">
                  <div className="ad-blog-pane-head">
                    <span>Content (Markdown)</span>
                    <small>
                      Supports headings, lists, tables, fenced code blocks, and callouts (<code>&gt; [!NOTE]</code>,
                      <code> [!TIP]</code>, <code>[!WARNING]</code>).
                    </small>
                  </div>
                  <textarea
                    className="ad-blog-content"
                    value={draft.content}
                    onChange={(e) => patchDraft({ content: e.target.value })}
                    placeholder={'# Your article title\n\nIntro paragraph here.\n\n## Section\n\n- Bullet one\n- Bullet two'}
                    spellCheck
                  />
                </div>
                <div className="ad-blog-editor-pane">
                  <div className="ad-blog-pane-head">
                    <span>Live preview</span>
                    <small>Renders with the same pipeline used by /blog/your-slug.</small>
                  </div>
                  <div
                    className="cc-article-body ad-blog-preview"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              </div>
            </div>

            <div className="ad-modal-footer ad-blog-footer">
              <label className="ad-blog-published-toggle">
                <input
                  type="checkbox"
                  checked={!!draft.published}
                  onChange={(e) => patchDraft({ published: e.target.checked })}
                />
                <span>Published</span>
              </label>
              <div style={{ flex: 1 }} />
              <button className="ad-btn ad-btn-outline" onClick={closeEditor} disabled={saving}>
                Cancel
              </button>
              {draft.published ? (
                <button className="ad-btn ad-btn-outline" onClick={handleUnpublish} disabled={saving}>
                  🚫 Unpublish
                </button>
              ) : (
                <button className="ad-btn ad-btn-success" onClick={handlePublish} disabled={saving}>
                  🚀 Publish
                </button>
              )}
              <button className="ad-btn ad-btn-primary" onClick={handleSaveDraft} disabled={saving}>
                {saving ? '⏳ Saving…' : '💾 Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {previewPost && (
        <div className="ad-overlay" onClick={() => setPreviewPost(null)}>
          <div
            className="ad-modal ad-blog-modal ad-blog-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="ad-modal-x" onClick={() => setPreviewPost(null)} title="Close (Esc)">
              ✕
            </button>
            <h3>
              <span style={{ marginRight: 8 }}>{previewPost.icon || '📝'}</span>
              {previewPost.title}
            </h3>
            <div className="ad-blog-preview-meta">
              {(() => {
                const b = bucketOf(previewPost);
                if (b === 'published') return <span className="ad-blog-status ad-blog-published">● Published</span>;
                if (b === 'pending')   return <span className="ad-blog-status ad-blog-pending">⏳ Pending Review</span>;
                return <span className="ad-blog-status ad-blog-draft">○ Draft</span>;
              })()}
              <span className="ad-blog-cat-pill">{previewPost.category || '—'}</span>
              <span className="ad-blog-preview-meta-item">
                <code>/blog/{previewPost.slug}</code>
              </span>
              <span className="ad-blog-preview-meta-item">
                ✍️ {previewPost.author || '—'}
                {previewPost.author_email ? ` · ${previewPost.author_email}` : ''}
              </span>
              {previewPost.read_time && (
                <span className="ad-blog-preview-meta-item">⏱ {previewPost.read_time}</span>
              )}
              <span className="ad-blog-preview-meta-item">Created {fmt(previewPost.created_at)}</span>
              <span className="ad-blog-preview-meta-item">Updated {fmt(previewPost.updated_at)}</span>
              {previewPost.published_at && (
                <span className="ad-blog-preview-meta-item">Published {fmt(previewPost.published_at)}</span>
              )}
            </div>
            {previewPost.excerpt && (
              <p className="ad-blog-preview-excerpt">{previewPost.excerpt}</p>
            )}
            <div
              className="cc-article-body ad-blog-preview ad-blog-preview-body"
              dangerouslySetInnerHTML={{ __html: previewModalHtml }}
            />
            <div className="ad-modal-footer ad-blog-footer">
              <div style={{ flex: 1 }} />
              <button className="ad-btn ad-btn-outline" onClick={() => setPreviewPost(null)}>
                Close
              </button>
              <button
                className="ad-btn ad-btn-primary"
                onClick={() => {
                  const p = previewPost;
                  setPreviewPost(null);
                  openEdit(p);
                }}
              >
                ✏️ Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
