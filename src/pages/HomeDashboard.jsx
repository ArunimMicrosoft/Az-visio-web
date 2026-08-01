// HomeDashboard — the landing page after login.
// Replaces the blank canvas as the default post-auth destination.
// Purpose: give returning users a reason to poke around instead of bouncing.

import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { listUserDiagrams } from '../utils/diagramStorage';
import { blogArticles, categoryColors } from '../utils/blogArticles';
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

const HomeDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [diagrams, setDiagrams] = useState([]);
  const [loadingDiagrams, setLoadingDiagrams] = useState(true);
  const [loginDates, setLoginDates] = useState([]);
  const [profile, setProfile] = useState(null);

  // Redirect anonymous users
  useEffect(() => {
    if (!isLoading && !user) navigate('/login');
  }, [user, isLoading, navigate]);

  // Load user's saved diagrams
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

  // Pick 3 newest blog articles
  const blogHighlights = useMemo(() => {
    return [...blogArticles]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  }, []);

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
        <Link to="/" className="hd-brand">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#0078D4" />
            <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="#50E6FF" />
          </svg>
          <span>Cloud Canvas <b>Designer</b></span>
        </Link>
        <nav className="hd-nav-links">
          <Link to="/blog" className="hd-nav-link">Learn</Link>
          <Link to="/app" className="hd-nav-link">Canvas</Link>
          {user.role === 'admin' && (
            <Link to="/admin" className="hd-nav-link hd-nav-admin">Admin</Link>
          )}
          <Link to="/app" className="hd-nav-cta">+ New Diagram</Link>
        </nav>
      </header>

      {/* Welcome banner */}
      <section className="hd-hero">
        <div>
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
        </div>
        <Link to="/app" className="hd-hero-cta">
          Open Canvas →
        </Link>
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

      {/* Blog highlights */}
      <section className="hd-section">
        <div className="hd-section-header">
          <h2 className="hd-section-title">Fresh from the blog</h2>
          <Link to="/blog" className="hd-section-link">All articles →</Link>
        </div>
        <div className="hd-blog">
          {blogHighlights.map((a) => {
            const cat = categoryColors[a.category] || categoryColors['Architecture'];
            return (
              <Link to={`/blog/${a.slug}`} className="hd-blog-card" key={a.slug}>
                <div className="hd-blog-cat" style={{ background: cat.bg }}>
                  {a.icon} {a.category}
                </div>
                <div className="hd-blog-title">{a.title}</div>
                <div className="hd-blog-excerpt">{a.excerpt}</div>
                <div className="hd-blog-meta">{a.readTime} · {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
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
