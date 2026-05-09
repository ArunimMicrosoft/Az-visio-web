// Rich markdown renderer for blog articles
// Supports: headings, paragraphs, lists, inline code, bold/italic, links,
// fenced code blocks with language hint, tables (GitHub flavor), callouts
// (> [!NOTE] / [!TIP] / [!WARNING] / [!SUCCESS]), and inline SVG diagrams
// via ```svg ... ``` fenced blocks.

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const inline = (s) =>
  s
    // inline code first (so we don't double-escape inside)
    .replace(/`([^`]+)`/g, (_m, code) => `<code>${escapeHtml(code)}</code>`)
    // then apply escape to everything else, skipping already-HTML code tags
    // (safe for our controlled content)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>');

const CALLOUT_META = {
  NOTE:    { cls: 'note',    icon: 'ℹ️', label: 'Note' },
  TIP:     { cls: 'tip',     icon: '💡', label: 'Tip' },
  WARNING: { cls: 'warning', icon: '⚠️', label: 'Warning' },
  SUCCESS: { cls: 'success', icon: '✅', label: 'Success' },
  DANGER:  { cls: 'danger',  icon: '🚨', label: 'Critical' },
  STAT:    { cls: 'stat',    icon: '📊', label: 'Stat' },
};

export const renderMarkdown = (md) => {
  if (!md) return '';
  const raw = md.split('\n');
  const out = [];

  let i = 0;
  let inList = false;
  let listTag = '';

  const closeList = () => {
    if (inList) {
      out.push(`</${listTag}>`);
      inList = false;
      listTag = '';
    }
  };

  while (i < raw.length) {
    const line = raw[i];
    const trimmed = line.trim();

    // Blank line
    if (!trimmed) {
      closeList();
      i++;
      continue;
    }

    // Fenced block ```lang ... ``` (code, svg, diagram)
    const fenceMatch = trimmed.match(/^```\s*([a-zA-Z0-9_-]*)\s*$/);
    if (fenceMatch) {
      closeList();
      const lang = (fenceMatch[1] || '').toLowerCase();
      const buf = [];
      i++;
      while (i < raw.length && !raw[i].trim().startsWith('```')) {
        buf.push(raw[i]);
        i++;
      }
      // consume closing fence
      if (i < raw.length) i++;

      if (lang === 'svg' || lang === 'diagram') {
        // Pass-through SVG/HTML as a diagram figure
        out.push(`<figure class="cc-diagram">${buf.join('\n')}</figure>`);
      } else {
        const body = escapeHtml(buf.join('\n'));
        const label = lang ? `<span class="cc-code-lang">${lang}</span>` : '';
        out.push(`<pre class="cc-code"><code>${label}${body}</code></pre>`);
      }
      continue;
    }

    // Callout: > [!TYPE] text (may continue on next lines with >)
    const calloutStart = trimmed.match(/^>\s*\[!(NOTE|TIP|WARNING|SUCCESS|DANGER|STAT)\]\s*(.*)$/i);
    if (calloutStart) {
      closeList();
      const key = calloutStart[1].toUpperCase();
      const meta = CALLOUT_META[key] || CALLOUT_META.NOTE;
      const first = calloutStart[2] || '';
      const parts = [first];
      i++;
      while (i < raw.length && raw[i].trim().startsWith('>')) {
        parts.push(raw[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      const body = parts.join(' ').trim();
      out.push(
        `<aside class="cc-callout cc-callout-${meta.cls}">` +
          `<div class="cc-callout-icon">${meta.icon}</div>` +
          `<div class="cc-callout-body"><strong>${meta.label}</strong> ${inline(escapeHtml(body))}</div>` +
        `</aside>`
      );
      continue;
    }

    // Table: detect header row + separator + body
    if (trimmed.includes('|') && i + 1 < raw.length) {
      const sep = raw[i + 1].trim();
      if (/^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(sep)) {
        closeList();
        const splitRow = (row) =>
          row
            .trim()
            .replace(/^\||\|$/g, '')
            .split('|')
            .map((c) => c.trim());
        const headerCells = splitRow(trimmed);
        i += 2;
        const bodyRows = [];
        while (i < raw.length && raw[i].trim().includes('|')) {
          bodyRows.push(splitRow(raw[i]));
          i++;
        }
        const thead = headerCells.map((c) => `<th>${inline(escapeHtml(c))}</th>`).join('');
        const tbody = bodyRows
          .map((r) => '<tr>' + r.map((c) => `<td>${inline(escapeHtml(c))}</td>`).join('') + '</tr>')
          .join('');
        out.push(`<div class="cc-table-wrap"><table class="cc-table"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`);
        continue;
      }
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      closeList();
      out.push(`<h3>${inline(escapeHtml(trimmed.slice(4)))}</h3>`);
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      closeList();
      out.push(`<h2>${inline(escapeHtml(trimmed.slice(3)))}</h2>`);
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      closeList();
      out.push(`<h1>${inline(escapeHtml(trimmed.slice(2)))}</h1>`);
      i++;
      continue;
    }

    // Lists
    if (/^[-*]\s+/.test(trimmed)) {
      if (!inList || listTag !== 'ul') {
        closeList();
        listTag = 'ul';
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inline(escapeHtml(trimmed.replace(/^[-*]\s+/, '')))}</li>`);
      i++;
      continue;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      if (!inList || listTag !== 'ol') {
        closeList();
        listTag = 'ol';
        out.push('<ol>');
        inList = true;
      }
      out.push(`<li>${inline(escapeHtml(trimmed.replace(/^\d+\.\s+/, '')))}</li>`);
      i++;
      continue;
    }

    // Paragraph
    closeList();
    out.push(`<p>${inline(escapeHtml(trimmed))}</p>`);
    i++;
  }
  closeList();
  return out.join('\n');
};

export default renderMarkdown;
