// POST /api/admin-broadcast
//
// Dispatches an admin-authored broadcast email to a filtered audience.
// Returns 202 Accepted immediately; actual sends happen inside
// `ctx.waitUntil` so the UI never has to wait on hundreds of HTTP round
// trips.
//
// Request body:
//   { broadcast_id: uuid, audience: 'all'|'paid'|'trial'|'inactive_30d'|'admin_test',
//     subject: string, body: string }
//
// Behaviour:
//   1. Verify caller is admin (Supabase JWT + email allowlist).
//   2. Load the recipient list from Supabase (service-role key).
//   3. Mark the broadcast row as `sending` with the recipient count.
//   4. Return 202 { broadcast_id, recipient_count, audience }.
//   5. In the background: send in batches of 50 with a 500ms gap,
//      logging each attempt into email_sends.
//   6. Finalize the broadcast row with status `sent | partial | failed`.

import { requireAdmin, adminAllowlist } from '../_shared/adminAuth.js';
import {
  sendEmail,
  logEmailSend,
  makeUnsubscribeToken,
} from '../_shared/emailDelivery.js';
import {
  renderBroadcastMarkdown,
  buildBroadcastEmail,
} from '../_shared/broadcastTemplate.js';

const APP_URL = 'https://cloudcanvas.co';
const BATCH_SIZE = 50;
const BATCH_GAP_MS = 500;
const VALID_AUDIENCES = new Set(['all', 'paid', 'trial', 'inactive_30d', 'admin_test']);

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

async function supabaseFetch(env, path, opts = {}) {
  const url = `${env.VITE_SUPABASE_URL}${path}`;
  const resp = await fetch(url, {
    ...opts,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(opts.headers || {}),
    },
  });
  return resp;
}

async function supabaseJson(env, path, opts = {}) {
  const resp = await supabaseFetch(env, path, opts);
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`Supabase ${resp.status}: ${txt.slice(0, 300)}`);
  }
  return resp.json();
}

/**
 * Build a Supabase PostgREST filter string for a given audience. Mirrored
 * byte-for-byte on the client in src/utils/emailBroadcast.js — keep them
 * in sync.
 */
function audienceFilter(audience) {
  // Opt-in gate — identical for every audience except admin_test (where it
  // doesn't matter, admins always receive their own test).
  const optIn = `or=(email_preferences.is.null,email_preferences->>weekly_digest.not.eq.false)`;
  const active = `is_active=eq.true`;

  switch (audience) {
    case 'all':
      return `${active}&${optIn}`;
    case 'paid':
      return `${active}&subscription_tier=neq.trial&${optIn}`;
    case 'trial':
      return `${active}&subscription_tier=eq.trial&${optIn}`;
    case 'inactive_30d': {
      const cutoff = new Date(Date.now() - 30 * 86_400_000).toISOString();
      return `${active}&last_active_at=lt.${encodeURIComponent(cutoff)}&${optIn}`;
    }
    default:
      return `${active}&${optIn}`;
  }
}

async function loadRecipients(env, audience) {
  if (audience === 'admin_test') {
    return adminAllowlist(env).map((email) => ({ email, name: null }));
  }
  const filter = audienceFilter(audience);
  const rows = await supabaseJson(
    env,
    `/rest/v1/profiles?select=email,name&${filter}&limit=5000`
  );
  return (rows || []).filter((r) => r.email);
}

async function updateBroadcast(env, id, patch) {
  try {
    const resp = await supabaseFetch(
      env,
      `/rest/v1/email_broadcasts?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(patch),
      }
    );
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      console.error('[broadcast] updateBroadcast non-2xx:', resp.status, txt);
    }
  } catch (err) {
    console.error('[broadcast] updateBroadcast exception:', err.message);
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function dispatch({ env, broadcastId, recipients, subject, body }) {
  // `renderBroadcastMarkdown` is a legacy name — it now sanitizes the
  // admin-authored HTML against the Workers-safe allowlist in
  // functions/_shared/htmlSanitize.js. The client already sanitized before
  // sending, so this is defense-in-depth against a crafted direct POST.
  const bodyHtml = renderBroadcastMarkdown(body);
  const secret = env.UNSUBSCRIBE_SECRET || env.CRON_SECRET;

  let sent = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    // Send in parallel within a batch; batches are serialized with a gap.
    const results = await Promise.all(
      batch.map(async (r) => {
        const unsubToken = secret ? await makeUnsubscribeToken(r.email, secret) : '';
        const unsubscribeUrl = secret
          ? `${APP_URL}/api/email-unsubscribe?token=${encodeURIComponent(unsubToken)}`
          : `${APP_URL}/home`;
        const { html, text } = buildBroadcastEmail({
          subject,
          bodyHtml,
          unsubscribeUrl,
          appUrl: APP_URL,
        });
        const result = await sendEmail({
          to: r.email,
          subject,
          html,
          text,
          env,
        });
        await logEmailSend(env, {
          to: r.email,
          kind: 'broadcast',
          broadcast_id: broadcastId,
          result,
        });
        return { email: r.email, result };
      })
    );
    for (const { email, result } of results) {
      if (result.ok) sent += 1;
      else {
        failed += 1;
        if (errors.length < 25) errors.push({ email, error: result.error });
      }
    }
    if (i + BATCH_SIZE < recipients.length) {
      await sleep(BATCH_GAP_MS);
    }
  }

  const status = failed === 0 ? 'sent' : sent === 0 ? 'failed' : 'partial';
  await updateBroadcast(env, broadcastId, {
    status,
    completed_at: new Date().toISOString(),
    error: failed === 0 ? null : JSON.stringify({ failed, sample: errors }).slice(0, 2000),
  });
}

export const onRequestPost = async (ctx) => {
  const { request, env } = ctx;

  const gate = await requireAdmin(request, env);
  if (!gate.ok) return jsonResponse(gate.status, gate.body);

  if (!env?.SUPABASE_SERVICE_ROLE_KEY || !env?.VITE_SUPABASE_URL) {
    return jsonResponse(500, { error: 'supabase_env_not_configured' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: 'invalid_json_body' });
  }

  const broadcast_id = typeof body?.broadcast_id === 'string' ? body.broadcast_id.trim() : '';
  const audience = typeof body?.audience === 'string' ? body.audience.trim() : '';
  const subject = typeof body?.subject === 'string' ? body.subject.trim() : '';
  // Body is now HTML authored in the RichTextEditor. The empty-doc marker
  // TipTap emits is "<p></p>" — treat anything with no visible text as empty
  // so admins can't accidentally dispatch a blank broadcast.
  const bodyHtmlIn = typeof body?.body === 'string' ? body.body : '';
  const visibleBodyLen = bodyHtmlIn
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim().length;

  if (!broadcast_id) return jsonResponse(400, { error: 'missing_broadcast_id' });
  if (!VALID_AUDIENCES.has(audience)) {
    return jsonResponse(400, { error: 'invalid_audience' });
  }
  if (!subject) return jsonResponse(400, { error: 'missing_subject' });
  if (subject.length > 300) return jsonResponse(400, { error: 'subject_too_long' });
  if (!visibleBodyLen) return jsonResponse(400, { error: 'missing_body' });
  // Keep the on-the-wire cap generous (images referenced by URL expand the
  // HTML quickly, but real-world bodies stay well under this).
  if (bodyHtmlIn.length > 200_000) return jsonResponse(400, { error: 'body_too_long' });

  let recipients;
  try {
    recipients = await loadRecipients(env, audience);
  } catch (err) {
    await updateBroadcast(env, broadcast_id, {
      status: 'failed',
      completed_at: new Date().toISOString(),
      error: `load_recipients_failed: ${err.message}`.slice(0, 2000),
    });
    return jsonResponse(502, { error: 'load_recipients_failed', detail: err.message });
  }

  await updateBroadcast(env, broadcast_id, {
    status: 'sending',
    recipient_count: recipients.length,
  });

  if (recipients.length === 0) {
    await updateBroadcast(env, broadcast_id, {
      status: 'sent',
      completed_at: new Date().toISOString(),
    });
    return jsonResponse(202, {
      ok: true,
      broadcast_id,
      recipient_count: 0,
      audience,
      note: 'no_recipients_matched',
    });
  }

  // Kick the real sends off asynchronously so the HTTP response returns in
  // ~hundreds of ms even for large audiences. ctx.waitUntil keeps the
  // Worker alive until this promise resolves.
  const task = dispatch({
    env,
    broadcastId: broadcast_id,
    recipients,
    subject,
    body: bodyHtmlIn,
  }).catch(async (err) => {
    console.error('[broadcast] dispatch fatal:', err);
    await updateBroadcast(env, broadcast_id, {
      status: 'failed',
      completed_at: new Date().toISOString(),
      error: `dispatch_fatal: ${err.message}`.slice(0, 2000),
    });
  });

  if (typeof ctx.waitUntil === 'function') {
    ctx.waitUntil(task);
  }

  return jsonResponse(202, {
    ok: true,
    broadcast_id,
    recipient_count: recipients.length,
    audience,
  });
};
