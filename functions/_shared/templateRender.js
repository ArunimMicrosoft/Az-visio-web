// Mustache-lite template renderer for admin-controlled email templates.
//
// Supports {{var_name}} substitution. Unknown or null vars collapse to an
// empty string so the final email never ships `{{something}}` to the user.
//
// Variables are shared between subject and body templates. A separate pure
// function builds a "recipient context" from a profile row + a few extra
// hints the handler already has on hand.

const VAR_RE = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

/**
 * Replace {{var}} occurrences in `template` with values from `context`.
 * Missing vars render as empty strings.
 */
export function renderTemplate(template, context) {
  if (!template) return '';
  const ctx = context || {};
  return String(template).replace(VAR_RE, (_m, key) => {
    const v = ctx[key];
    if (v === undefined || v === null) return '';
    return String(v);
  });
}

/**
 * Local-part of an email, lowercased with the leading letter uppercased.
 * Used as a `first_name` fallback when the profile does not have `name`.
 */
function emailToFirstName(email) {
  if (!email) return '';
  const local = String(email).split('@')[0] || '';
  // Keep it short and friendly — grab the chunk before the first dot/plus
  const base = local.split(/[.+_-]/)[0] || local;
  if (!base) return '';
  return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
}

/**
 * Build the recipient context used by both subject and body renders.
 *
 * @param {{
 *   profile: { email: string, name?: string, last_active_at?: string, last_login?: string, created_at?: string },
 *   recentDiagramsCount: number,
 *   suggestedArticle?: { title: string, slug: string } | null,
 *   unsubscribeUrl: string,
 *   appUrl?: string,
 *   now?: Date,
 * }} input
 */
export function buildRecipientContext({
  profile,
  recentDiagramsCount = 0,
  suggestedArticle = null,
  unsubscribeUrl = '',
  appUrl = 'https://cloudcanvas.co',
  now = new Date(),
}) {
  const email = profile?.email || '';
  const nameFromProfile = (profile?.name || '').trim();
  const firstName = nameFromProfile
    ? nameFromProfile.split(/\s+/)[0]
    : emailToFirstName(email);

  const lastSeenIso =
    profile?.last_active_at || profile?.last_login || profile?.created_at || null;
  let daysSinceLastVisit = '';
  if (lastSeenIso) {
    const diffMs = now.getTime() - new Date(lastSeenIso).getTime();
    if (!Number.isNaN(diffMs) && diffMs >= 0) {
      daysSinceLastVisit = String(Math.floor(diffMs / 86_400_000));
    }
  }

  const article = suggestedArticle || null;
  const articleUrl = article?.slug ? `${appUrl}/blog/${article.slug}` : '';
  const trimmedAppUrl = String(appUrl || '').replace(/\/+$/, '');

  return {
    first_name: firstName || 'there',
    email,
    recent_diagrams_count: String(recentDiagramsCount || 0),
    days_since_last_visit: daysSinceLastVisit,
    suggested_article_title: article?.title || '',
    suggested_article_url: articleUrl,
    unsubscribe_url: unsubscribeUrl,
    // Product deep-links — stable URLs so welcome/onboarding templates
    // can point users straight at the canvas, home dashboard, and SOP
    // guide without the admin having to hardcode the hostname in every
    // body_template.
    canvas_url: `${trimmedAppUrl}/app`,
    home_url: `${trimmedAppUrl}/home`,
    sop_url: `${trimmedAppUrl}/blog/cloud-canvas-designer-sop`,
  };
}

/**
 * A short list of supported variables + one-line descriptions. The admin
 * UI renders this as a help panel beside the editor so admins know exactly
 * what they can type.
 */
export const TEMPLATE_VARIABLES = [
  { key: 'first_name',             description: "Recipient's first name (falls back to email local-part)." },
  { key: 'email',                  description: "Recipient's email address." },
  { key: 'recent_diagrams_count',  description: 'How many diagrams the user has on the canvas.' },
  { key: 'days_since_last_visit',  description: 'Whole days since the user last signed in.' },
  { key: 'suggested_article_title',description: 'Title of a recommended blog post.' },
  { key: 'suggested_article_url',  description: 'Full URL to the recommended blog post.' },
  { key: 'unsubscribe_url',        description: 'One-click unsubscribe link for this recipient.' },
  { key: 'canvas_url',             description: 'Deep-link to the canvas editor (cloudcanvas.co/app).' },
  { key: 'home_url',               description: 'Deep-link to the user home dashboard (cloudcanvas.co/home).' },
  { key: 'sop_url',                description: 'Deep-link to the Product Guide / SOP article.' },
];
