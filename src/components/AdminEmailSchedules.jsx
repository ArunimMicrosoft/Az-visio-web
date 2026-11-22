// Admin dashboard tab: edit, preview, and trigger scheduled email campaigns.
// Every row in public.email_schedules maps to one entry here. The server
// hourly tick (/api/cron/scheduled-emails) consumes exactly these rows.
//
// All DB reads/writes go through the Supabase client with admin-only RLS.
// "Run now" hits /api/admin-run-schedule which is admin-JWT guarded, so a
// non-admin opening this file in devtools cannot trigger a send.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { renderMarkdown } from '../utils/blogRenderer';
import { supabase } from '../utils/supabase';
import {
  CADENCE_OPTIONS,
  cadenceFriendly,
  listSchedules,
  updateSchedule,
  runScheduleNow,
} from '../utils/emailSchedules';
import './AdminEmailSchedules.css';

// ------------------------------------------------------------------ helpers

// Supported {{var}} keys — must match functions/_shared/templateRender.js.
// The description column is shown in the admin help panel.
const TEMPLATE_VARIABLES = [
  { key: 'first_name',              description: "Recipient's first name (falls back to email local-part)." },
  { key: 'email',                   description: "Recipient's email address." },
  { key: 'recent_diagrams_count',   description: 'How many diagrams the user has on the canvas.' },
  { key: 'days_since_last_visit',   description: 'Whole days since the user last signed in.' },
  { key: 'suggested_article_title', description: 'Title of a recommended blog post.' },
  { key: 'suggested_article_url',   description: 'Full URL to the recommended blog post.' },
  { key: 'unsubscribe_url',         description: 'One-click unsubscribe link for this recipient.' },
];

const VAR_RE = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

function renderTemplateClient(template, ctx) {
  if (!template) return '';
  const context = ctx || {};
  return String(template).replace(VAR_RE, (_m, key) => {
    const v = context[key];
    if (v === undefined || v === null) return '';
    return String(v);
  });
}

function emailLocalPartTitle(email) {
  if (!email) return '';
  const base = String(email).split('@')[0].split(/[.+_\-]/)[0] || '';
  if (!base) return '';
  return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
}

function buildPreviewContext(adminUser) {
  const email = adminUser?.email || 'admin@example.com';
  const name = (adminUser?.name || adminUser?.user_metadata?.name || '').trim();
  const firstName = name ? name.split(/\s+/)[0] : emailLocalPartTitle(email) || 'there';
  return {
    first_name: firstName,
    email,
    recent_diagrams_count: '3',
    days_since_last_visit: '7',
    suggested_article_title: 'How to Use Cloud Canvas Designer: The Complete SOP',
    suggested_article_url: 'https://cloudcanvas.co/blog/cloud-canvas-designer-sop',
    unsubscribe_url: 'https://cloudcanvas.co/api/email-unsubscribe?token=preview',
  };
}

function fmtRelative(iso) {
  if (!iso) return 'Never';
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) return '—';
  if (diffMs < 60_000) return 'just now';
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
}

function fmtFuture(iso) {
  if (!iso) return '—';
  const diffMs = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(diffMs)) return '—';
  if (diffMs < 0) return 'now';
  const mins = Math.round(diffMs / 60_000);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `in ${hrs}h`;
  const days = Math.round(hrs / 24);
  return `in ${days}d`;
}

// Mirrors functions/_shared/cadence.js for display. Kept small and pure so
// the admin UI shows "next run in 3d" without a server round trip.
function clientNextRun(row, now = new Date()) {
  if (!row) return null;
  const from = row.last_run_at && new Date(row.last_run_at) > new Date(0)
    ? new Date(row.last_run_at)
    : new Date(now.getTime() - 1000);
  const next = new Date(from.getTime());
  next.setUTCSeconds(0, 0);

  switch (row.cadence) {
    case 'daily_09':
      next.setUTCMinutes(0);
      next.setUTCHours(9);
      while (next <= from) next.setUTCDate(next.getUTCDate() + 1);
      return next;
    case 'weekly_mon_09':
      next.setUTCMinutes(0);
      next.setUTCHours(9);
      while (next <= from || next.getUTCDay() !== 1) next.setUTCDate(next.getUTCDate() + 1);
      return next;
    case 'weekly_fri_17':
      next.setUTCMinutes(0);
      next.setUTCHours(17);
      while (next <= from || next.getUTCDay() !== 5) next.setUTCDate(next.getUTCDate() + 1);
      return next;
    case 'monthly_1st_09':
      next.setUTCMinutes(0);
      next.setUTCHours(9);
      next.setUTCDate(1);
      while (next <= from) next.setUTCMonth(next.getUTCMonth() + 1);
      return next;
    default:
      return null;
  }
}

const LAST_RUN_STYLES = {
  sent:           { bg: '#d1fae5', color: '#047857', label: 'Sent' },
  failed:         { bg: '#fee2e2', color: '#991b1b', label: 'Failed' },
  skipped:        { bg: '#e2e8f0', color: '#334155', label: 'Skipped' },
  disabled:       { bg: '#f3f4f6', color: '#6b7280', label: 'Disabled' },
  empty_audience: { bg: '#fef3c7', color: '#92400e', label: 'No audience' },
};

function StatusPill({ status }) {
  if (!status) return <span className="es-pill es-pill-muted">Never run</span>;
  const s = LAST_RUN_STYLES[status] || { bg: '#f3f4f6', color: '#334155', label: status };
  return (
    <span className="es-pill" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

// ------------------------------------------------------------------ component

export default function AdminEmailSchedules({ user, onFlash }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [previewRow, setPreviewRow] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSchedules();
      setRows(data);
    } catch (err) {
      onFlash?.('error', `Failed to load schedules: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [onFlash]);

  useEffect(() => {
    load();
  }, [load]);

  const getAccessToken = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    const token = data?.session?.access_token;
    if (!token) throw new Error('No active session. Please sign in again.');
    return token;
  };

  const handleToggleEnabled = async (row) => {
    setBusyId(row.id);
    try {
      const updated = await updateSchedule(row.id, { enabled: !row.enabled }, user?.id);
      setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)));
      onFlash?.('success', `Schedule "${row.kind}" ${updated.enabled ? 'enabled' : 'paused'}.`);
    } catch (err) {
      onFlash?.('error', `Failed to toggle: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleRunNow = async (row) => {
    if (!row.enabled) {
      const go = window.confirm(
        `Schedule "${row.kind}" is currently paused. Run anyway (bypass the enabled flag)?`
      );
      if (!go) return;
    }
    setBusyId(row.id);
    try {
      const token = await getAccessToken();
      const res = await runScheduleNow({
        kind: row.kind,
        accessToken: token,
        force: !row.enabled,
      });
      const first = res?.summary?.results?.[0];
      const sent = first?.sent ?? 0;
      const failed = first?.failed ?? 0;
      const status = first?.status || 'done';
      onFlash?.(
        failed > 0 ? 'error' : 'success',
        `Run complete — status ${status}, sent ${sent}, failed ${failed}.`
      );
      await load();
    } catch (err) {
      onFlash?.('error', `Run failed: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleEditSave = async (patch) => {
    if (!editRow) return;
    setBusyId(editRow.id);
    try {
      const updated = await updateSchedule(editRow.id, patch, user?.id);
      setRows((prev) => prev.map((r) => (r.id === editRow.id ? updated : r)));
      onFlash?.('success', `Schedule "${updated.kind}" saved.`);
      setEditRow(null);
    } catch (err) {
      onFlash?.('error', `Save failed: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="es-root">
      <header className="es-header">
        <div>
          <h2>Scheduled emails</h2>
          <p>
            Every row below runs on its own cadence. The Admin Dashboard is the only
            place these templates, schedules, and enabled flags can be changed.
          </p>
        </div>
        <button className="ad-btn ad-btn-outline" onClick={load} disabled={loading}>
          {loading ? '…' : '↻'} Refresh
        </button>
      </header>

      {loading ? (
        <div className="es-empty">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="es-empty">
          <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
          <div>No schedule rows yet.</div>
          <small style={{ display: 'block', marginTop: 6, color: '#94a3b8' }}>
            Run <code>docs/ADD_EMAIL_SCHEDULES.sql</code> in Supabase to seed the
            default weekly digest schedule.
          </small>
        </div>
      ) : (
        <div className="es-table-wrap">
          <table className="es-table">
            <thead>
              <tr>
                <th>Kind</th>
                <th>Enabled</th>
                <th>Cadence</th>
                <th>Last run</th>
                <th>Next run</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const next = clientNextRun(row);
                return (
                  <tr key={row.id}>
                    <td className="es-td-kind">{row.kind}</td>
                    <td>
                      <button
                        className={`es-toggle ${row.enabled ? 'es-toggle-on' : ''}`}
                        onClick={() => handleToggleEnabled(row)}
                        disabled={busyId === row.id}
                        title={row.enabled ? 'Click to pause' : 'Click to enable'}
                      >
                        <span className="es-toggle-dot" />
                        <span className="es-toggle-text">{row.enabled ? 'On' : 'Paused'}</span>
                      </button>
                    </td>
                    <td>{cadenceFriendly(row)}</td>
                    <td>
                      <div className="es-last-run">
                        <span>{fmtRelative(row.last_run_at)}</span>
                        <StatusPill status={row.last_run_status} />
                        {typeof row.last_run_count === 'number' && row.last_run_at && (
                          <small className="es-muted">({row.last_run_count} sent)</small>
                        )}
                      </div>
                    </td>
                    <td>{row.enabled ? (next ? fmtFuture(next.toISOString()) : '—') : 'Paused'}</td>
                    <td>
                      <div className="es-actions">
                        <button className="ad-btn ad-btn-outline es-btn-sm" onClick={() => setEditRow(row)}>
                          ✏️ Edit
                        </button>
                        <button className="ad-btn ad-btn-outline es-btn-sm" onClick={() => setPreviewRow(row)}>
                          👁️ Preview
                        </button>
                        <button
                          className="ad-btn ad-btn-primary es-btn-sm"
                          onClick={() => handleRunNow(row)}
                          disabled={busyId === row.id}
                        >
                          {busyId === row.id ? 'Running…' : '🚀 Run now'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editRow && (
        <EditModal
          row={editRow}
          onClose={() => setEditRow(null)}
          onSave={handleEditSave}
          busy={busyId === editRow.id}
        />
      )}

      {previewRow && (
        <PreviewModal
          row={previewRow}
          user={user}
          onClose={() => setPreviewRow(null)}
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------------ edit modal

function EditModal({ row, onClose, onSave, busy }) {
  const [subject, setSubject] = useState(row.subject_template);
  const [body, setBody] = useState(row.body_template);
  const [cadence, setCadence] = useState(row.cadence);
  const [customCron, setCustomCron] = useState(row.custom_cron || '');
  const [enabled, setEnabled] = useState(!!row.enabled);

  const previewContext = useMemo(() => buildPreviewContext(null), []);

  const previewSubject = useMemo(
    () => renderTemplateClient(subject, previewContext) || subject,
    [subject, previewContext]
  );
  const previewHtml = useMemo(() => {
    const substituted = renderTemplateClient(body, previewContext);
    return renderMarkdown(substituted);
  }, [body, previewContext]);

  const canSave =
    subject.trim().length > 0 &&
    body.trim().length > 0 &&
    !busy &&
    (cadence !== 'custom' || customCron.trim().length > 0);

  const submit = () => {
    const patch = {
      subject_template: subject.trim(),
      body_template: body,
      cadence,
      enabled,
      custom_cron: cadence === 'custom' ? customCron.trim() : null,
    };
    onSave(patch);
  };

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal es-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ad-modal-x" onClick={onClose}>✕</button>
        <h3>Edit schedule — {row.kind}</h3>

        <div className="es-edit-grid">
          <section className="es-edit-form">
            <label className="es-label">
              Subject template
              <input
                className="es-input"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={300}
                placeholder="A short, direct subject"
              />
            </label>

            <label className="es-label">
              Body template (markdown)
              <textarea
                className="es-input es-textarea"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={14}
                spellCheck
              />
            </label>

            <label className="es-label">
              Cadence
              <select
                className="es-input"
                value={cadence}
                onChange={(e) => setCadence(e.target.value)}
              >
                {CADENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>

            {cadence === 'custom' && (
              <label className="es-label">
                Custom cron (5 fields: minute hour day-of-month month day-of-week)
                <input
                  className="es-input"
                  type="text"
                  value={customCron}
                  onChange={(e) => setCustomCron(e.target.value)}
                  placeholder="e.g. 0 9 * * 1"
                />
                <small className="es-muted">
                  Supports <code>*</code>, exact values, <code>N,M</code> lists, and <code>*/N</code> steps.
                </small>
              </label>
            )}

            <label className="es-check">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <span>Enabled — the hourly cron will send when due</span>
            </label>
          </section>

          <section className="es-edit-side">
            <h4>Variables you can use</h4>
            <ul className="es-var-list">
              {TEMPLATE_VARIABLES.map((v) => (
                <li key={v.key}>
                  <code>{`{{${v.key}}}`}</code>
                  <span>{v.description}</span>
                </li>
              ))}
            </ul>
            <p className="es-muted" style={{ marginTop: 12 }}>
              Unknown or missing variables collapse to an empty string — the final email
              will never show <code>{`{{...}}`}</code>.
            </p>

            <h4 style={{ marginTop: 24 }}>Live preview</h4>
            <div className="es-preview-shell">
              <div className="es-preview-subject">
                <span className="es-label-mini">Subject</span>
                <strong>{previewSubject || '(empty)'}</strong>
              </div>
              <div
                className="es-preview-body cc-article"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </section>
        </div>

        <div className="ad-modal-footer">
          <button className="ad-btn ad-btn-outline" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="ad-btn ad-btn-primary" onClick={submit} disabled={!canSave}>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ preview modal

function PreviewModal({ row, user, onClose }) {
  const context = useMemo(() => buildPreviewContext(user), [user]);
  const subject = renderTemplateClient(row.subject_template, context) || row.subject_template;
  const substitutedBody = renderTemplateClient(row.body_template, context);
  const html = renderMarkdown(substitutedBody);
  const text = substitutedBody; // plaintext fallback = the substituted markdown source

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal es-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ad-modal-x" onClick={onClose}>✕</button>
        <h3>Preview — {row.kind}</h3>
        <p className="es-muted">
          Rendered with your own profile as the sample recipient. The live cron run
          substitutes each user's real values.
        </p>

        <div className="es-preview-subject es-preview-subject-full">
          <span className="es-label-mini">Subject</span>
          <strong>{subject}</strong>
        </div>

        <div className="es-preview-tabs">
          <div className="es-preview-tab-header">HTML preview</div>
          <div
            className="es-preview-body cc-article"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <div className="es-preview-tab-header" style={{ marginTop: 16 }}>Plaintext fallback</div>
          <pre className="es-preview-plain">{text}</pre>
        </div>

        <div className="ad-modal-footer">
          <button className="ad-btn ad-btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
