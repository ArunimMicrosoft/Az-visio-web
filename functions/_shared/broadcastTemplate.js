// Minimal server-side markdown renderer for admin broadcast emails.
//
// We can NOT reuse src/utils/blogRenderer.js directly — it's imported by
// the browser bundle. This mirrors the subset of markdown admins actually
// use in broadcasts: headings (# ## ###), paragraphs, **bold**, *italic*,
// `inline code`, [links](url), bullet / numbered lists, and fenced code
// blocks. If you extend the client-side preview, keep this in sync.

const escapeHtml = (s) =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const inline = (s) =>
  s
    .replace(/`([^`]+)`/g, (_m, code) =>
      `<code style="background:#f1f5f9;padding:1px 6px;border-radius:4px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:0.95em;">${escapeHtml(code)}</code>`
    )
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" style="color:#0078D4;text-decoration:underline;">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

export function renderBroadcastMarkdown(md) {
  if (!md) return '';
  const lines = md.split('\n');
  const out = [];
  let i = 0;
  let listTag = '';

  const closeList = () => {
    if (listTag) {
      out.push(`</${listTag}>`);
      listTag = '';
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) { closeList(); i++; continue; }

    // Fenced code block
    const fence = trimmed.match(/^```\s*([a-zA-Z0-9_-]*)\s*$/);
    if (fence) {
      closeList();
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        buf.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume closing fence
      out.push(
        `<pre style="background:#0f172a;color:#f1f5f9;padding:14px 16px;border-radius:10px;overflow-x:auto;font-size:13px;line-height:1.45;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">` +
        `<code>${escapeHtml(buf.join('\n'))}</code></pre>`
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      closeList();
      out.push(`<h3 style="font-size:16px;margin:24px 0 10px;color:#0f172a;font-weight:700;">${inline(escapeHtml(trimmed.slice(4)))}</h3>`);
      i++; continue;
    }
    if (trimmed.startsWith('## ')) {
      closeList();
      out.push(`<h2 style="font-size:18px;margin:28px 0 12px;color:#0f172a;font-weight:700;">${inline(escapeHtml(trimmed.slice(3)))}</h2>`);
      i++; continue;
    }
    if (trimmed.startsWith('# ')) {
      closeList();
      out.push(`<h1 style="font-size:22px;margin:0 0 14px;color:#0f172a;font-weight:800;letter-spacing:-0.01em;">${inline(escapeHtml(trimmed.slice(2)))}</h1>`);
      i++; continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      if (listTag !== 'ul') { closeList(); listTag = 'ul'; out.push('<ul style="padding-left:20px;margin:12px 0;">'); }
      out.push(`<li style="margin:4px 0;">${inline(escapeHtml(trimmed.replace(/^[-*]\s+/, '')))}</li>`);
      i++; continue;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      if (listTag !== 'ol') { closeList(); listTag = 'ol'; out.push('<ol style="padding-left:20px;margin:12px 0;">'); }
      out.push(`<li style="margin:4px 0;">${inline(escapeHtml(trimmed.replace(/^\d+\.\s+/, '')))}</li>`);
      i++; continue;
    }

    closeList();
    out.push(`<p style="margin:12px 0;line-height:1.6;">${inline(escapeHtml(trimmed))}</p>`);
    i++;
  }
  closeList();
  return out.join('\n');
}

/**
 * Wrap rendered body HTML in the broadcast email shell. Shares visual
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
    <div style="background:#ffffff;border-radius:16px;padding:28px 24px;border:1px solid #e2e8f0;box-shadow:0 4px 12px -6px rgba(15,23,42,0.1);font-size:14px;color:#334155;">
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

  const text = `${subject}\n\n${stripHtml(bodyHtml)}\n\nOpen: ${appUrl}/home\nUnsubscribe: ${unsubscribeUrl}\n`;
  return { html, text };
}

function stripHtml(s) {
  return String(s || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
