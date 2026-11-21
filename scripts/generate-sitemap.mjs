// Build-time sitemap generator.
// Reads every blog article slug from src/utils/blogArticles.js and writes a
// complete sitemap.xml to public/sitemap.xml, so Google gets every URL fresh
// on every deploy without any manual bookkeeping.
//
// Wired into package.json `build` script so it runs automatically before Vite.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const HOSTNAME = 'https://cloudcanvas.co';
const TODAY = new Date().toISOString().split('T')[0];

// Load .env so the build can reach Supabase even when the shell didn't export
// VITE_SUPABASE_* (common on local prebuild).
function loadDotEnvIntoProcess() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  try {
    const raw = fs.readFileSync(envPath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!m) continue;
      const [, k, vRaw] = m;
      if (process.env[k]) continue;
      // strip wrapping quotes if any
      const v = vRaw.replace(/^['"]|['"]$/g, '');
      process.env[k] = v;
    }
  } catch { /* ignore */ }
}
loadDotEnvIntoProcess();

// Static routes with priority + change-frequency hints.
// Auth pages (/login, /signup) are indexable but low priority.
// Admin / payment / api are excluded — robots.txt already disallows them.
const STATIC_ROUTES = [
  { path: '/',        priority: '1.0', changefreq: 'weekly' },
  { path: '/blog',    priority: '0.9', changefreq: 'daily'  },
  { path: '/login',   priority: '0.5', changefreq: 'yearly' },
  { path: '/signup',  priority: '0.6', changefreq: 'yearly' },
  { path: '/terms',   priority: '0.3', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
];

async function loadBlogSlugs() {
  // Parse blogArticles.js as text (fast, avoids running React/Vite imports).
  const filePath = path.join(ROOT, 'src', 'utils', 'blogArticles.js');
  const src = fs.readFileSync(filePath, 'utf8');

  const slugs = [];
  const slugRe = /slug:\s*['"]([\w-]+)['"]/g;
  const dateRe = /date:\s*['"](\d{4}-\d{2}-\d{2})['"]/g;
  const slugMatches = [...src.matchAll(slugRe)];
  const dateMatches = [...src.matchAll(dateRe)];

  for (let i = 0; i < slugMatches.length; i++) {
    slugs.push({
      slug: slugMatches[i][1],
      date: dateMatches[i] ? dateMatches[i][1] : TODAY,
    });
  }
  return slugs;
}

// Fetch published slugs from the Supabase REST endpoint. Graceful on failure:
// missing env vars, non-2xx, parse error, timeout — all just log a warning
// and return []. Build must never fail because of this.
async function loadDbSlugs() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('[sitemap] Supabase env vars not set — skipping DB posts.');
    return [];
  }

  const endpoint =
    url.replace(/\/+$/, '') +
    '/rest/v1/blog_posts?select=slug,published_at,updated_at&published=eq.true&order=published_at.desc';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!resp.ok) {
      console.warn(`[sitemap] Supabase blog_posts fetch returned ${resp.status} — skipping DB posts.`);
      return [];
    }
    const rows = await resp.json();
    if (!Array.isArray(rows)) {
      console.warn('[sitemap] Supabase blog_posts response was not an array — skipping DB posts.');
      return [];
    }
    return rows
      .filter((r) => r && typeof r.slug === 'string' && /^[a-z0-9-]+$/.test(r.slug))
      .map((r) => ({
        slug: r.slug,
        date: (r.published_at || r.updated_at || TODAY).slice(0, 10),
      }));
  } catch (err) {
    console.warn('[sitemap] Supabase blog_posts fetch failed — skipping DB posts:', err?.message || err);
    return [];
  }
}

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod    ? `    <lastmod>${lastmod}</lastmod>`           : '',
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
    priority   ? `    <priority>${priority}</priority>`       : '',
    '  </url>',
  ].filter(Boolean).join('\n');
}

async function main() {
  const staticSlugs = await loadBlogSlugs();
  const dbSlugs = await loadDbSlugs();

  // Merge — DB wins on slug collision, keeping its fresher lastmod.
  const bySlug = new Map();
  for (const s of staticSlugs) bySlug.set(s.slug, s);
  for (const s of dbSlugs) bySlug.set(s.slug, s);
  const slugs = Array.from(bySlug.values());

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  // Static routes
  for (const r of STATIC_ROUTES) {
    lines.push(urlEntry({
      loc:        `${HOSTNAME}${r.path}`,
      lastmod:    TODAY,
      changefreq: r.changefreq,
      priority:   r.priority,
    }));
  }

  // Blog article routes
  for (const a of slugs) {
    lines.push(urlEntry({
      loc:        `${HOSTNAME}/blog/${a.slug}`,
      lastmod:    a.date,
      changefreq: 'monthly',
      priority:   '0.7',
    }));
  }

  lines.push('</urlset>');
  const xml = lines.join('\n') + '\n';

  const outDir = path.join(ROOT, 'public');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), xml, 'utf8');

  console.log(
    `[sitemap] Wrote ${STATIC_ROUTES.length + slugs.length} URLs to public/sitemap.xml ` +
      `(${STATIC_ROUTES.length} static routes, ${staticSlugs.length} static posts, ${dbSlugs.length} DB posts).`
  );
}

main().catch((err) => {
  console.error('[sitemap] Failed:', err);
  process.exit(1);
});
