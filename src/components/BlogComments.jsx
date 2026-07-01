// BlogComments — inline comment thread under each blog article.
// Logged-in users can post; anyone can read; authors can delete their own.

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchComments, postComment, deleteComment } from '../utils/blogComments';
import { isAdminEmail } from '../utils/adminConfig';
import './BlogComments.css';

const MAX_LEN = 2000;

// Simple HTML-escape for safe display (RLS + regex on server side handle bad inputs;
// this is defense in depth against XSS in existing rows).
const escapeHtml = (s = '') =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Turn URLs into safe links + preserve line breaks
const formatContent = (text) => {
  const escaped = escapeHtml(text);
  return escaped
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer nofollow">$1</a>'
    )
    .replace(/\n/g, '<br/>');
};

const timeAgo = (iso) => {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min${m === 1 ? '' : 's'} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const initialsOf = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?';

const avatarColor = (seed = '') => {
  // Deterministic color from name
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const palette = [
    'linear-gradient(135deg,#0078D4,#50E6FF)',
    'linear-gradient(135deg,#8b5cf6,#ec4899)',
    'linear-gradient(135deg,#10b981,#059669)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
    'linear-gradient(135deg,#0891b2,#06b6d4)',
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
  ];
  return palette[h % palette.length];
};

const BlogComments = ({ slug }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const rows = await fetchComments(slug);
    setComments(rows);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setErr(null);
    setOk(null);
    setPosting(true);
    const res = await postComment({ slug, content: text, user });
    setPosting(false);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setText('');
    setOk('Your comment was posted.');
    setComments((cur) => [res.comment, ...cur]);
    setTimeout(() => setOk(null), 3500);
  };

  const removeOne = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    const res = await deleteComment(id);
    if (res.ok) setComments((cur) => cur.filter((c) => c.id !== id));
  };

  const canDelete = (c) =>
    isAuthenticated && (c.user_id === user?.id || isAdminEmail(user?.email));

  const remaining = MAX_LEN - text.length;

  return (
    <section className="blog-comments" aria-label="Community notes">
      <div className="bc-header">
        <h3 className="bc-title">
          💬 Community Notes
          <span className="bc-count">{loading ? '' : `(${comments.length})`}</span>
        </h3>
        <p className="bc-sub">
          Share your take, ask a question, or add extra context for other readers.
        </p>
      </div>

      {/* Composer or sign-in prompt */}
      {isAuthenticated ? (
        <form className="bc-composer" onSubmit={submit}>
          <div className="bc-composer-header">
            <div className="bc-avatar" style={{ background: avatarColor(user?.name || user?.email || '') }}>
              {initialsOf(user?.name || user?.email || '')}
            </div>
            <span className="bc-composer-user">
              Posting as <strong>{user?.name || user?.email?.split('@')[0]}</strong>
            </span>
          </div>
          <textarea
            className="bc-textarea"
            placeholder="Add your note…"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
            maxLength={MAX_LEN}
            rows={4}
            disabled={posting}
          />
          <div className="bc-composer-footer">
            <span className={`bc-counter ${remaining < 100 ? 'low' : ''}`}>
              {remaining} chars left
            </span>
            <button
              type="submit"
              className="bc-submit"
              disabled={posting || text.trim().length < 3}
            >
              {posting ? 'Posting…' : 'Post note'}
            </button>
          </div>
          {err && <div className="bc-err">⚠️ {err}</div>}
          {ok && <div className="bc-ok">✅ {ok}</div>}
        </form>
      ) : (
        <div className="bc-signin-cta">
          <span>Sign in to leave a note on this article.</span>
          <Link to="/login" className="bc-signin-btn">Sign in</Link>
          <Link to="/signup" className="bc-signup-link">or start a free trial →</Link>
        </div>
      )}

      {/* Comments list */}
      <div className="bc-list">
        {loading && <div className="bc-empty">Loading notes…</div>}
        {!loading && comments.length === 0 && (
          <div className="bc-empty">Be the first to add a note.</div>
        )}
        {!loading &&
          comments.map((c) => (
            <article key={c.id} className="bc-item">
              <div className="bc-avatar" style={{ background: avatarColor(c.user_name) }}>
                {initialsOf(c.user_name)}
              </div>
              <div className="bc-body">
                <header className="bc-meta">
                  <strong className="bc-user">{c.user_name}</strong>
                  <span className="bc-dot">·</span>
                  <time
                    className="bc-time"
                    dateTime={c.created_at}
                    title={new Date(c.created_at).toLocaleString()}
                  >
                    {timeAgo(c.created_at)}
                  </time>
                  {canDelete(c) && (
                    <button
                      type="button"
                      className="bc-delete"
                      onClick={() => removeOne(c.id)}
                      aria-label="Delete comment"
                    >
                      Delete
                    </button>
                  )}
                </header>
                <div
                  className="bc-content"
                  dangerouslySetInnerHTML={{ __html: formatContent(c.content) }}
                />
              </div>
            </article>
          ))}
      </div>
    </section>
  );
};

export default BlogComments;
