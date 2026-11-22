// Admin dashboard tab: compose + send broadcast emails, inspect past runs.
// Lives under src/components/ to match AdminBlogTab convention.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { renderMarkdown } from '../utils/blogRenderer';
import { supabase } from '../utils/supabase';
import {
  AUDIENCE_LABELS,
  countAudience,
  listPastBroadcasts,
  createBroadcast,
  dispatchBroadcast,
  sendTestEmail,
} from '../utils/emailBroadcast';
import './AdminEmailBroadcast.css';

const STATUS_STYLES = {
  queued:  { bg: '#e2e8f0', color: '#334155', label: 'Queued' },
  sending: { bg: '#dbeafe', color: '#1d4ed8', label: 'Sending' },
  sent:    { bg: '#d1fae5', color: '#047857', label: 'Sent' },
  partial: { bg: '#fef3c7', color: '#92400e', label: 'Partial' },
  failed:  { bg: '#fee2e2', color: '#991b1b', label: 'Failed' },
};

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

const DEFAULT_BODY = `# Hi {{name}},

Short, friendly note from the Cloud Canvas team.

- Bullet point one
- Bullet point two

Thanks for using the app.`;

export default function AdminEmailBroadcast({ user, onFlash }) {
  const [audience, setAudience] = useState('admin_test');
  const [subject, setSubject] = useState('Quick update from Cloud Canvas');
  const [body, setBody] = useState(DEFAULT_BODY);

  const [recipientCount, setRecipientCount] = useState(null);
  const [countLoading, setCountLoading] = useState(false);
  const [countError, setCountError] = useState(null);

  const [sendingTest, setSendingTest] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const [lastResult, setLastResult] = useState(null);

  const [past, setPast] = useState([]);
  const [pastLoading, setPastLoading] = useState(true);
  const [highlightId, setHighlightId] = useState(null);
  const [detail, setDetail] = useState(null);

  // Debounced recipient count: refresh 300ms after audience changes.
  useEffect(() => {
    let cancelled = false;
    setCountLoading(true);
    setCountError(null);
    const h = setTimeout(async () => {
      try {
        const { count } = await countAudience(audience);
        if (!cancelled) setRecipientCount(count);
      } catch (err) {
        if (!cancelled) {
          setRecipientCount(null);
          setCountError(err.message || String(err));
        }
      } finally {
        if (!cancelled) setCountLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(h);
    };
  }, [audience]);

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

  const previewHtml = useMemo(() => renderMarkdown(body), [body]);

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

  const handleSendTest = async () => {
    if (!user?.email) {
      onFlash?.('error', 'No admin email on session.');
      return;
    }
    if (!subject.trim() || !body.trim()) {
      onFlash?.('error', 'Subject and body are required.');
      return;
    }
    setSendingTest(true);
    try {
      const token = await getAccessToken();
      const res = await sendTestEmail({ to: user.email, accessToken: token });
      if (res.ok) {
        onFlash?.('success', `Test sent to ${user.email}.`);
        setLastResult({ type: 'test', detail: res });
      } else {
        throw new Error(res.error || `HTTP ${res.status}`);
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
      const row = await createBroadcast({
        subject: subject.trim(),
        body,
        audience,
        userId: user?.id,
      });
      const res = await dispatchBroadcast({
        broadcastId: row.id,
        audience,
        subject: subject.trim(),
        body,
        accessToken: token,
      });
      const count = res.recipient_count ?? 0;
      setLastResult({ type: 'broadcast', broadcastId: row.id, detail: res });
      setHighlightId(row.id);
      onFlash?.(
        'success',
        `Broadcast queued for ${count} recipient${count === 1 ? '' : 's'}. Status will update in the Past broadcasts list.`
      );
      resetConfirm();
      // Soft refresh after a short delay so the new row shows up with `sending`
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
    !body.trim() ||
    sendingBroadcast ||
    (recipientCount !== null && recipientCount === 0);

  return (
    <div className="eb-root">
      <header className="eb-header">
        <div>
          <h2>Email broadcast</h2>
          <p>Compose and send an email to a filtered slice of users. Every send is logged.</p>
        </div>
        <button className="ad-btn ad-btn-outline" onClick={loadPast} disabled={pastLoading}>
          {pastLoading ? '…' : '↻'} Refresh past
        </button>
      </header>

      <div className="eb-grid">
        <section className="eb-card eb-composer">
          <h3>Composer</h3>

          <label className="eb-label">
            Audience
            <select
              className="eb-input"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              {Object.entries(AUDIENCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div className="eb-recipient-row">
            <span>Recipients:</span>
            {countError ? (
              <span className="eb-recipient-count eb-err">error ({countError})</span>
            ) : countLoading ? (
              <span className="eb-recipient-count eb-count-loading">counting…</span>
            ) : (
              <span className="eb-recipient-count">
                {recipientCount === null ? '—' : recipientCount.toLocaleString('en-IN')}
              </span>
            )}
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

          <label className="eb-label">
            Body (markdown)
            <textarea
              className="eb-input eb-textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={16}
              spellCheck
              placeholder="Write the email body. Markdown is supported."
            />
          </label>

          <div className="eb-actions">
            <button
              className="ad-btn ad-btn-outline"
              type="button"
              onClick={handleSendTest}
              disabled={sendingTest || !subject.trim() || !body.trim()}
              title="Send a probe email to your admin address through the real pipeline"
            >
              {sendingTest ? 'Sending…' : '✉️ Send test to me'}
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
                  ? `Test email delivered. Resend id: ${lastResult.detail?.id || 'n/a'}.`
                  : `Test email failed: ${lastResult.detail?.error || 'unknown'}.`
                : lastResult.detail?.ok
                ? `Broadcast queued for ${lastResult.detail?.recipient_count ?? 0} recipient(s).`
                : `Broadcast failed: ${lastResult.detail?.error || 'unknown'}.`}
            </div>
          )}
        </section>

        <section className="eb-card eb-preview-card">
          <h3>Live preview</h3>
          <div className="eb-preview-shell">
            <div className="eb-preview-subject">
              <span className="eb-preview-label">Subject</span>
              <strong>{subject || '(no subject)'}</strong>
            </div>
            <div className="eb-preview-body cc-article" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
          <p className="eb-preview-hint">
            This preview uses the same markdown renderer as the public blog. Server-side
            rendering in the email itself uses a slimmer renderer — expect minor
            visual differences in the delivered inbox.
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
                        <td>{fmt(row.completed_at || row.created_at)}</td>
                        <td>{AUDIENCE_LABELS[row.audience] || row.audience}</td>
                        <td className="eb-td-subject">{row.subject}</td>
                        <td>{row.recipient_count}</td>
                        <td>
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
              <strong>{recipientCount === null ? '—' : recipientCount.toLocaleString('en-IN')}</strong> user
              {recipientCount === 1 ? '' : 's'} (
              <em>{AUDIENCE_LABELS[audience]}</em>). This cannot be undone.
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
            <h4>Body</h4>
            <pre className="eb-pre">{detail.body}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
