import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase, writeAuditLog } from '../utils/supabase';
import './AdminDashboard.css';

const ADMIN_EMAILS = [
  'arunimpandey2903@hotmail.com',
  'demo@arunimitcaffe.com',
  'admin@azuredesigner.com',   // fallback admin account
];

const PLAN_COLORS = {
  trial: '#f59e0b',
  starter: '#10b981',
  professional: '#0078D4',
  enterprise: '#7c3aed',
};
const PLAN_LABELS = {
  trial: '🎁 Trial',
  starter: '⭐ Starter',
  professional: '🚀 Professional',
  enterprise: '🏢 Enterprise',
};

const AUDIT_EVENT_META = {
  LOGIN: { icon: '🔐', label: 'Login', color: '#10b981', bg: '#d1fae5' },
  LOGIN_FAILED: { icon: '🚫', label: 'Login Failed', color: '#ef4444', bg: '#fee2e2' },
  LOGOUT: { icon: '🚪', label: 'Logout', color: '#6b7280', bg: '#f3f4f6' },
  SIGNUP: { icon: '✨', label: 'Sign Up', color: '#0078D4', bg: '#dbeafe' },
  SIGNUP_FAILED: { icon: '❌', label: 'Signup Failed', color: '#ef4444', bg: '#fee2e2' },
  PLAN_CHANGED: { icon: '📋', label: 'Plan Changed', color: '#7c3aed', bg: '#ede9fe' },
  TRIAL_EXTENDED: { icon: '⏰', label: 'Trial Extended', color: '#f59e0b', bg: '#fef3c7' },
  SUB_EXTENDED: { icon: '📅', label: 'Sub Extended', color: '#10b981', bg: '#d1fae5' },
  SUB_REVOKED: { icon: '🔴', label: 'Sub Revoked', color: '#ef4444', bg: '#fee2e2' },
  USER_BANNED: { icon: '🔒', label: 'User Banned', color: '#dc2626', bg: '#fee2e2' },
  USER_UNBANNED: { icon: '🔓', label: 'User Unbanned', color: '#059669', bg: '#d1fae5' },
  COUNTERS_RESET: { icon: '🔄', label: 'Counters Reset', color: '#6b7280', bg: '#f3f4f6' },
};

function daysUntil(iso) {
  if (!iso) return null;
  return Math.ceil((new Date(iso) - Date.now()) / 86_400_000);
}
function addDays(iso, n) {
  const d = iso ? new Date(iso) : new Date();
  d.setDate(d.getDate() + parseInt(n, 10));
  return d.toISOString();
}
function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [flash, setFlash] = useState(null);
  const [modal, setModal] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [stats, setStats] = useState({ total: 0, trial: 0, paid: 0, banned: 0 });

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditEventFilter, setAuditEventFilter] = useState('all');
  const [auditDateFrom, setAuditDateFrom] = useState('');
  const [auditDateTo, setAuditDateTo] = useState('');
  const [auditPage, setAuditPage] = useState(1);
  const AUDIT_PAGE_SIZE = 50;

  useEffect(() => {
    if (user && !ADMIN_EMAILS.includes(user.email?.toLowerCase()) && user.role !== 'admin') {
      navigate('/app');
    }
  }, [user, navigate]);

  const showFlash = (type, text) => {
    setFlash({ type, text });
    setTimeout(() => setFlash(null), 4000);
  };  const [rlsError, setRlsError] = useState(false);
  const [fixingRls, setFixingRls] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_RAZORPAY_BACKEND_URL || 'http://localhost:7071/api';

  // Try backend API first (uses service role key → bypasses RLS)
  // Falls back to direct Supabase query (may be blocked by RLS)
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setRlsError(false);
    try {
      // ── Attempt 1: Backend API (service role, no RLS) ──────────
      let usersData = null;
      try {
        const resp = await fetch(`${BACKEND_URL}/admin/users`, {
          headers: { 'x-admin-email': user?.email || '' },
        });
        if (resp.ok) {
          const json = await resp.json();
          usersData = json.users;
          console.log(`✅ Loaded ${usersData.length} users via backend API`);
        }
      } catch (backendErr) {
        console.warn('Backend API unavailable, falling back to Supabase direct:', backendErr.message);
      }

      // ── Attempt 2: Direct Supabase (may be RLS-limited) ────────
      if (!usersData) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        usersData = data || [];
      }

      // Detect RLS blocking (only 1 row = own profile returned)
      if (usersData.length === 1 && usersData[0]?.email?.toLowerCase() === user?.email?.toLowerCase()) {
        setRlsError(true);
      }

      setUsers(usersData);
      setStats({
        total:  usersData.length,
        trial:  usersData.filter(u => u.subscription_tier === 'trial').length,
        paid:   usersData.filter(u => u.subscription_tier !== 'trial' && u.is_active !== false).length,
        banned: usersData.filter(u => u.is_active === false).length,
      });
    } catch (err) {
      showFlash('error', 'Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.email, BACKEND_URL]);

  // Calls the backend to run the RLS fix SQL using service role key
  const handleFixRls = async () => {
    setFixingRls(true);
    try {
      const resp = await fetch(`${BACKEND_URL}/admin/fix-rls`, {
        method: 'POST',
        headers: { 'x-admin-email': user?.email || '', 'Content-Type': 'application/json' },
      });
      const json = await resp.json();
      if (resp.ok && json.success) {
        showFlash('success', '✅ RLS policies fixed! Reloading users…');
        setRlsError(false);
        await loadUsers();
      } else {
        // Backend not available or service key not set — show manual SQL
        showFlash('error', json.error || 'Fix failed — see SQL below to run manually');
      }
    } catch {
      showFlash('error', 'Backend not running — use manual SQL below');
    } finally {
      setFixingRls(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const loadAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (auditDateFrom) query = query.gte('created_at', new Date(auditDateFrom).toISOString());
      if (auditDateTo) {
        const to = new Date(auditDateTo);
        to.setHours(23, 59, 59, 999);
        query = query.lte('created_at', to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      setAuditLogs(data || []);
      setAuditPage(1);
    } catch (err) {
      showFlash('error', 'Failed to load audit logs: ' + err.message);
    } finally {
      setAuditLoading(false);
    }
  }, [auditDateFrom, auditDateTo]);

  useEffect(() => {
    if (activeTab === 'audit') loadAuditLogs();
  }, [activeTab, loadAuditLogs]);

  const updateProfile = async (userId, updates) => {
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) throw error;
    await loadUsers();
  };

  const handleExtendTrial = async (u) => {
    if (!inputVal || parseInt(inputVal, 10) < 1) {
      showFlash('error', 'Enter valid days');
      return;
    }
    try {
      await updateProfile(u.id, { trial_expires_at: addDays(u.trial_expires_at, inputVal) });
      await writeAuditLog({
        userId: user.id,
        email: user.email,
        event: 'TRIAL_EXTENDED',
        details: { targetEmail: u.email, days: inputVal },
      });
      showFlash('success', `✅ Trial extended by ${inputVal} days for ${u.email}`);
      setModal(null);
      setInputVal('');
    } catch (e) {
      showFlash('error', e.message);
    }
  };

  const handleExtendSub = async (u) => {
    if (!inputVal || parseInt(inputVal, 10) < 1) {
      showFlash('error', 'Enter valid days');
      return;
    }
    try {
      await updateProfile(u.id, { subscription_expires_at: addDays(u.subscription_expires_at, inputVal) });
      await writeAuditLog({
        userId: user.id,
        email: user.email,
        event: 'SUB_EXTENDED',
        details: { targetEmail: u.email, days: inputVal },
      });
      showFlash('success', `✅ Subscription extended by ${inputVal} days for ${u.email}`);
      setModal(null);
      setInputVal('');
    } catch (e) {
      showFlash('error', e.message);
    }
  };

  const handleSetPlan = async (userId, plan, targetEmail) => {
    try {
      const now = new Date().toISOString();
      await updateProfile(userId, {
        subscription_tier: plan,
        upgraded_at: now,
        subscription_expires_at: plan !== 'trial' ? addDays(now, 30) : null,
        is_active: true,
      });
      await writeAuditLog({
        userId: user.id,
        email: user.email,
        event: 'PLAN_CHANGED',
        details: { targetEmail, newPlan: plan },
      });
      showFlash('success', `✅ Plan set to ${plan}`);
      setModal(null);
    } catch (e) {
      showFlash('error', e.message);
    }
  };

  const handleRevoke = async (u) => {
    if (!window.confirm(`Revoke subscription for ${u.email}? They will be downgraded to Trial.`)) return;
    try {
      await updateProfile(u.id, { subscription_tier: 'trial', subscription_expires_at: null, upgraded_at: null });
      await writeAuditLog({
        userId: user.id,
        email: user.email,
        event: 'SUB_REVOKED',
        details: { targetEmail: u.email },
      });
      showFlash('success', `✅ Subscription revoked for ${u.email}`);
    } catch (e) {
      showFlash('error', e.message);
    }
  };

  const handleBanToggle = async (u) => {
    const action = u.is_active !== false ? 'ban' : 'unban';
    if (!window.confirm(`${action.toUpperCase()} user ${u.email}?`)) return;
    try {
      await updateProfile(u.id, { is_active: u.is_active === false });
      const event = u.is_active !== false ? 'USER_BANNED' : 'USER_UNBANNED';
      await writeAuditLog({
        userId: user.id,
        email: user.email,
        event,
        details: { targetEmail: u.email },
      });
      showFlash('success', `✅ User ${action}ned: ${u.email}`);
    } catch (e) {
      showFlash('error', e.message);
    }
  };

  const handleResetCounters = async (u) => {
    if (!window.confirm(`Reset PNG + diagram counters for ${u.email}?`)) return;
    try {
      await updateProfile(u.id, { trial_exports_used: 0, diagrams_created: 0 });
      await writeAuditLog({
        userId: user.id,
        email: user.email,
        event: 'COUNTERS_RESET',
        details: { targetEmail: u.email },
      });
      showFlash('success', `✅ Counters reset for ${u.email}`);
    } catch (e) {
      showFlash('error', e.message);
    }
  };

  const exportCSV = () => {
    const h = ['Email', 'Name', 'Role', 'Plan', 'Trial Expires', 'Sub Expires', 'PNG Used', 'Diagrams', 'Active', 'Joined'];
    const rows = users.map((u) => [
      u.email,
      u.name,
      u.role,
      u.subscription_tier,
      u.trial_expires_at ? new Date(u.trial_expires_at).toLocaleDateString() : '',
      u.subscription_expires_at ? new Date(u.subscription_expires_at).toLocaleDateString() : '',
      u.trial_exports_used || 0,
      u.diagrams_created || 0,
      u.is_active !== false ? 'Yes' : 'No',
      u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
    ]);
    const csv = [h, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showFlash('success', '✅ CSV exported');
  };

  const exportAuditCSV = () => {
    const h = ['Time', 'Event', 'Email', 'User ID', 'Details'];
    const rows = filteredAuditLogs.map((l) => [
      fmtDateTime(l.created_at),
      l.event,
      l.email || '',
      l.user_id || '',
      l.details ? (typeof l.details === 'string' ? l.details : JSON.stringify(l.details)) : '',
    ]);
    const csv = [h, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showFlash('success', '✅ Audit CSV exported');
  };

  const handleSort = (key) => {
    setSortDir(sortKey === key && sortDir === 'asc' ? 'desc' : 'asc');
    setSortKey(key);
  };

  const displayed = users
    .filter((u) => {
      const q = search.toLowerCase();
      return (
        (!q || u.email?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q)) &&
        (planFilter === 'all' || u.subscription_tier === planFilter)
      );
    })
    .sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });

  const filteredAuditLogs = auditLogs.filter((l) => {
    const q = auditSearch.toLowerCase();
    const matchSearch =
      !q ||
      l.email?.toLowerCase().includes(q) ||
      l.event?.toLowerCase().includes(q) ||
      l.user_id?.toLowerCase().includes(q) ||
      (l.details && JSON.stringify(l.details).toLowerCase().includes(q));
    const matchEvent = auditEventFilter === 'all' || l.event === auditEventFilter;
    return matchSearch && matchEvent;
  });

  const totalAuditPages = Math.max(1, Math.ceil(filteredAuditLogs.length / AUDIT_PAGE_SIZE));
  const pagedAuditLogs = filteredAuditLogs.slice((auditPage - 1) * AUDIT_PAGE_SIZE, auditPage * AUDIT_PAGE_SIZE);

  const Th = ({ k, label }) => (
    <th onClick={() => handleSort(k)} className="ad-sortable">
      {label}
      {sortKey === k ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
    </th>
  );

  const auditStats = {
    total: auditLogs.length,
    logins: auditLogs.filter((l) => l.event === 'LOGIN').length,
    signups: auditLogs.filter((l) => l.event === 'SIGNUP').length,
    failures: auditLogs.filter((l) => l.event === 'LOGIN_FAILED' || l.event === 'SIGNUP_FAILED').length,
    adminActions: auditLogs.filter((l) =>
      ['PLAN_CHANGED', 'TRIAL_EXTENDED', 'SUB_EXTENDED', 'SUB_REVOKED', 'USER_BANNED', 'USER_UNBANNED', 'COUNTERS_RESET'].includes(l.event)
    ).length,
  };

  return (
    <div className="ad-root">
      <header className="ad-header">
        <div className="ad-header-left">
          <span className="ad-logo">☁️</span>
          <div>
            <h1 className="ad-title">Admin Control Panel</h1>
            <p className="ad-sub">
              Cloud Canvas Designer &nbsp;·&nbsp; <strong>{user?.email}</strong>
            </p>
          </div>
        </div>
        <div className="ad-header-right">          <button className="ad-btn ad-btn-outline" onClick={() => navigate('/app')}>
            ← Back to App
          </button>
          <button className="ad-btn ad-btn-outline" onClick={() => navigate('/')}>
            🏠 Home
          </button>
          <button
            className="ad-btn ad-btn-danger"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {flash && <div className={`ad-flash ad-flash-${flash.type}`}>{flash.text}</div>}

      <div className="ad-stats">
        {[
          { label: 'Total Users', value: stats.total, icon: '👥', color: '#0078D4' },
          { label: 'Trial Users', value: stats.trial, icon: '🎁', color: '#f59e0b' },
          { label: 'Paid Users', value: stats.paid, icon: '💳', color: '#10b981' },
          { label: 'Banned', value: stats.banned, icon: '🚫', color: '#ef4444' },
        ].map((s) => (
          <div className="ad-stat-card" key={s.label} style={{ borderTop: `4px solid ${s.color}` }}>
            <span className="ad-stat-icon">{s.icon}</span>
            <span className="ad-stat-value" style={{ color: s.color }}>
              {s.value}
            </span>
            <span className="ad-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="ad-tabs">
        <button className={`ad-tab${activeTab === 'users' ? ' ad-tab-active' : ''}`} onClick={() => setActiveTab('users')}>
          👥 User Management
        </button>
        <button className={`ad-tab${activeTab === 'audit' ? ' ad-tab-active' : ''}`} onClick={() => setActiveTab('audit')}>
          📋 Audit Logs
          {auditLogs.length > 0 && <span className="ad-tab-badge">{auditLogs.length}</span>}
        </button>
      </div>

      {activeTab === 'users' && (
        <>
          <div className="ad-toolbar">
            <input
              className="ad-search"
              placeholder="🔍  Search email or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="ad-filter" value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
              <option value="all">All Plans</option>
              <option value="trial">Trial</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <button className="ad-btn ad-btn-outline" onClick={loadUsers} disabled={loading}>
              {loading ? '⏳' : '🔄'} Refresh
            </button>
            <button className="ad-btn ad-btn-success" onClick={exportCSV}>
              📥 Export CSV
            </button>
          </div>          <div className="ad-table-wrap">            {/* RLS Warning Banner */}
            {rlsError && (
              <div className="ad-rls-warning">
                <div className="ad-rls-icon">⚠️</div>
                <div className="ad-rls-content">
                  <strong>Supabase RLS is blocking all-user access — only your profile is visible.</strong>
                  <p>
                    <strong>Quick fix:</strong> Add your <code>SUPABASE_SERVICE_ROLE_KEY</code> to{' '}
                    <code>api/local.settings.json</code> and restart the Azure Functions backend,
                    then click <em>"Auto-Fix RLS"</em> below.
                    &nbsp;Or run the SQL manually in your{' '}
                    <a href="https://supabase.com/dashboard/project/quknseohpwzlbbisgfpi/sql/new" target="_blank" rel="noreferrer">
                      Supabase SQL Editor ↗
                    </a>.
                  </p>
                  <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'12px'}}>
                    <button
                      className="ad-btn ad-btn-primary"
                      onClick={handleFixRls}
                      disabled={fixingRls}
                    >
                      {fixingRls ? '⏳ Fixing…' : '🔧 Auto-Fix RLS (needs backend)'}
                    </button>
                    <button
                      className="ad-btn ad-btn-outline"
                      style={{color:'#374151', borderColor:'#d1d5db', background:'#f9fafb'}}
                      onClick={() => window.open('https://supabase.com/dashboard/project/quknseohpwzlbbisgfpi/sql/new', '_blank')}
                    >
                      🔗 Open SQL Editor
                    </button>
                    <button
                      className="ad-btn ad-btn-outline"
                      style={{color:'#374151', borderColor:'#d1d5db', background:'#f9fafb'}}
                      onClick={loadUsers}
                    >
                      🔄 Retry
                    </button>
                  </div>
                  <details>
                    <summary style={{cursor:'pointer', color:'#92400e', fontWeight:600, fontSize:'13px', marginBottom:'6px'}}>
                      📋 Manual SQL (click to expand)
                    </summary>                    <pre className="ad-rls-sql">{`-- ⚠️ FIXED VERSION — no infinite recursion
-- Run in: Supabase Dashboard → SQL Editor → New Query

-- Step 1: Drop ALL existing policies
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies
    WHERE tablename='profiles' AND schemaname='public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

-- Step 2: Create SECURITY DEFINER helper (no recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND email IN ('arunimpandey2903@hotmail.com','demo@arunimitcaffe.com')
  );
$$;

-- Step 3: Recreate clean policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own_read"    ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_admin_read"  ON public.profiles FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "profiles_own_insert"  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_own_update"  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "profiles_anon_insert" ON public.profiles FOR INSERT TO anon WITH CHECK (true);

-- Step 4: Backfill missing users
INSERT INTO public.profiles (id,email,name,role,subscription_tier,
  trial_start_date,trial_expires_at,trial_exports_used,diagrams_created,is_active,created_at)
SELECT au.id, au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email,'@',1)),
  CASE WHEN au.email IN ('arunimpandey2903@hotmail.com','demo@arunimitcaffe.com') THEN 'admin' ELSE 'architect' END,
  CASE WHEN au.email IN ('arunimpandey2903@hotmail.com','demo@arunimitcaffe.com') THEN 'enterprise' ELSE 'trial' END,
  au.created_at, (au.created_at + INTERVAL '7 days'), 0, 0, true, au.created_at
FROM auth.users au WHERE au.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Verify — should show ALL users:
SELECT email, role, subscription_tier FROM public.profiles ORDER BY created_at DESC;`}</pre>
                  </details>
                </div>
              </div>
            )}
            {loading ? (
              <div className="ad-loading">⏳ Loading users…</div>
            ) : displayed.length === 0 ? (
              <div className="ad-empty">No users found.</div>
            ) : (
              <table className="ad-table">
                <thead>
                  <tr>
                    <Th k="email" label="Email" />
                    <Th k="name" label="Name" />
                    <Th k="subscription_tier" label="Plan" />
                    <th>Trial Expires</th>
                    <th>Sub Expires</th>
                    <Th k="trial_exports_used" label="PNG" />
                    <Th k="diagrams_created" label="Diagrams" />
                    <Th k="is_active" label="Status" />
                    <Th k="created_at" label="Joined" />
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((u) => {
                    const isAdminRow = ADMIN_EMAILS.includes(u.email?.toLowerCase());
                    const td = daysUntil(u.trial_expires_at);
                    const sd = daysUntil(u.subscription_expires_at);
                    return (
                      <tr
                        key={u.id}
                        className={`ad-row${!u.is_active ? ' ad-row-banned' : ''}${isAdminRow ? ' ad-row-admin' : ''}`}
                      >
                        <td className="ad-cell-email">
                          {isAdminRow && <span className="ad-badge-admin">ADMIN</span>}
                          {u.email}
                        </td>
                        <td>{u.name || '—'}</td>
                        <td>
                          <span
                            className="ad-plan-pill"
                            style={{ background: PLAN_COLORS[u.subscription_tier] || '#888' }}
                          >
                            {PLAN_LABELS[u.subscription_tier] || u.subscription_tier}
                          </span>
                        </td>
                        <td
                          className={
                            td !== null && td <= 0 ? 'ad-expired' : td !== null && td <= 2 ? 'ad-warning' : ''
                          }
                        >
                          {u.trial_expires_at
                            ? `${new Date(u.trial_expires_at).toLocaleDateString('en-IN')} (${td}d)`
                            : '—'}
                        </td>
                        <td
                          className={
                            sd !== null && sd <= 0 ? 'ad-expired' : sd !== null && sd <= 7 ? 'ad-warning' : ''
                          }
                        >
                          {u.subscription_expires_at
                            ? `${new Date(u.subscription_expires_at).toLocaleDateString('en-IN')} (${sd}d)`
                            : '—'}
                        </td>
                        <td className="ad-center">{u.trial_exports_used || 0}/5</td>
                        <td className="ad-center">{u.diagrams_created || 0}/3</td>
                        <td className="ad-center">
                          <span
                            className={`ad-status ${u.is_active !== false ? 'ad-active' : 'ad-banned-dot'}`}
                          >
                            {u.is_active !== false ? '● Active' : '● Banned'}
                          </span>
                        </td>
                        <td>
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td>
                          {!isAdminRow && (
                            <div className="ad-actions">
                              <button
                                className="ad-act ad-act-trial"
                                title="Extend Trial"
                                onClick={() => {
                                  setModal({ type: 'extendTrial', u });
                                  setInputVal('');
                                }}
                              >
                                +⏰ Trial
                              </button>
                              <button
                                className="ad-act ad-act-plan"
                                title="Change Plan"
                                onClick={() => setModal({ type: 'setPlan', u })}
                              >
                                📋 Plan
                              </button>
                              {u.subscription_tier !== 'trial' && (
                                <>
                                  <button
                                    className="ad-act ad-act-extend"
                                    title="Extend Sub"
                                    onClick={() => {
                                      setModal({ type: 'extendSub', u });
                                      setInputVal('');
                                    }}
                                  >
                                    +📅 Sub
                                  </button>
                                  <button
                                    className="ad-act ad-act-revoke"
                                    title="Revoke → Trial"
                                    onClick={() => handleRevoke(u)}
                                  >
                                    🚫 Revoke
                                  </button>
                                </>
                              )}
                              <button
                                className="ad-act ad-act-reset"
                                title="Reset counters"
                                onClick={() => handleResetCounters(u)}
                              >
                                🔄 Reset
                              </button>
                              <button
                                className={`ad-act ${
                                  u.is_active !== false ? 'ad-act-ban' : 'ad-act-unban'
                                }`}
                                onClick={() => handleBanToggle(u)}
                              >
                                {u.is_active !== false ? '🔒 Ban' : '🔓 Unban'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeTab === 'audit' && (
        <>
          <div className="ad-audit-stats">
            {[
              { label: 'Total Events', value: auditStats.total, icon: '📋', color: '#0078D4' },
              { label: 'Logins', value: auditStats.logins, icon: '🔐', color: '#10b981' },
              { label: 'Sign Ups', value: auditStats.signups, icon: '✨', color: '#7c3aed' },
              { label: 'Failures', value: auditStats.failures, icon: '🚫', color: '#ef4444' },
              { label: 'Admin Actions', value: auditStats.adminActions, icon: '⚙️', color: '#f59e0b' },
            ].map((s) => (
              <div className="ad-audit-stat" key={s.label} style={{ borderLeft: `4px solid ${s.color}` }}>
                <span className="ad-audit-stat-icon">{s.icon}</span>
                <span className="ad-audit-stat-value" style={{ color: s.color }}>
                  {s.value}
                </span>
                <span className="ad-audit-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="ad-toolbar">
            <input
              className="ad-search"
              placeholder="🔍  Search email, event, user ID…"
              value={auditSearch}
              onChange={(e) => {
                setAuditSearch(e.target.value);
                setAuditPage(1);
              }}
            />
            <select
              className="ad-filter"
              value={auditEventFilter}
              onChange={(e) => {
                setAuditEventFilter(e.target.value);
                setAuditPage(1);
              }}
            >
              <option value="all">All Events</option>
              <optgroup label="Auth">
                <option value="LOGIN">🔐 Login</option>
                <option value="LOGIN_FAILED">🚫 Login Failed</option>
                <option value="LOGOUT">🚪 Logout</option>
                <option value="SIGNUP">✨ Sign Up</option>
                <option value="SIGNUP_FAILED">❌ Signup Failed</option>
              </optgroup>
              <optgroup label="Admin Actions">
                <option value="PLAN_CHANGED">📋 Plan Changed</option>
                <option value="TRIAL_EXTENDED">⏰ Trial Extended</option>
                <option value="SUB_EXTENDED">📅 Sub Extended</option>
                <option value="SUB_REVOKED">🔴 Sub Revoked</option>
                <option value="USER_BANNED">🔒 User Banned</option>
                <option value="USER_UNBANNED">🔓 User Unbanned</option>
                <option value="COUNTERS_RESET">🔄 Counters Reset</option>
              </optgroup>
            </select>
            <input
              type="date"
              className="ad-filter"
              value={auditDateFrom}
              onChange={(e) => setAuditDateFrom(e.target.value)}
              title="From date"
              style={{ maxWidth: 150 }}
            />
            <input
              type="date"
              className="ad-filter"
              value={auditDateTo}
              onChange={(e) => setAuditDateTo(e.target.value)}
              title="To date"
              style={{ maxWidth: 150 }}
            />
            <button className="ad-btn ad-btn-outline" onClick={loadAuditLogs} disabled={auditLoading}>
              {auditLoading ? '⏳' : '🔄'} Refresh
            </button>
            <button
              className="ad-btn ad-btn-success"
              onClick={exportAuditCSV}
              disabled={filteredAuditLogs.length === 0}
            >
              📥 Export CSV
            </button>
          </div>

          <div className="ad-table-wrap">
            {auditLoading ? (
              <div className="ad-loading">⏳ Loading audit logs…</div>
            ) : filteredAuditLogs.length === 0 ? (
              <div className="ad-empty">
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div>No audit log entries found.</div>
                <small style={{ color: '#9ca3af', marginTop: 8, display: 'block' }}>
                  Audit logs are created on login, signup, logout and all admin actions.
                  <br />
                  Make sure the <code>audit_logs</code> table exists in your Supabase project.
                </small>
              </div>
            ) : (
              <>
                <table className="ad-table ad-audit-table">
                  <thead>
                    <tr>
                      <th style={{ width: 170 }}>Timestamp</th>
                      <th style={{ width: 160 }}>Event</th>
                      <th>Email / Actor</th>
                      <th>Details</th>
                      <th style={{ width: 100 }}>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAuditLogs.map((log, i) => {
                      const meta = AUDIT_EVENT_META[log.event] || {
                        icon: '📝',
                        label: log.event,
                        color: '#6b7280',
                        bg: '#f3f4f6',
                      };
                      let details = log.details;
                      if (typeof details === 'string') {
                        try {
                          details = JSON.parse(details);
                        } catch {
                          /* keep as string */
                        }
                      }
                      return (
                        <tr key={log.id || i} className="ad-audit-row">
                          <td className="ad-audit-time">{fmtDateTime(log.created_at)}</td>
                          <td>
                            <span
                              className="ad-audit-badge"
                              style={{ background: meta.bg, color: meta.color }}
                            >
                              {meta.icon} {meta.label}
                            </span>
                          </td>
                          <td className="ad-audit-email">
                            {log.email ? (
                              <span title={log.user_id || ''}>{log.email}</span>
                            ) : (
                              <span className="ad-audit-anon">Anonymous</span>
                            )}
                          </td>
                          <td className="ad-audit-details">
                            {details && typeof details === 'object' ? (
                              <div className="ad-audit-detail-chips">
                                {Object.entries(details).map(([k, v]) => (
                                  <span key={k} className="ad-audit-chip">
                                    <span className="ad-audit-chip-key">{k}:</span>
                                    <span className="ad-audit-chip-val">{String(v)}</span>
                                  </span>
                                ))}
                              </div>
                            ) : details ? (
                              <span className="ad-audit-chip-val">{String(details)}</span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="ad-audit-ip">{log.ip_address || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {totalAuditPages > 1 && (
                  <div className="ad-audit-pagination">
                    <span className="ad-audit-page-info">
                      Showing {auditPage * AUDIT_PAGE_SIZE - AUDIT_PAGE_SIZE + 1}–
                      {Math.min(auditPage * AUDIT_PAGE_SIZE, filteredAuditLogs.length)} of{' '}
                      {filteredAuditLogs.length} events
                    </span>
                    <div className="ad-audit-page-btns">
                      <button
                        className="ad-btn ad-btn-outline ad-page-btn"
                        onClick={() => setAuditPage(1)}
                        disabled={auditPage === 1}
                      >
                        «
                      </button>
                      <button
                        className="ad-btn ad-btn-outline ad-page-btn"
                        onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                        disabled={auditPage === 1}
                      >
                        ‹
                      </button>
                      {Array.from({ length: Math.min(7, totalAuditPages) }, (_, idx) => {
                        const start = Math.max(1, Math.min(auditPage - 3, totalAuditPages - 6));
                        const p = start + idx;
                        return (
                          <button
                            key={p}
                            className={`ad-btn ad-page-btn${
                              auditPage === p ? ' ad-page-btn-active' : ' ad-btn-outline'
                            }`}
                            onClick={() => setAuditPage(p)}
                          >
                            {p}
                          </button>
                        );
                      })}
                      <button
                        className="ad-btn ad-btn-outline ad-page-btn"
                        onClick={() => setAuditPage((p) => Math.min(totalAuditPages, p + 1))}
                        disabled={auditPage === totalAuditPages}
                      >
                        ›
                      </button>
                      <button
                        className="ad-btn ad-btn-outline ad-page-btn"
                        onClick={() => setAuditPage(totalAuditPages)}
                        disabled={auditPage === totalAuditPages}
                      >
                        »
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {modal && (
        <div className="ad-overlay" onClick={() => setModal(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ad-modal-x" onClick={() => setModal(null)}>
              ✕
            </button>

            {modal.type === 'extendTrial' && (
              <>
                <h3>⏰ Extend Trial</h3>
                <p className="ad-modal-email">{modal.u.email}</p>
                <p>
                  Current expiry:{' '}
                  <strong>
                    {modal.u.trial_expires_at
                      ? new Date(modal.u.trial_expires_at).toLocaleDateString('en-IN')
                      : 'Not set'}
                  </strong>
                </p>
                <label>Days to add</label>
                <input
                  className="ad-modal-input"
                  type="number"
                  min="1"
                  max="365"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="e.g. 7"
                  autoFocus
                />
                <div className="ad-modal-footer">
                  <button className="ad-btn ad-btn-primary" onClick={() => handleExtendTrial(modal.u)}>
                    Extend Trial
                  </button>
                  <button className="ad-btn ad-btn-outline" onClick={() => setModal(null)}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {modal.type === 'extendSub' && (
              <>
                <h3>📅 Extend Subscription</h3>
                <p className="ad-modal-email">{modal.u.email}</p>
                <p>
                  Current expiry:{' '}
                  <strong>
                    {modal.u.subscription_expires_at
                      ? new Date(modal.u.subscription_expires_at).toLocaleDateString('en-IN')
                      : 'Not set'}
                  </strong>
                </p>
                <label>Days to add</label>
                <input
                  className="ad-modal-input"
                  type="number"
                  min="1"
                  max="365"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="e.g. 30"
                  autoFocus
                />
                <div className="ad-modal-footer">
                  <button className="ad-btn ad-btn-primary" onClick={() => handleExtendSub(modal.u)}>
                    Extend Subscription
                  </button>
                  <button className="ad-btn ad-btn-outline" onClick={() => setModal(null)}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {modal.type === 'setPlan' && (
              <>
                <h3>📋 Change Plan</h3>
                <p className="ad-modal-email">{modal.u.email}</p>
                <p>
                  Current:{' '}
                  <strong>{PLAN_LABELS[modal.u.subscription_tier] || modal.u.subscription_tier}</strong>
                </p>
                <div className="ad-plan-grid">
                  {['trial', 'starter', 'professional', 'enterprise'].map((plan) => (
                    <button
                      key={plan}
                      className={`ad-plan-card ${
                        modal.u.subscription_tier === plan ? 'ad-plan-current' : ''
                      }`}
                      style={{ borderColor: PLAN_COLORS[plan] }}
                      onClick={() => handleSetPlan(modal.u.id, plan, modal.u.email)}
                    >
                      <span style={{ color: PLAN_COLORS[plan], fontWeight: 700 }}>
                        {PLAN_LABELS[plan]}
                      </span>
                      {plan !== 'trial' && <small>30 days access</small>}
                      {plan === 'trial' && <small>Reset to trial</small>}
                    </button>
                  ))}
                </div>
                <div className="ad-modal-footer">
                  <button className="ad-btn ad-btn-outline" onClick={() => setModal(null)}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
