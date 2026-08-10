// Build-time sitemap generator.
// Reads every blog article slug from src/utils/blogArticles.js and writes a
// complete sitemap.xml to public/sitemap.xml, so Google gets every URL fresh
// on every deploy without any manual bookkeeping.
//
// Wired into package.json `build` script so it runs automatically before Vite.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const HOSTNAME = 'https://cloudcanvas.co';
const TODAY = new Date().toISOString().split('T')[0];

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
  const slugs = await loadBlogSlugs();

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

  console.log(`[sitemap] Wrote ${STATIC_ROUTES.length + slugs.length} URLs to public/sitemap.xml`);
}

main().catch((err) => {
  console.error('[sitemap] Failed:', err);
  process.exit(1);
});
