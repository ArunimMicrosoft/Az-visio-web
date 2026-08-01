// HomeDashboard — the landing page after login.
// Replaces the blank canvas as the default post-auth destination.
// Purpose: give returning users a reason to poke around instead of bouncing.

import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { listUserDiagrams, loadDiagramFromCloud } from '../utils/diagramStorage';
import { blogArticles, categoryColors } from '../utils/blogArticles';
import { recommendArticles, buildSignals } from '../utils/blogRecommender';
import './HomeDashboard.css';

// Compute consecutive-day login streak from audit LOGIN events.
// Streak = # of unique consecutive calendar days (up to today) with at least one LOGIN.
function computeLoginStreak(loginDates) {
  if (!loginDates || loginDates.length === 0) return 0;
  const dayKeys = new Set(loginDates.map((iso) => new Date(iso).toDateString()));
  let streak = 0;
  const cursor = new Date();
  // Allow either today OR yesterday to seed a streak (grace period until end-of-day)
  const todayKey = cursor.toDateString();
  cursor.setDate(cursor.getDate() - 1);
  const yesterdayKey = cursor.toDateString();
  if (!dayKeys.has(todayKey) && !dayKeys.has(yesterdayKey)) return 0;

  const start = new Date();
  if (!dayKeys.has(todayKey)) start.setDate(start.getDate() - 1);
  const c = new Date(start);
  while (dayKeys.has(c.toDateString())) {
    streak += 1;
    c.setDate(c.getDate() - 1);
  }
  return streak;
}

function fmtRelative(iso) {
  if (!iso) return 'never';
  const then = new Date(iso).getTime();
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function daysBetween(a, b) {
  if (!a || !b) return null;
  return Math.floor(Math.abs(new Date(b) - new Date(a)) / 86_400_000);
}

const THEME_STORAGE_KEY = 'ccd_theme';

const HomeDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [diagrams, setDiagrams] = useState([]);
  const [loadingDiagrams, setLoadingDiagrams] = useState(true);
  const [loginDates, setLoginDates] = useState([]);
  const [profile, setProfile] = useState(null);
  // Full diagram bodies (items/connections/boundaries) for the 5 most recent —
  // used only to feed the personalised blog recommender.
  const [signalDiagrams, setSignalDiagrams] = useState([]);

  // Theme (light | dark) — persists to localStorage and applies to <html>.
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
      // Default to user's OS preference on first visit
      if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch {
      /* localStorage may be unavailable in some sandboxes */
    }
    return 'light';
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch { /* noop */ }
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  // Redirect anonymous users
  useEffect(() => {
    if (!isLoading && !user) navigate('/login');
  }, [user, isLoading, navigate]);

  // Load user's saved diagrams (metadata only — fast)
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await listUserDiagrams(user.id);
        if (!cancelled) setDiagrams(list || []);
      } catch (e) {
        console.warn('Failed to load diagrams:', e.message);
      } finally {
        if (!cancelled) setLoadingDiagrams(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Fetch full body of the 5 most-recent diagrams so we know which services
  // + categories the user actually uses. Powers personalised blog picks.
  useEffect(() => {
    if (!user?.id || diagrams.length === 0) {
      setSignalDiagrams([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const topFive = diagrams.slice(0, 5);
      const results = await Promise.all(
        topFive.map(async (meta) => {
          try {
            return await loadDiagramFromCloud(meta.id, user.id);
          } catch {
            return null;
          }
        })
      );
      if (!cancelled) setSignalDiagrams(results.filter(Boolean));
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, diagrams]);

  // Load recent LOGIN audit events to compute streak
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('audit_logs')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('event', 'LOGIN')
          .gte('created_at', new Date(Date.now() - 60 * 86_400_000).toISOString())
          .order('created_at', { ascending: false })
          .limit(200);
        if (!cancelled) setLoginDates((data || []).map((r) => r.created_at));
      } catch {
        /* non-critical */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Load the fresh profile (has counters that AuthContext user may not reflect)
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!cancelled) setProfile(data || null);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const streak = useMemo(() => computeLoginStreak(loginDates), [loginDates]);
  const daysWithUs = useMemo(
    () => (profile?.created_at ? daysBetween(profile.created_at, new Date()) : 0),
    [profile]
  );

  // Suggested action logic — surfaces the ONE most useful next step
  const suggestions = useMemo(() => {
    const list = [];
    const p = profile || {};

    if (diagrams.length === 0 && (p.diagrams_created || 0) === 0) {
      list.push({
        icon: '🎨',
        title: 'Design your first diagram',
        body: 'A blank canvas is one click away. Or start from a proven template.',
        cta: 'Start now',
        to: '/app',
        color: '#0078D4',
      });
    }
    if (diagrams.length > 0 && (p.templates_used || 0) === 0) {
      list.push({
        icon: '📚',
        title: 'Try a reference template',
        body: '50+ Microsoft-style architectures — hub-spoke, AKS, RAG, DR, and more.',
        cta: 'Browse templates',
        to: '/app',
        color: '#7c3aed',
      });
    }
    if ((p.validations_run || 0) === 0 && diagrams.length > 0) {
      list.push({
        icon: '🏛️',
        title: 'Validate against WAF',
        body: 'Get a score on the 5 Microsoft pillars with specific fix recommendations.',
        cta: 'Open validator',
        to: '/app',
        color: '#10b981',
      });
    }
    if ((p.tf_exports || 0) === 0 && diagrams.length > 0) {
      list.push({
        icon: '🔧',
        title: 'Export your diagram to Terraform',
        body: 'One click turns your diagram into deployable IaC.',
        cta: 'Try export',
        to: '/app',
        color: '#f59e0b',
      });
    }
    // Always-on suggestion
    list.push({
      icon: '📖',
      title: 'Learn from the blog',
      body: 'Deep-dive Azure guides — WAF, cost, IaC, security. Updated weekly.',
      cta: 'Read articles',
      to: '/blog',
      color: '#ec4899',
    });

    return list.slice(0, 4);
  }, [profile, diagrams]);

  // Personalised blog picks — scored against user's canvas usage + profile gaps
  const blogRecommendations = useMemo(() => {
    const signals = buildSignals(signalDiagrams, profile);
    return recommendArticles(blogArticles, signals, 3);
  }, [signalDiagrams, profile]);
  const hasPersonalSignal = signalDiagrams.length > 0 || (profile?.diagrams_created || 0) > 0;

  if (isLoading || !user) {
    return (
      <div className="hd-loading">
        <div className="hd-spinner" />
        <p>Loading your workspace…</p>
      </div>
    );
  }

  const displayName = user.name || (user.email || '').split('@')[0];
  const lastVisitText = profile?.last_login ? fmtRelative(profile.last_login) : 'first visit';

  return (
    <div className="hd-root">
      {/* Top nav */}
      <header className="hd-nav">
        <Link to="/" className="hd-brand" aria-label="Cloud Canvas Designer">
          <svg viewBox="0 0 32 32" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hdBrandFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0B5FBF" />
                <stop offset="55%" stopColor="#0078D4" />
                <stop offset="100%" stopColor="#50E6FF" />
              </linearGradient>
              <linearGradient id="hdBrandStroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0078D4" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#50E6FF" stopOpacity="0.45" />
              </linearGradient>
            </defs>
            <path d="M16 2.6 27.4 9v14L16 29.4 4.6 23V9z" fill="none" stroke="url(#hdBrandStroke)" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M11.4 20.2c-1.85 0-3.35-1.5-3.35-3.35 0-1.7 1.27-3.1 2.9-3.32.36-2.19 2.27-3.86 4.56-3.86 2.1 0 3.86 1.4 4.42 3.32.28-.08.57-.12.88-.12 1.85 0 3.35 1.5 3.35 3.35 0 1.68-1.24 3.07-2.85 3.31l-.05.01H11.4z" fill="url(#hdBrandFill)" />
            <circle cx="22.4" cy="10.6" r="1.15" fill="#50E6FF" />
          </svg>
          <span>Cloud Canvas <b>Designer</b></span>
        </Link>
        <nav className="hd-nav-links">
          <Link to="/blog" className="hd-nav-link">Learn</Link>
          <Link to="/app" className="hd-nav-link">Canvas</Link>
          {user.role === 'admin' && (
            <Link to="/admin" className="hd-nav-link hd-nav-admin">Admin</Link>
          )}
          <button
            type="button"
            className="hd-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link to="/app" className="hd-nav-cta">+ New Diagram</Link>
        </nav>
      </header>

      {/* Welcome banner — blueprint frame + hex mark visual */}
      <section className="hd-hero">
        <div className="hd-hero-copy">
          <span className="hd-hero-eyebrow">
            <span style={{ fontSize: 12 }}>◆</span> Your workspace
          </span>
          <h1 className="hd-hero-title">
            Welcome back, <span className="hd-hero-name">{displayName}</span>
          </h1>
          <p className="hd-hero-sub">
            Last visit <b>{lastVisitText}</b>
            {daysWithUs !== null && daysWithUs > 0 && (
              <> · with us <b>{daysWithUs} days</b></>
            )}
            {streak > 0 && (
              <> · streak <b className="hd-streak">{streak} day{streak === 1 ? '' : 's'} 🔥</b></>
            )}
          </p>
          <div className="hd-hero-actions">
            <Link to="/app" className="hd-hero-cta">
              <span aria-hidden="true">🎨</span> Open Canvas
            </Link>
            <Link to="/blog" className="hd-hero-cta-ghost">
              📖 Learn
            </Link>
          </div>
        </div>

        {/* Signature hex-service mark on the right — nods to canvas + Azure */}
        <div className="hd-hero-visual" aria-hidden="true">
          <svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hdHexBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0091EA" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#50E6FF" stopOpacity="0.10" />
              </linearGradient>
              <linearGradient id="hdHexStroke" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#50E6FF" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0078D4" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="hdHexCore" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0B5FBF" />
                <stop offset="60%" stopColor="#0078D4" />
                <stop offset="100%" stopColor="#50E6FF" />
              </linearGradient>
            </defs>

            {/* Outer decorative hexes representing services on the canvas */}
            <g opacity="0.9">
              <path d="M60 40 L92 22 L124 40 L124 76 L92 94 L60 76 Z" fill="url(#hdHexBg)" stroke="url(#hdHexStroke)" strokeWidth="1.5" />
              <path d="M170 30 L198 14 L226 30 L226 62 L198 78 L170 62 Z" fill="url(#hdHexBg)" stroke="url(#hdHexStroke)" strokeWidth="1.5" />
              <path d="M40 150 L68 134 L96 150 L96 182 L68 198 L40 182 Z" fill="url(#hdHexBg)" stroke="url(#hdHexStroke)" strokeWidth="1.5" />
              <path d="M180 170 L208 154 L236 170 L236 202 L208 218 L180 202 Z" fill="url(#hdHexBg)" stroke="url(#hdHexStroke)" strokeWidth="1.5" />
            </g>

            {/* Connection lines (dashed = "canvas connections") */}
            <g stroke="url(#hdHexStroke)" strokeWidth="1.4" strokeDasharray="4 4" fill="none" opacity="0.7">
              <path d="M96 58 L 130 130" />
              <path d="M198 46 L 130 130" />
              <path d="M68 166 L 130 130" />
              <path d="M208 186 L 130 130" />
            </g>

            {/* Central hex — the brand mark */}
            <g>
              <path
                d="M130 60 L200 100 L200 180 L130 220 L60 180 L60 100 Z"
                fill="url(#hdHexCore)"
                opacity="0.18"
              />
              <path
                d="M130 80 L185 110 L185 170 L130 200 L75 170 L75 110 Z"
                fill="url(#hdHexCore)"
              />
              <path
                d="M108 158 c-6 0 -11 -5 -11 -11 c0 -5.5 4 -10 9.5 -10.7 c1.2 -6.7 7.1 -11.8 14.3 -11.8 c6.5 0 12 4.3 13.8 10.2 c0.9 -0.3 1.9 -0.4 2.9 -0.4 c6 0 11 5 11 11 c0 5.5 -4 10 -9.4 10.7 z"
                fill="#ffffff"
                opacity="0.95"
              />
              <circle cx="165" cy="105" r="3.5" fill="#50E6FF" />
            </g>
          </svg>
        </div>
      </section>

      {/* Stats strip */}
      <section className="hd-stats">
        {[
          { icon: '📁', label: 'Saved Diagrams', value: diagrams.length, color: '#0078D4' },
          { icon: '📤', label: 'Total Exports', value: profile?.total_exports || 0, color: '#10b981' },
          { icon: '🏛️', label: 'WAF Runs', value: profile?.validations_run || 0, color: '#8b5cf6' },
          { icon: '🔐', label: 'Logins', value: profile?.login_count || 0, color: '#f59e0b' },
        ].map((s) => (
          <div className="hd-stat" key={s.label} style={{ '--tone': s.color }}>
            <div className="hd-stat-icon">{s.icon}</div>
            <div>
              <div className="hd-stat-value">{s.value}</div>
              <div className="hd-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Suggested actions */}
      <section className="hd-section">
        <div className="hd-section-header">
          <h2 className="hd-section-title">Suggested next steps</h2>
          <span className="hd-section-sub">Personalised from what you have done so far</span>
        </div>
        <div className="hd-suggestions">
          {suggestions.map((s) => (
            <Link to={s.to} className="hd-suggestion" key={s.title} style={{ '--accent': s.color }}>
              <div className="hd-suggestion-icon">{s.icon}</div>
              <div className="hd-suggestion-body">
                <div className="hd-suggestion-title">{s.title}</div>
                <div className="hd-suggestion-text">{s.body}</div>
                <div className="hd-suggestion-cta">{s.cta} →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent diagrams */}
      <section className="hd-section">
        <div className="hd-section-header">
          <h2 className="hd-section-title">Your recent diagrams</h2>
          <Link to="/app" className="hd-section-link">Open canvas →</Link>
        </div>
        {loadingDiagrams ? (
          <div className="hd-diagrams-empty">Loading…</div>
        ) : diagrams.length === 0 ? (
          <div className="hd-diagrams-empty">
            <div style={{ fontSize: 40, marginBottom: 8 }}>📐</div>
            <div>No saved diagrams yet.</div>
            <Link to="/app" className="hd-empty-cta">
              Design your first one →
            </Link>
          </div>
        ) : (
          <div className="hd-diagrams">
            {diagrams.slice(0, 6).map((d) => (
              <Link
                to={`/app?open=${d.id}`}
                className="hd-diagram"
                key={d.id}
              >
                <div className="hd-diagram-thumb">
                  <div className="hd-diagram-thumb-mark">📐</div>
                  <div className="hd-diagram-thumb-meta">
                    {d.item_count} services · {d.connection_count} links
                  </div>
                </div>
                <div className="hd-diagram-body">
                  <div className="hd-diagram-name">{d.name}</div>
                  <div className="hd-diagram-time">Updated {fmtRelative(d.updated_at)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Personalised blog picks */}
      <section className="hd-section">
        <div className="hd-section-header">
          <h2 className="hd-section-title">
            {hasPersonalSignal ? 'Picked for you' : 'Fresh from the blog'}
          </h2>
          <span className="hd-section-sub">
            {hasPersonalSignal
              ? 'Based on the services on your canvas and what you have tried so far'
              : 'Start reading — recommendations personalise as you use the app'}
          </span>
          <Link to="/blog" className="hd-section-link">All articles →</Link>
        </div>
        <div className="hd-blog">
          {blogRecommendations.map(({ article: a, reasons }) => {
            const cat = categoryColors[a.category] || categoryColors['Architecture'];
            return (
              <Link to={`/blog/${a.slug}`} className="hd-blog-card" key={a.slug}>
                <div className="hd-blog-cat" style={{ background: cat.bg }}>
                  {a.icon} {a.category}
                </div>
                <div className="hd-blog-title">{a.title}</div>
                <div className="hd-blog-excerpt">{a.excerpt}</div>
                {reasons && reasons.length > 0 && (
                  <div className="hd-blog-reason">
                    <span className="hd-blog-reason-mark">✨</span>
                    {reasons.join(' · ')}
                  </div>
                )}
                <div className="hd-blog-meta">
                  {a.readTime} · {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer note */}
      <footer className="hd-footer">
        <span>© 2026 Cloud Canvas Designer · Built by Arunim&apos;s IT Café</span>
        <span>
          <Link to="/blog">Learn</Link> · <Link to="/terms">Terms</Link> · <Link to="/privacy">Privacy</Link>
        </span>
      </footer>
    </div>
  );
};

export default HomeDashboard;
