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

import { sanitizeEmailHtml, htmlToPlainText } from './htmlSanitize.js';

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
 * Wrap sanitized body HTML in the broadcast email shell. Shares visual
 * language with the weekly digest template.
 */
export function buildBroadcastEmail({ subject, bodyHtml, unsubscribeUrl, appUrl = 'https://cloudcanvas.co' }) {
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
</body>
</html>`;

  const text = `${subject}\n\n${htmlToPlainText(bodyHtml)}\n\nOpen: ${appUrl}/home\nUnsubscribe: ${unsubscribeUrl}\n`;
  return { html, text };
}
