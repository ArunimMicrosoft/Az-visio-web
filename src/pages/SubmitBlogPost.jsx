// Logged-in users draft and submit blog posts here. An admin publishes them
// from the admin portal — users never flip the `published` flag themselves.
//
// Auth is enforced inside the page so logged-out visitors are redirected to
// /login with a returnTo pointer back to /blog/submit. That keeps the route
// public (no ProtectedRoute wrapper) and leaves the hard-expired plan gate
// out of the way — writing a draft shouldn't need an active paid plan.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchMyPosts,
  userCreatePost,
  userUpdatePost,
  userDeletePost,
  userSubmitForReview,
  formatPostError,
  isValidSlug,
} from '../utils/blogPosts';
import { BlogHeader, BlogFooter } from '../components/BlogLayout';
import { renderMarkdown } from '../utils/blogRenderer';
import EmojiPicker from '../components/EmojiPicker';
import usePageSEO from '../hooks/usePageSEO';
import './Blog.css';
import './SubmitBlogPost.css';

const EMPTY_DRAFT = {
  id: null,
  slug: '',
  title: '',
  excerpt: '',
  category: 'Best Practices',
  icon: '📝',
  content: '',
  author: '',
  read_time: '',
  meta_description: '',
  keywords: '',
  submitted_for_review: false,
  published: false,
  published_at: null,
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

const slugify = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const statusOf = (p) => {
  if (p.published) return 'published';
  if (p.submitted_for_review) return 'pending';
  return 'draft';
};

const STATUS_LABEL = {
  draft:     { label: 'Draft',          pill: 'cc-submit-pill cc-submit-pill-draft' },
  pending:   { label: 'Pending Review', pill: 'cc-submit-pill cc-submit-pill-pending' },
  published: { label: 'Published',      pill: 'cc-submit-pill cc-submit-pill-published' },
};

const SubmitBlogPost = () => {
  usePageSEO({
    title: 'Submit an Azure article — Cloud Canvas Blog',
    description:
      'Draft a blog post about Azure architecture, networking, cost, or security. Our admins review submissions before publishing to the Learn Center.',
    canonical: 'https://cloudcanvas.co/blog/submit',
    type: 'website',
  });

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Auth gate — mirror the pattern used for protected UX (useAuth from
  // AuthContext) but route to /login with a returnTo so the user lands
  // back here after signing in.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?returnTo=/blog/submit', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({
    ...EMPTY_DRAFT,
    author: user?.name || user?.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [flash, setFlash] = useState(null);

  const showFlash = useCallback((type, text) => {
    setFlash({ type, text });
    window.clearTimeout(showFlash._t);
    showFlash._t = window.setTimeout(() => setFlash(null), 4500);
  }, []);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const rows = await fetchMyPosts(user.id);
      setMyPosts(rows);
    } catch (err) {
      showFlash('error', 'Could not load your posts: ' + formatPostError(err));
    } finally {
      setLoading(false);
    }
  }, [user?.id, showFlash]);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => {
    const out = { pending: [], draft: [], published: [] };
    for (const p of myPosts) out[statusOf(p)].push(p);
    return out;
  }, [myPosts]);

  const isReadOnly = !!draft.published;

  const openFresh = () => {
    setLocalError(null);
    setDraft({
      ...EMPTY_DRAFT,
      author: user?.name || user?.email || '',
    });
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
      author: post.author || user?.name || user?.email || '',
      read_time: post.read_time || '',
      meta_description: post.meta_description || '',
      keywords: post.keywords || '',
      submitted_for_review: !!post.submitted_for_review,
      published: !!post.published,
      published_at: post.published_at || null,
    });
    // Scroll the editor into view for small screens
    setTimeout(() => {
      const el = document.getElementById('cc-submit-editor');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 10);
  };

  const patchDraft = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const validate = (d) => {
    if (!d.title || d.title.trim().length < 3) return 'Title must be at least 3 characters.';
    if (!d.slug) return 'Slug is required.';
    if (!isValidSlug(d.slug)) return 'Slug must be lowercase letters, numbers, and hyphens only.';
    if (!d.content || !d.content.trim()) return 'Content cannot be empty.';
    // Client-side uniqueness against this user's own posts (admin-owned posts
    // can still clash on the DB side — surfaced via formatPostError's 23505).
    const clash = myPosts.find((p) => p.slug === d.slug && p.id !== d.id);
    if (clash) return 'A post with this slug already exists on your account — pick a different slug.';
    return null;
  };

  const persist = async ({ submit = false } = {}) => {
    if (isReadOnly) return; // Published posts are read-only to the author.
    const err = validate(draft);
    if (err) {
      setLocalError(err);
      return;
    }
    setSaving(true);
    setLocalError(null);
    try {
      const fields = {
        slug: draft.slug,
        title: draft.title.trim(),
        excerpt: draft.excerpt || null,
        category: draft.category || null,
        icon: draft.icon || null,
        content: draft.content,
        author: draft.author || user?.name || user?.email || 'Community contributor',
        read_time: draft.read_time || null,
        meta_description: draft.meta_description || null,
        keywords: draft.keywords || null,
        submitted_for_review: submit ? true : !!draft.submitted_for_review,
      };
      let saved;
      if (draft.id) {
        saved = await userUpdatePost(draft.id, fields, user.id);
      } else {
        saved = await userCreatePost(fields, user.id);
      }
      await load();
      setDraft((d) => ({
        ...d,
        id: saved.id,
        slug: saved.slug,
        submitted_for_review: !!saved.submitted_for_review,
        published: !!saved.published,
        published_at: saved.published_at || null,
      }));
      showFlash(
        'success',
        submit
          ? '✅ Submitted for review. An admin will take a look soon.'
          : '💾 Draft saved.'
      );
    } catch (err) {
      setLocalError(formatPostError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = () => persist({ submit: false });
  const handleSubmitForReview = () => persist({ submit: true });

  const handleDelete = async (post) => {
    if (post.published) return; // Safety: the RLS policy already blocks this.
    if (
      !window.confirm(
        `Delete "${post.title}"?\n\nThis removes the ${post.submitted_for_review ? 'pending submission' : 'draft'} permanently.`
      )
    )
      return;
    try {
      await userDeletePost(post.id, user.id);
      showFlash('success', `🗑️ Deleted "${post.title}"`);
      if (draft.id === post.id) openFresh();
      await load();
    } catch (err) {
      showFlash('error', formatPostError(err));
    }
  };

  // Quick "Submit this draft now" from the list (no editor opened).
  const handleQuickSubmit = async (post) => {
    if (!window.confirm(`Submit "${post.title}" for review?\n\nAn admin will publish or send it back.`)) return;
    try {
      await userSubmitForReview(post.id, user.id);
      showFlash('success', `📬 Submitted "${post.title}" for review.`);
      await load();
    } catch (err) {
      showFlash('error', formatPostError(err));
    }
  };

  const previewHtml = useMemo(() => renderMarkdown(draft.content || ''), [draft.content]);

  // While auth is resolving, render a minimal placeholder — the redirect
  // effect handles logged-out visitors before this renders anything heavy.
  if (authLoading || !isAuthenticated) {
    return (
      <div className="cc-blog-page">
        <BlogHeader />
        <main className="cc-submit-main">
          <p style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
            ⏳ Checking your session…
          </p>
        </main>
        <BlogFooter />
      </div>
    );
  }

  const renderList = (items, bucket) => {
    if (items.length === 0) return null;
    const meta = STATUS_LABEL[bucket];
    return (
      <section className="cc-submit-group" aria-labelledby={`cc-submit-group-${bucket}`}>
        <h3 id={`cc-submit-group-${bucket}`} className="cc-submit-group-title">
          {meta.label} <span className="cc-submit-group-count">({items.length})</span>
        </h3>
        <ul className="cc-submit-list">
          {items.map((post) => (
            <li
              key={post.id}
              className={`cc-submit-item ${draft.id === post.id ? 'is-active' : ''}`}
            >
              <div className="cc-submit-item-head">
                <span className="cc-submit-item-icon" aria-hidden>
                  {post.icon || '📝'}
                </span>
                <div className="cc-submit-item-body">
                  <div className="cc-submit-item-title">{post.title || '(untitled)'}</div>
                  <div className="cc-submit-item-meta">
                    <span className={meta.pill}>{meta.label}</span>
                    <span className="cc-submit-item-slug">/blog/{post.slug}</span>
                    <span className="cc-submit-item-date">Updated {fmt(post.updated_at)}</span>
                  </div>
                </div>
              </div>
              <div className="cc-submit-item-actions">
                <button
                  type="button"
                  className="cc-submit-btn cc-submit-btn-ghost"
                  onClick={() => openEdit(post)}
                >
                  {post.published ? '👁️ View' : '✏️ Edit'}
                </button>
                {bucket === 'draft' && (
                  <button
                    type="button"
                    className="cc-submit-btn cc-submit-btn-primary"
                    onClick={() => handleQuickSubmit(post)}
                  >
                    📬 Submit for review
                  </button>
                )}
                {bucket !== 'published' && (
                  <button
                    type="button"
                    className="cc-submit-btn cc-submit-btn-danger"
                    onClick={() => handleDelete(post)}
                  >
                    🗑️ Delete
                  </button>
                )}
                {bucket === 'published' && (
                  <Link
                    to={`/blog/${post.slug}`}
                    className="cc-submit-btn cc-submit-btn-ghost"
                  >
                    🔗 Open live
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  };

  return (
    <div className="cc-blog-page">
      <BlogHeader />

      <main className="cc-submit-main">
        <div className="cc-submit-banner">
          <div className="cc-submit-banner-icon" aria-hidden>📝</div>
          <div>
            <div className="cc-submit-banner-title">Your post will be reviewed by an admin before it's published.</div>
            <div className="cc-submit-banner-sub">
              Save as many drafts as you like. When a draft is ready, click <strong>Submit for Review</strong> and we'll
              publish it from the admin portal once we've had a look.
            </div>
          </div>
          <Link to="/blog" className="cc-submit-banner-back">← Back to Learn Center</Link>
        </div>

        {flash && (
          <div className={`cc-submit-flash cc-submit-flash-${flash.type}`} role="status">
            {flash.text}
          </div>
        )}

        <div className="cc-submit-layout">
          <aside className="cc-submit-side">
            <div className="cc-submit-side-head">
              <h2>Your posts</h2>
              <button
                type="button"
                className="cc-submit-btn cc-submit-btn-primary"
                onClick={openFresh}
                disabled={!draft.id && !draft.title && !draft.content}
                title="Start a brand-new draft"
              >
                ＋ New
              </button>
            </div>

            {loading ? (
              <p style={{ color: '#64748b' }}>⏳ Loading…</p>
            ) : myPosts.length === 0 ? (
              <p className="cc-submit-empty">
                No posts yet. Fill out the editor on the right and click <strong>Save draft</strong> to get started.
              </p>
            ) : (
              <>
                {renderList(grouped.pending, 'pending')}
                {renderList(grouped.draft, 'draft')}
                {renderList(grouped.published, 'published')}
              </>
            )}
          </aside>

          <section id="cc-submit-editor" className="cc-submit-editor">
            <header className="cc-submit-editor-head">
              <h2>
                {draft.id
                  ? draft.published
                    ? '👁️ Published post'
                    : draft.submitted_for_review
                    ? '⏳ Pending submission'
                    : '✏️ Edit draft'
                  : '＋ New post'}
              </h2>
              {draft.id && (
                <div className="cc-submit-editor-meta">
                  /blog/{draft.slug}
                  {draft.published_at && <> · published {fmt(draft.published_at)}</>}
                </div>
              )}
            </header>

            {isReadOnly && (
              <div className="cc-submit-readonly">
                🔒 Published — contact an admin to edit this article.
              </div>
            )}

            {localError && <div className="cc-submit-error">⚠️ {localError}</div>}

            <div className="cc-submit-form">
              <div className="cc-submit-grid">
                <label className="cc-submit-field cc-submit-field-wide">
                  <span>Title *</span>
                  <input
                    className="cc-submit-input"
                    value={draft.title}
                    disabled={isReadOnly}
                    onChange={(e) => {
                      const title = e.target.value;
                      patchDraft({
                        title,
                        slug: !draft.id && !draft.slug ? slugify(title) : draft.slug,
                      });
                    }}
                    placeholder="e.g. Deploying Azure Functions with Flex Consumption"
                  />
                </label>

                <label className="cc-submit-field cc-submit-field-wide">
                  <span>Slug * (lowercase, hyphens only — appears as /blog/your-slug)</span>
                  <input
                    className="cc-submit-input"
                    value={draft.slug}
                    disabled={isReadOnly}
                    onChange={(e) => patchDraft({ slug: slugify(e.target.value) })}
                    placeholder="azure-functions-flex-consumption"
                  />
                </label>

                <label className="cc-submit-field">
                  <span>Category</span>
                  <select
                    className="cc-submit-input"
                    value={draft.category}
                    disabled={isReadOnly}
                    onChange={(e) => patchDraft({ category: e.target.value })}
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="cc-submit-field">
                  <span>Icon</span>
                  <EmojiPicker
                    className="cc-submit-input"
                    value={draft.icon}
                    onChange={(v) => !isReadOnly && patchDraft({ icon: v })}
                  />
                </label>

                <label className="cc-submit-field">
                  <span>Author</span>
                  <input
                    className="cc-submit-input"
                    value={draft.author}
                    disabled={isReadOnly}
                    onChange={(e) => patchDraft({ author: e.target.value })}
                    placeholder={user?.name || user?.email || 'Community contributor'}
                  />
                </label>

                <label className="cc-submit-field">
                  <span>Read time</span>
                  <input
                    className="cc-submit-input"
                    value={draft.read_time}
                    disabled={isReadOnly}
                    onChange={(e) => patchDraft({ read_time: e.target.value })}
                    placeholder="6 min read"
                  />
                </label>

                <label className="cc-submit-field cc-submit-field-wide">
                  <span>Excerpt</span>
                  <textarea
                    className="cc-submit-input cc-submit-textarea"
                    value={draft.excerpt}
                    disabled={isReadOnly}
                    onChange={(e) => patchDraft({ excerpt: e.target.value })}
                    placeholder="Two sentences that make a reader want to click."
                  />
                </label>

                <label className="cc-submit-field cc-submit-field-wide">
                  <span>Meta description (SEO — ~155 chars)</span>
                  <textarea
                    className="cc-submit-input cc-submit-textarea"
                    value={draft.meta_description}
                    disabled={isReadOnly}
                    onChange={(e) => patchDraft({ meta_description: e.target.value })}
                    placeholder="Shown in Google search results below the title."
                  />
                </label>

                <label className="cc-submit-field cc-submit-field-wide">
                  <span>Keywords (comma-separated)</span>
                  <input
                    className="cc-submit-input"
                    value={draft.keywords}
                    disabled={isReadOnly}
                    onChange={(e) => patchDraft({ keywords: e.target.value })}
                    placeholder="azure functions, flex consumption, serverless"
                  />
                </label>
              </div>

              <div className="cc-submit-editor-split">
                <div className="cc-submit-pane">
                  <div className="cc-submit-pane-head">
                    <span>Content (Markdown)</span>
                    <small>
                      Supports headings, lists, tables, fenced code blocks, and callouts (<code>&gt; [!NOTE]</code>,
                      <code> [!TIP]</code>, <code>[!WARNING]</code>).
                    </small>
                  </div>
                  <textarea
                    className="cc-submit-content"
                    value={draft.content}
                    disabled={isReadOnly}
                    onChange={(e) => patchDraft({ content: e.target.value })}
                    placeholder={'# Your article title\n\nIntro paragraph.\n\n## Section\n\n- Bullet one\n- Bullet two'}
                    spellCheck
                  />
                </div>
                <div className="cc-submit-pane">
                  <div className="cc-submit-pane-head">
                    <span>Live preview</span>
                    <small>Renders with the same pipeline used by /blog/your-slug.</small>
                  </div>
                  <div
                    className="cc-article-body cc-submit-preview"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              </div>
            </div>

            <footer className="cc-submit-editor-footer">
              <button
                type="button"
                className="cc-submit-btn cc-submit-btn-ghost"
                onClick={openFresh}
                disabled={saving}
              >
                {draft.id ? '↩️ Close' : '🧹 Clear'}
              </button>
              <div style={{ flex: 1 }} />
              {!isReadOnly && (
                <>
                  <button
                    type="button"
                    className="cc-submit-btn cc-submit-btn-ghost"
                    onClick={handleSaveDraft}
                    disabled={saving}
                  >
                    {saving ? '⏳ Saving…' : '💾 Save draft'}
                  </button>
                  <button
                    type="button"
                    className="cc-submit-btn cc-submit-btn-primary"
                    onClick={handleSubmitForReview}
                    disabled={saving}
                  >
                    📬 Submit for Review
                  </button>
                </>
              )}
            </footer>
          </section>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
};

export default SubmitBlogPost;
