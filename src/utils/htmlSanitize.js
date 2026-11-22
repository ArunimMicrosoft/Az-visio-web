// Thin wrapper around DOMPurify, pinned to an email-safe allowlist.
//
// Both the RichTextEditor preview pane AND the Scheduled Emails preview
// modal render admin-authored HTML into `dangerouslySetInnerHTML`. Every
// call MUST flow through `sanitizeEmailHtml` so a paste or copy cannot
// smuggle `<script>`, event handlers, or `javascript:` URLs into the DOM.
//
// Keep the tag/attr allowlist in sync with the server-side sanitizer at
// functions/_shared/htmlSanitize.js — the two are the contract between
// what admins can author and what Resend eventually delivers.

import DOMPurify from 'dompurify';

// Minimal, email-client-safe tag set. Mirrors the server allowlist.
export const EMAIL_SAFE_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's',
  'h1', 'h2', 'h3', 'h4',
  'ul', 'ol', 'li',
  'a', 'img', 'blockquote', 'code', 'pre', 'hr',
  'span', 'div',
];

export const EMAIL_SAFE_ATTRS = [
  'href', 'src', 'alt', 'title', 'target', 'rel',
  // allow ProseMirror's inline style for alignment only; style is stripped
  // by the FORBID_ATTR fallback below unless explicitly listed.
];

/**
 * Sanitize an HTML string for the email preview surface.
 *
 * - Strips all tags not in EMAIL_SAFE_TAGS.
 * - Strips every attribute not in EMAIL_SAFE_ATTRS (so `on*` handlers,
 *   `style="javascript:..."`, data-* exfiltration vectors, etc. are gone).
 * - Blocks `javascript:` / `vbscript:` / `data:text/html` URLs on both
 *   `href` and `src` (DOMPurify handles this by default).
 *
 * @param {string} html
 * @returns {string} sanitized HTML, safe for `dangerouslySetInnerHTML`.
 */
export function sanitizeEmailHtml(html) {
  if (!html || typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: EMAIL_SAFE_TAGS,
    ALLOWED_ATTR: EMAIL_SAFE_ATTRS,
    ALLOW_DATA_ATTR: false,
    FORBID_ATTR: ['style', 'class', 'id'],
    // Keep the result as a string, not a DocumentFragment.
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });
}

// Add rel="noopener noreferrer" + target="_blank" to any outbound anchor
// after sanitization. Called separately so the preview pane behaves
// exactly like a real inbox render.
if (typeof window !== 'undefined' && DOMPurify.addHook) {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('href')) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
    if (node.tagName === 'IMG') {
      // Prevent layout-breaking huge images in the preview pane.
      node.setAttribute('loading', 'lazy');
    }
  });
}

export default sanitizeEmailHtml;
