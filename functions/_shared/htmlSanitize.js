// Server-side HTML sanitizer for admin-authored email bodies.
//
// Must run inside Cloudflare Workers (no DOM, no jsdom, no `window`).
// We therefore hand-roll a tokenizer rather than depend on DOMPurify — the
// browser DOMPurify needs a DOM, the isomorphic variant needs jsdom, and
// neither is available in the Worker runtime without pulling the Node compat
// shim just for sanitization.
//
// Rules (keep in sync with src/utils/htmlSanitize.js):
//
//   - Tags not in TAG_ALLOWLIST are stripped entirely (opening, closing,
//     and their content when it's a dangerous element like <script>).
//   - Attributes not in ATTR_ALLOWLIST are dropped.
//   - On `href` / `src`, only `http://`, `https://`, `mailto:`, and `tel:`
//     URLs survive. `javascript:`, `vbscript:`, `data:text/html`, and
//     anything else collapses to `#`.
//   - HTML comments are removed.
//
// This is a sanitizer, not a parser. Admin-authored TipTap output is well-
// formed; the goal is defence-in-depth against a paste that smuggles a
// `<script>` or `onerror="..."` through the preview into Resend.

const TAG_ALLOWLIST = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
  'h1', 'h2', 'h3', 'h4',
  'ul', 'ol', 'li',
  'a', 'img', 'blockquote', 'code', 'pre', 'hr',
  'span', 'div',
]);

// Elements whose *content* must also be discarded, not just the tag.
const DROP_WITH_CONTENT = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'noscript',
  'template', 'link', 'meta', 'base', 'frame', 'frameset',
]);

// Void elements — no closing tag emitted.
const VOID_TAGS = new Set(['br', 'img', 'hr']);

const ATTR_ALLOWLIST_ALL   = new Set(['title', 'alt']);
const ATTR_ALLOWLIST_BY_TAG = {
  a:   new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'title', 'width', 'height']),
};

// Safe URL schemes for href/src. Everything else collapses to "#".
const SAFE_URL = /^(https?:|mailto:|tel:)/i;
// Relative URLs that start with `/` or `./` or `#` are also fine.
const SAFE_REL_URL = /^(#|\/|\.\/)/;

function isSafeUrl(value) {
  if (!value) return false;
  const v = String(value).trim();
  if (SAFE_URL.test(v)) return true;
  if (SAFE_REL_URL.test(v)) return true;
  return false;
}

function decodeAttrValue(v) {
  // We keep entities intact; only strip the outer quotes if present.
  return String(v == null ? '' : v);
}

function serialiseAttrs(tagName, rawAttrs) {
  // rawAttrs is an array of [name, value] pairs already lowercased on name.
  const allow = ATTR_ALLOWLIST_BY_TAG[tagName] || ATTR_ALLOWLIST_ALL;
  const out = [];
  for (const [name, value] of rawAttrs) {
    if (name.startsWith('on')) continue;              // onclick, onerror, ...
    if (name === 'style' || name === 'class' || name === 'id') continue;
    if (!allow.has(name) && !ATTR_ALLOWLIST_ALL.has(name)) continue;

    let v = decodeAttrValue(value);
    if ((name === 'href' || name === 'src') && !isSafeUrl(v)) {
      v = '#';
    }
    // Escape double-quotes so we can always wrap the value in ".
    const safeVal = v.replace(/"/g, '&quot;');
    out.push(`${name}="${safeVal}"`);
  }
  // Force safe anchor behaviour: open-in-new-tab and strip referrer.
  if (tagName === 'a') {
    if (!out.some((a) => a.startsWith('target='))) out.push('target="_blank"');
    if (!out.some((a) => a.startsWith('rel=')))    out.push('rel="noopener noreferrer"');
  }
  return out.length ? ' ' + out.join(' ') : '';
}

// Very small tokenizer: walks through `html`, emits plain text chunks and
// tag tokens. Rejects unterminated tags (anything that doesn't close with
// `>`). Comments and processing instructions are discarded.
function* tokenise(html) {
  let i = 0;
  const n = html.length;
  while (i < n) {
    const lt = html.indexOf('<', i);
    if (lt === -1) {
      yield { type: 'text', value: html.slice(i) };
      return;
    }
    if (lt > i) {
      yield { type: 'text', value: html.slice(i, lt) };
    }
    // Comment or declaration
    if (html.startsWith('<!--', lt)) {
      const end = html.indexOf('-->', lt + 4);
      i = end === -1 ? n : end + 3;
      continue;
    }
    if (html[lt + 1] === '!') {
      const end = html.indexOf('>', lt + 2);
      i = end === -1 ? n : end + 1;
      continue;
    }
    // Tag
    const end = html.indexOf('>', lt + 1);
    if (end === -1) {
      // Unterminated tag — emit the rest as plain text and bail.
      yield { type: 'text', value: html.slice(lt) };
      return;
    }
    const raw = html.slice(lt + 1, end);
    i = end + 1;
    const closing = raw.startsWith('/');
    const body = closing ? raw.slice(1).trim() : raw.trim();
    const nameMatch = body.match(/^([a-zA-Z][a-zA-Z0-9]*)/);
    if (!nameMatch) continue; // malformed, skip
    const name = nameMatch[1].toLowerCase();
    const rest = body.slice(nameMatch[0].length);
    const selfClosing = rest.endsWith('/');
    const attrsStr = selfClosing ? rest.slice(0, -1) : rest;

    yield { type: closing ? 'close' : 'open', name, attrsStr, selfClosing };
  }
}

// Extract [name, value] pairs from an attribute string like:
//   ` href="https://x" title='y' disabled`
function parseAttrs(attrsStr) {
  const pairs = [];
  const re = /\s*([a-zA-Z_:][a-zA-Z0-9_\-:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = re.exec(attrsStr))) {
    const name = m[1].toLowerCase();
    const value = m[2] != null ? m[2] : m[3] != null ? m[3] : m[4] != null ? m[4] : '';
    pairs.push([name, value]);
  }
  return pairs;
}

const ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};
function escapeText(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ENTITY_MAP[c]);
}

/**
 * Sanitize admin-authored HTML into an email-safe string.
 *
 * @param {string} html
 * @returns {string} sanitized HTML (never `null`, always a string).
 */
export function sanitizeEmailHtml(html) {
  if (!html || typeof html !== 'string') return '';

  const out = [];
  let dropDepth = 0;   // >0 while inside a DROP_WITH_CONTENT element.
  let dropTag = null;

  for (const tok of tokenise(html)) {
    if (dropDepth > 0) {
      // Only closing of the same tag can bring us back out.
      if (tok.type === 'close' && tok.name === dropTag) {
        dropDepth -= 1;
        if (dropDepth === 0) dropTag = null;
      } else if (tok.type === 'open' && tok.name === dropTag) {
        // Nested same tag — unusual but handle gracefully.
        dropDepth += 1;
      }
      continue;
    }

    if (tok.type === 'text') {
      // Keep text as-is; the tokenizer already split around '<'.
      out.push(tok.value);
      continue;
    }

    if (DROP_WITH_CONTENT.has(tok.name)) {
      if (tok.type === 'open' && !tok.selfClosing) {
        dropDepth = 1;
        dropTag = tok.name;
      }
      // self-closing <script/> or orphan close — simply drop.
      continue;
    }

    if (!TAG_ALLOWLIST.has(tok.name)) {
      // Tag not allowed; strip the tag but keep inner content.
      continue;
    }

    if (tok.type === 'close') {
      if (VOID_TAGS.has(tok.name)) continue;  // defensive
      out.push(`</${tok.name}>`);
      continue;
    }

    const attrs = parseAttrs(tok.attrsStr || '');
    const attrStr = serialiseAttrs(tok.name, attrs);

    if (VOID_TAGS.has(tok.name) || tok.selfClosing) {
      out.push(`<${tok.name}${attrStr} />`);
    } else {
      out.push(`<${tok.name}${attrStr}>`);
    }
  }

  return out.join('');
}

/**
 * Collapse rendered HTML into a plaintext fallback for the Resend `text`
 * field. Strips tags, decodes a tiny set of common entities, and squeezes
 * whitespace. Not a full HTML-to-text converter.
 */
export function htmlToPlainText(html) {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<br\s*\/?>(?!\n)/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n\s*\n+/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

// Exported for callers that need to wrap untrusted plaintext (e.g. the
// subject line, rendered into the email shell) with a minimal HTML entity
// encoder.
export { escapeText };

export default sanitizeEmailHtml;
