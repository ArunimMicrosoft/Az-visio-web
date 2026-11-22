// Server-side body processing + email shell for admin broadcasts.
//
// History: this file used to render markdown (`# heading`, `**bold**`, lists,
// code fences). Since the admin composer moved to a TipTap WYSIWYG editor,
// the body ships as HTML. We keep the exported names identical so the rest
// of the dispatch pipeline (admin-broadcast.js, cron/scheduled-emails.js)
// does not care which format the admin authored.
//
// The input HTML is sanitized with the Workers-safe allowlist in
// functions/_shared/htmlSanitize.js before being embedded in the shell. The
// client applies the same allowlist in the preview pane so admins see what
// recipients will see.
//
// Deliverability: `buildBroadcastEmail` also returns `headers` (List-
// Unsubscribe with the one-click RFC 8058 variant + X-Entity-Ref-ID) and a
// `replyTo` string. Callers must pass both through to `sendEmail` so Resend
// stamps them into the SMTP envelope — those headers are what keeps a new
// sender's mail out of Gmail/Outlook spam folders.

import { sanitizeEmailHtml } from './htmlSanitize.js';

const DEFAULT_REPLY_TO = 'support@cloudcanvas.co';
const DEFAULT_UNSUB_MAILTO = 'mailto:unsubscribe@cloudcanvas.co?subject=unsubscribe';

const escapeHtml = (s) =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Sanitize admin-authored HTML into the inner body of a broadcast email.
 *
 * Name retained from the markdown days ("renderBroadcastMarkdown") so all
 * callers keep working without a refactor. The function now:
 *   1. Runs the HTML through the email-safe allowlist (strips <script>, on*
 *      handlers, javascript: URLs, etc.).
 *   2. Re-injects a conservative inline style on every <img> so Gmail /
 *      Outlook / Apple Mail don't stretch pasted huge images past the
 *      620-px email shell. The sanitizer strips `style` attributes to
 *      prevent CSS-based attacks, so we add this one safe style back in a
 *      controlled way instead of allowing the admin's arbitrary styles.
 */
export function renderBroadcastMarkdown(body) {
  const safe = sanitizeEmailHtml(body);
  return safe.replace(/<img(\s[^>]*?)?\/?>/gi, (match, rawAttrs = '') => {
    // Strip any leading/trailing whitespace from the captured attrs chunk.
    const attrs = rawAttrs.trim();
    const attrPart = attrs ? ` ${attrs}` : '';
    return `<img${attrPart} style="max-width:100%;height:auto;border-radius:8px;display:block;" />`;
  });
}

/**
 * Collapse sanitized HTML into a Markdown-flavoured plaintext fallback for
 * the Resend `text` field. Anchor hrefs survive as `[label](url)` so
 * recipients reading the plaintext part still see the links. Kept inline —
 * zero dependencies.
 */
export function htmlToMarkdownPlainText(html) {
  if (!html || typeof html !== 'string') return '';
  let s = html;

  // Anchors -> [label](href). Done first so later tag-stripping doesn't lose
  // the URL. Non-greedy inner match to tolerate adjacent anchors.
  s = s.replace(
    /<a\b[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/a>/gi,
    (_m, hrefDq, hrefSq, inner) => {
      const href = (hrefDq ?? hrefSq ?? '').trim();
      const label = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (!href) return label;
      if (!label || label === href) return href;
      return `[${label}](${href})`;
    }
  );

  // Line breaks + block closers -> newlines; list items -> bullet.
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<li\b[^>]*>/gi, '  - ');
  s = s.replace(/<\/(p|div|li|h[1-6]|blockquote|tr)>/gi, '\n');
  s = s.replace(/<hr\s*\/?>/gi, '\n---\n');

  // Headings — prefix with # so the text version still reads structured.
  s = s.replace(/<h1\b[^>]*>/gi, '\n# ');
  s = s.replace(/<h2\b[^>]*>/gi, '\n## ');
  s = s.replace(/<h3\b[^>]*>/gi, '\n### ');
  s = s.replace(/<h4\b[^>]*>/gi, '\n#### ');

  // Strip whatever's left.
  s = s.replace(/<[^>]+>/g, '');

  // Decode the entity set the sanitizer actually emits.
  s = s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Collapse whitespace.
  s = s
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  return s;
}

/**
 * Wrap sanitized body HTML in the broadcast email shell + build the
 * matching plaintext alternative and deliverability headers.
 *
 * Returns:
 *   {
 *     html: string,     // the full HTML part
 *     text: string,     // the plaintext alternative (multipart/alternative)
 *     headers: {        // pass through to sendEmail({ headers })
 *       'List-Unsubscribe': string,
 *       'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
 *       'X-Entity-Ref-ID'?: string,
 *     },
 *     replyTo: string,  // pass through to sendEmail({ replyTo })
 *   }
 *
 * The `List-Unsubscribe` header uses the RFC 8058 one-click variant (HTTPS
 * endpoint first, mailto: as a fallback) and is paired with
 * `List-Unsubscribe-Post: List-Unsubscribe=One-Click`. Mailbox providers
 * surface the "unsubscribe" chip at the top of a message when both are
 * present, which also massively improves inbox placement for new senders.
 */
export function buildBroadcastEmail({
  subject,
  bodyHtml,
  unsubscribeUrl,
  appUrl = 'https://cloudcanvas.co',
  broadcastId = null,
  replyTo = DEFAULT_REPLY_TO,
  unsubscribeMailto = DEFAULT_UNSUB_MAILTO,
}) {
  const senderHost = (() => {
    try { return new URL(appUrl).host; } catch { return 'cloudcanvas.co'; }
  })();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:620px;margin:0 auto;padding:24px 16px;">
    <div style="text-align:center;margin-bottom:20px;">
      <div style="display:inline-block;padding:10px 18px;border-radius:999px;background:#ffffff;border:1px solid #e2e8f0;">
        <span style="font-size:16px;font-weight:700;color:#0f172a;letter-spacing:-0.01em;">
          \u2601\ufe0f Cloud Canvas <span style="color:#0078D4;">Designer</span>
        </span>
      </div>
    </div>
    <div style="background:#ffffff;border-radius:16px;padding:28px 24px;border:1px solid #e2e8f0;box-shadow:0 4px 12px -6px rgba(15,23,42,0.1);font-size:14px;color:#334155;line-height:1.6;">
      ${bodyHtml}
      <div style="text-align:center;margin:32px 0 8px;">
        <a href="${appUrl}/home" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#0078D4 0%,#0091EA 100%);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;border-radius:10px;box-shadow:0 6px 16px -6px rgba(0,120,212,0.5);">
          Open Cloud Canvas \u2192
        </a>
      </div>
    </div>
    <div style="text-align:center;padding:20px 8px;color:#94a3b8;font-size:11.5px;line-height:1.6;">
      Cloud Canvas Designer \u00b7 Built by Arunim's IT Caf\u00e9<br />
      You are receiving this because you signed up at ${escapeHtml(senderHost)}.
      <br />
      <a href="${unsubscribeUrl}" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a>
    </div>
  </div>
</body></html>`;

  const bodyText = htmlToMarkdownPlainText(bodyHtml);
  const text =
    `${subject}\n\n` +
    `${bodyText}\n\n` +
    `Open: ${appUrl}/home\n` +
    `Unsubscribe: ${unsubscribeUrl}\n`;

  const headers = {
    // RFC 8058 one-click compliant: mailbox providers call the HTTPS URL
    // with no additional interaction. The mailto: fallback is kept for
    // older clients that honour RFC 2369 but not RFC 8058.
    'List-Unsubscribe': `<${unsubscribeUrl}>, <${unsubscribeMailto}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
  if (broadcastId) {
    // Threading hint; recipients won't see this but mailbox providers
    // group related messages under the same entity ref.
    headers['X-Entity-Ref-ID'] = String(broadcastId);
  }

  return { html, text, headers, replyTo };
}
