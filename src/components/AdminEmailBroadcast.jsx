// Admin dashboard tab: compose + send broadcast emails, inspect past runs.
//
// NOTE on storage format (2026-11):
//   `email_broadcasts.body` holds sanitized HTML (TipTap output). See
//   src/components/RichTextEditor.jsx for the editor and
//   functions/_shared/htmlSanitize.js for the server sanitizer.
//
// NOTE on audience (2026-11, part 2):
//   The old audience dropdown (`all` / `paid` / `trial` / `inactive_30d` /
//   `admin_test`) is replaced by a per-user checkbox list. The admin ticks
//   exact recipients; selection is sent as `recipient_user_ids`. The old
//   "Admin test (just me)" entry is now a separate button
//   ("Send test to me only") that fires `test_mode: true` and sends to
//   the authenticated admin's own JWT email — not the ADMIN_EMAILS list.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../utils/supabase';
import { sanitizeEmailHtml } from '../utils/htmlSanitize';
import {
  AUDIENCE_LABELS,
  fetchEligibleUsers,
  listPastBroadcasts,
  createBroadcast,
  dispatchBroadcast,
} from '../utils/emailBroadcast';
import RichTextEditor from './RichTextEditor';
import './AdminEmailBroadcast.css';

const STATUS_STYLES = {
  queued:  { bg: '#e2e8f0', color: '#334155', label: 'Queued' },
  sending: { bg: '#dbeafe', color: '#1d4ed8', label: 'Sending' },
  sent:    { bg: '#d1fae5', color: '#047857', label: 'Sent' },
  partial: { bg: '#fef3c7', color: '#92400e', label: 'Partial' },
  failed:  { bg: '#fee2e2', color: '#991b1b', label: 'Failed' },
};

const TIER_BADGE = {
  trial:        { bg: '#fef3c7', color: '#92400e', label: 'Trial' },
  starter:      { bg: '#dbeafe', color: '#1d4ed8', label: 'Starter' },
  professional: { bg: '#e0e7ff', color: '#3730a3', label: 'Pro' },
  enterprise:   { bg: '#ede9fe', color: '#5b21b6', label: 'Enterprise' },
};

const PAID_TIERS = new Set(['starter', 'professional', 'enterprise', 'paid']);

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

function daysSince(iso) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  const diff = Date.now() - t;
  return Math.max(0, Math.floor(diff / 86_400_000));
}

function lastActiveLabel(iso) {
  const d = daysSince(iso);
  if (d === null) return 'Never signed in';
  if (d === 0) return 'Active today';
  if (d === 1) return 'Active 1 day ago';
  return `Active ${d} days ago`;
}

function tierBadge(tier) {
  const key = (tier || '').toLowerCase();
  return TIER_BADGE[key] || { bg: '#f1f5f9', color: '#334155', label: tier || 'Unknown' };
}

const DEFAULT_BODY =
  '<h2>Hi {{name}},</h2>' +
  '<p>Short, friendly note from the Cloud Canvas team.</p>' +
  '<ul>' +
    '<li>Bullet point one</li>' +
    '<li>Bullet point two</li>' +
  '</ul>' +
  '<p>Thanks for using the app.</p>';

function hasBodyContent(html) {
  if (!html) return false;
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0;
}

export default function AdminEmailBroadcast({ user, onFlash }) {
  const [subject, setSubject] = useState('Quick update from Cloud Canvas');
  const [body, setBody] = useState(DEFAULT_BODY);
  const [mobileView, setMobileView] = useState('edit');

  // Audience: per-user checkbox list
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [search, setSearch] = useState('');

  const [sendingTest, setSendingTest] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const [lastResult, setLastResult] = useState(null);

  const [past, setPast] = useState([]);
  const [pastLoading, setPastLoading] = useState(true);
  const [highlightId, setHighlightId] = useState(null);
  const [detail, setDetail] = useState(null);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const rows = await fetchEligibleUsers();
      setUsers(rows);
    } catch (err) {
      setUsersError(err.message || String(err));
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Load fresh list on mount. No caching — reopening the tab re-fetches so
  // new signups show up automatically.
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const loadPast = useCallback(async () => {
    setPastLoading(true);
    try {
      const rows = await listPastBroadcasts(25);
      setPast(rows);
    } catch (err) {
      onFlash?.('error', `Failed to load past broadcasts: ${err.message}`);
    } finally {
      setPastLoading(false);
    }
  }, [onFlash]);

  useEffect(() => {
    loadPast();
  }, [loadPast]);

  // Sanitize on every render so the preview never shows a vector the server
  // would have stripped.
  const previewHtml = useMemo(() => sanitizeEmailHtml(body), [body]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const email = (u.email || '').toLowerCase();
      const name = (u.name || '').toLowerCase();
      const tier = (u.subscription_tier || '').toLowerCase();
      return email.includes(q) || name.includes(q) || tier.includes(q);
    });
  }, [users, search]);

  const totalUsers = users.length;
  const selectedCount = selectedIds.size;

  const toggleId = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addMatchingToSelection = (predicate) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const u of users) {
        if (predicate(u)) next.add(u.id);
      }
      return next;
    });
  };

  const handleChipAll = () => {
    setSelectedIds(new Set(users.map((u) => u.id)));
  };
  const handleChipNone = () => {
    setSelectedIds(new Set());
  };
  const handleChipPaid = () => {
    addMatchingToSelection((u) => PAID_TIERS.has((u.subscription_tier || '').toLowerCase()));
  };
  const handleChipTrial = () => {
    addMatchingToSelection((u) => (u.subscription_tier || '').toLowerCase() === 'trial');
  };
  const handleChipInactive = () => {
    const cutoff = Date.now() - 30 * 86_400_000;
    addMatchingToSelection((u) => {
      const t = u.last_active_at ? new Date(u.last_active_at).getTime() : 0;
      return !t || t < cutoff;
    });
  };

  const resetConfirm = () => {
    setConfirmOpen(false);
    setConfirmText('');
  };

  const getAccessToken = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    const token = data?.session?.access_token;
    if (!token) throw new Error('No active session. Please sign in again.');
    return token;
  };

  const handleSendTestToMe = async () => {
    if (!user?.email) {
      onFlash?.('error', 'No admin email on session.');
      return;
    }
    if (!subject.trim() || !hasBodyContent(body)) {
      onFlash?.('error', 'Subject and body are required.');
      return;
    }
    setSendingTest(true);
    try {
      const token = await getAccessToken();
      const safeBody = sanitizeEmailHtml(body);
      // Write a test-tagged row so the past-broadcasts list keeps a record.
      const row = await createBroadcast({
        subject: subject.trim(),
        body: safeBody,
        audience: 'test',
        userId: user?.id,
        recipientUserIds: user?.id ? [user.id] : [],
      });
      const res = await dispatchBroadcast({
        broadcastId: row.id,
        subject: subject.trim(),
        body: safeBody,
        accessToken: token,
        testMode: true,
      });
      if (res?.ok) {
        onFlash?.('success', `Test sent to ${user.email}.`);
        setLastResult({ type: 'test', detail: res });
        setHighlightId(row.id);
        setTimeout(loadPast, 400);
      } else {
        throw new Error(res?.error || 'Unknown error');
      }
    } catch (err) {
      onFlash?.('error', `Test send failed: ${err.message}`);
      setLastResult({ type: 'test', detail: { ok: false, error: err.message } });
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (confirmText !== 'SEND') return;
    setSendingBroadcast(true);
    try {
      const token = await getAccessToken();
      const safeBody = sanitizeEmailHtml(body);
      const recipientIds = Array.from(selectedIds);
      const row = await createBroadcast({
        subject: subject.trim(),
        body: safeBody,
        audience: 'custom',
        userId: user?.id,
        recipientUserIds: recipientIds,
      });
      const res = await dispatchBroadcast({
        broadcastId: row.id,
        subject: subject.trim(),
        body: safeBody,
        accessToken: token,
        recipientUserIds: recipientIds,
      });
      const count = res.recipient_count ?? 0;
      setLastResult({ type: 'broadcast', broadcastId: row.id, detail: res });
      setHighlightId(row.id);
      onFlash?.(
        'success',
        `Broadcast queued for ${count} recipient${count === 1 ? '' : 's'}. Status will update in the Past broadcasts list.`
      );
      resetConfirm();
      setTimeout(loadPast, 400);
    } catch (err) {
      onFlash?.('error', `Broadcast failed: ${err.message}`);
      setLastResult({ type: 'broadcast', detail: { ok: false, error: err.message } });
    } finally {
      setSendingBroadcast(false);
    }
  };

  const confirmDisabled = confirmText !== 'SEND' || sendingBroadcast;
  const disableSend =
    !subject.trim() ||
    !hasBodyContent(body) ||
    sendingBroadcast ||
    selectedCount === 0;

  return (
    <div className="eb-root">
      <header className="eb-header">
        <div>
          <h2>Email broadcast</h2>
          <p>Pick exactly which users receive the email. Every send is logged.</p>
        </div>
        <button className="ad-btn ad-btn-outline" onClick={loadPast} disabled={pastLoading}>
          {pastLoading ? '…' : '↻'} Refresh past
        </button>
      </header>

      <div className="eb-grid">
        <section className="eb-card eb-composer">
          <div className="eb-card-head">
            <h3>Composer</h3>
            <div className="eb-mobile-tabs" role="tablist" aria-label="Editor view">
              <button
                type="button"
                role="tab"
                aria-selected={mobileView === 'edit'}
                className={`eb-mobile-tab${mobileView === 'edit' ? ' eb-mobile-tab-active' : ''}`}
                onClick={() => setMobileView('edit')}
              >
                ✍️ Edit
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mobileView === 'preview'}
                className={`eb-mobile-tab${mobileView === 'preview' ? ' eb-mobile-tab-active' : ''}`}
                onClick={() => setMobileView('preview')}
              >
                👁 Preview
              </button>
            </div>
          </div>

          <div
            className={`eb-composer-body${
              mobileView === 'preview' ? ' eb-composer-body-preview' : ''
            }`}
          >
            {/* AUDIENCE PICKER — per-user checkbox list */}
            <div className="eb-audience" aria-label="Audience picker">
              <div className="eb-audience-head">
                <span className="eb-audience-title">Audience</span>
                <span className="eb-audience-summary">
                  <strong>{selectedCount.toLocaleString('en-IN')}</strong> of{' '}
                  <strong>{totalUsers.toLocaleString('en-IN')}</strong> users selected
                </span>
                <button
                  type="button"
                  className="eb-link-btn"
                  onClick={loadUsers}
                  disabled={usersLoading}
                  title="Reload the user list from Supabase"
                >
                  {usersLoading ? '…' : '↻'} Refresh
                </button>
              </div>

              <div className="eb-audience-controls">
                <input
                  type="search"
                  className="eb-input eb-audience-search"
                  placeholder="Search by email, name, or tier…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search users"
                />
                <div className="eb-chips" role="group" aria-label="Quick filters">
                  <button
                    type="button"
                    className="eb-chip eb-chip-all"
                    onClick={handleChipAll}
                    disabled={usersLoading || totalUsers === 0}
                  >
                    ✓ All
                  </button>
                  <button
                    type="button"
                    className="eb-chip eb-chip-none"
                    onClick={handleChipNone}
                    disabled={selectedCount === 0}
                  >
                    ✗ None
                  </button>
                  <button
                    type="button"
                    className="eb-chip"
                    onClick={handleChipPaid}
                    disabled={usersLoading}
                    title="Add every paid-tier user to the current selection"
                  >
                    Paid
                  </button>
                  <button
                    type="button"
                    className="eb-chip"
                    onClick={handleChipTrial}
                    disabled={usersLoading}
                    title="Add every trial user to the current selection"
                  >
                    Trial
                  </button>
                  <button
                    type="button"
                    className="eb-chip"
                    onClick={handleChipInactive}
                    disabled={usersLoading}
                    title="Add every user inactive for 30+ days"
                  >
                    Inactive 30d+
                  </button>
                </div>
              </div>

              <div className="eb-user-list" role="list">
                {usersError ? (
                  <div className="eb-empty eb-err">
                    Failed to load users: {usersError}
                  </div>
                ) : usersLoading ? (
                  <div className="eb-empty">Loading users…</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="eb-empty">
                    {search ? 'No users match this search.' : 'No opted-in users yet.'}
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const checked = selectedIds.has(u.id);
                    const tier = tierBadge(u.subscription_tier);
                    return (
                      <label
                        key={u.id}
                        className={`eb-user-row${checked ? ' eb-user-row-checked' : ''}`}
                        role="listitem"
                      >
                        <input
                          type="checkbox"
                          className="eb-user-checkbox"
                          checked={checked}
                          onChange={() => toggleId(u.id)}
                          aria-label={`Select ${u.email}`}
                        />
                        <div className="eb-user-main">
                          <div className="eb-user-email">{u.email}</div>
                          <div className="eb-user-meta">
                            <span
                              className="eb-tier-badge"
                              style={{ background: tier.bg, color: tier.color }}
                            >
                              {tier.label}
                            </span>
                            <span className="eb-user-last">{lastActiveLabel(u.last_active_at)}</span>
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <label className="eb-label">
              Subject
              <input
                className="eb-input"
                type="text"
                maxLength={300}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="A short, direct subject line"
              />
            </label>

            <div className="eb-label eb-editor-label">
              Body
              <RichTextEditor
                value={body}
                onChange={setBody}
                placeholder="Write the email body. Rich formatting, images, and emoji are supported."
                uploadPrefix="broadcast"
                minHeight={320}
                ariaLabel="Email broadcast body"
              />
            </div>

            <div className="eb-actions">
              <button
                className="ad-btn ad-btn-outline"
                type="button"
                onClick={handleSendTestToMe}
                disabled={sendingTest || !subject.trim() || !hasBodyContent(body)}
                title="Sends exactly one email to your admin address (test_mode)."
              >
                {sendingTest ? 'Sending…' : '✉️ Send test to me only'}
              </button>
              <button
                className="ad-btn ad-btn-primary"
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={disableSend}
              >
                📣 Send broadcast
              </button>
            </div>

            {lastResult && (
              <div
                className={`eb-flash ${
                  lastResult.detail?.ok === false ? 'eb-flash-err' : 'eb-flash-ok'
                }`}
              >
                {lastResult.type === 'test'
                  ? lastResult.detail?.ok
                    ? `Test email delivered to admin address.`
                    : `Test email failed: ${lastResult.detail?.error || 'unknown'}.`
                  : lastResult.detail?.ok
                  ? `Broadcast queued for ${lastResult.detail?.recipient_count ?? 0} recipient(s).`
                  : `Broadcast failed: ${lastResult.detail?.error || 'unknown'}.`}
              </div>
            )}
          </div>
        </section>

        <section
          className={`eb-card eb-preview-card${
            mobileView === 'preview' ? ' eb-preview-card-mobile-visible' : ''
          }`}
        >
          <h3>Live preview</h3>
          <div className="eb-preview-shell">
            <div className="eb-preview-subject">
              <span className="eb-preview-label">Subject</span>
              <strong>{subject || '(no subject)'}</strong>
            </div>
            <div
              className="eb-preview-body cc-article"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
          <p className="eb-preview-hint">
            Preview is sanitized with the same email-safe allowlist the server
            applies before delivery. Resend renders the final email inside the
            broadcast shell — expect small differences in margins and fonts.
          </p>
        </section>

        <section className="eb-card eb-past">
          <h3>Past broadcasts</h3>
          {pastLoading ? (
            <div className="eb-empty">Loading…</div>
          ) : past.length === 0 ? (
            <div className="eb-empty">No broadcasts yet.</div>
          ) : (
            <div className="eb-table-wrap">
              <table className="eb-table">
                <thead>
                  <tr>
                    <th>Sent at</th>
                    <th>Audience</th>
                    <th>Subject</th>
                    <th>Recipients</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {past.map((row) => {
                    const s = STATUS_STYLES[row.status] || STATUS_STYLES.queued;
                    const isHighlight = row.id === highlightId;
                    return (
                      <tr
                        key={row.id}
                        className={isHighlight ? 'eb-row-highlight' : ''}
                        onClick={() => setDetail(row)}
                      >
                        <td data-label="Sent at">{fmt(row.completed_at || row.created_at)}</td>
                        <td data-label="Audience">{AUDIENCE_LABELS[row.audience] || row.audience}</td>
                        <td data-label="Subject" className="eb-td-subject">{row.subject}</td>
                        <td data-label="Recipients">
                          {row.recipient_count}
                          {row.recipient_count === 1 ? ' recipient' : ' recipients'}
                        </td>
                        <td data-label="Status">
                          <span
                            className="eb-status-pill"
                            style={{ background: s.bg, color: s.color }}
                          >
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {confirmOpen && (
        <div className="ad-overlay" onClick={resetConfirm}>
          <div className="ad-modal eb-confirm" onClick={(e) => e.stopPropagation()}>
            <button className="ad-modal-x" onClick={resetConfirm}>
              ✕
            </button>
            <h3>Confirm broadcast</h3>
            <p>
              You're about to send to{' '}
              <strong>{selectedCount.toLocaleString('en-IN')}</strong> user
              {selectedCount === 1 ? '' : 's'}. This cannot be undone.
            </p>
            <label>Type <code>SEND</code> to confirm</label>
            <input
              className="ad-modal-input"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              placeholder="SEND"
            />
            <div className="ad-modal-footer">
              <button className="ad-btn ad-btn-outline" onClick={resetConfirm} disabled={sendingBroadcast}>
                Cancel
              </button>
              <button
                className="ad-btn ad-btn-danger"
                onClick={handleSendBroadcast}
                disabled={confirmDisabled}
              >
                {sendingBroadcast ? 'Dispatching…' : 'Send broadcast'}
              </button>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <div className="ad-overlay" onClick={() => setDetail(null)}>
          <div className="ad-modal eb-detail" onClick={(e) => e.stopPropagation()}>
            <button className="ad-modal-x" onClick={() => setDetail(null)}>
              ✕
            </button>
            <h3>Broadcast details</h3>
            <dl className="eb-dl">
              <dt>Subject</dt><dd>{detail.subject}</dd>
              <dt>Audience</dt><dd>{AUDIENCE_LABELS[detail.audience] || detail.audience}</dd>
              <dt>Status</dt><dd>{detail.status}</dd>
              <dt>Recipients</dt><dd>{detail.recipient_count}</dd>
              <dt>Created</dt><dd>{fmt(detail.created_at)}</dd>
              <dt>Completed</dt><dd>{fmt(detail.completed_at)}</dd>
              {detail.error && (
                <>
                  <dt>Error</dt>
                  <dd>
                    <pre className="eb-pre">{detail.error}</pre>
                  </dd>
                </>
              )}
            </dl>
            <h4>Body (rendered)</h4>
            <div
              className="eb-preview-body cc-article eb-detail-body"
              dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(detail.body || '') }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
