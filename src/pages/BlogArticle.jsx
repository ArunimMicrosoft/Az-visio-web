// Individual blog article view — branded, colorful, with related articles
import React, { useEffect, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { blogArticles, articleContent, categoryColors } from '../utils/blogArticles';
import { BlogHeader, BlogFooter } from '../components/BlogLayout';
import { renderMarkdown } from '../utils/blogRenderer';
import { diagramBySlug } from '../utils/blogDiagrams';
import { fetchPublishedPostBySlug, bumpViewCount } from '../utils/blogPosts';
import BlogComments from '../components/BlogComments';
import LikeButton from '../components/LikeButton';
import usePageSEO from '../hooks/usePageSEO';
import './Blog.css';

// Replace {{diagram:id}} tokens with fenced SVG blocks so the renderer emits <figure>
const injectDiagrams = (md) =>
  md.replace(/\{\{diagram:([a-zA-Z]+)\}\}/g, (_match, id) => {
    const svg = diagramBySlug[id];
    return svg ? `\n\n\`\`\`svg\n${svg}\n\`\`\`\n\n` : '';
  });

const BlogArticle = () => {
  const { slug } = useParams();

  // DB-first lookup. State is bundled so the effect only writes once
  // (asynchronously) — this avoids react-hooks/set-state-in-effect.
  // Treat stale state (dbState.slug !== slug) as "not yet checked".
  const [dbState, setDbState] = useState({ slug: null, post: null, checked: false });

  useEffect(() => {
    let alive = true;
    fetchPublishedPostBySlug(slug)
      .then((row) => {
        if (!alive) return;
        setDbState({ slug, post: row || null, checked: true });
        if (row) {
          // Fire-and-forget view count bump (safe on anon; RPC is SECURITY DEFINER).
          bumpViewCount(slug);
        }
      })
      .catch(() => {
        if (alive) setDbState({ slug, post: null, checked: true });
      });
    return () => { alive = false; };
  }, [slug]);

  const checkedForCurrentSlug = dbState.slug === slug && dbState.checked;
  const dbPost = checkedForCurrentSlug ? dbState.post : null;
  const dbChecked = checkedForCurrentSlug;

  const staticArticle = blogArticles.find((a) => a.slug === slug);
  const staticContent = articleContent[slug];

  // Prefer DB post when present; otherwise fall back to the static article.
  const article = dbPost || staticArticle || null;
  const content = dbPost ? dbPost.content : staticContent;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Per-article SEO — dynamic title, description, canonical, and Article JSON-LD
  // for Google's Article rich result. Hook is called unconditionally (React
  // rules-of-hooks); when the article is missing it passes null and no-ops.
  usePageSEO(
    article
      ? {
          title: `${article.title} | Cloud Canvas Designer Blog`,
          description: article.excerpt,
          keywords: `Azure, ${article.category}, ${article.title}, Cloud Canvas Designer, Azure architecture, Terraform, Bicep, WAF`,
          canonical: `https://cloudcanvas.co/blog/${slug}`,
          image: 'https://cloudcanvas.co/screenshots/app-overview.png',
          type: 'article',
          structuredData: [
            {
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: article.title,
              description: article.excerpt,
              image: 'https://cloudcanvas.co/screenshots/app-overview.png',
              datePublished: article.date,
              dateModified: article.date,
              author: {
                '@type': 'Organization',
                name: article.author || "Arunim's IT Café",
                url: 'https://cloudcanvas.co/',
              },
              publisher: {
                '@type': 'Organization',
                name: "Arunim's IT Café",
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://cloudcanvas.co/favicon.svg',
                },
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `https://cloudcanvas.co/blog/${slug}`,
              },
              articleSection: article.category,
              keywords: `Azure, ${article.category}, ${article.title}`,
            },
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cloudcanvas.co/' },
                { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://cloudcanvas.co/blog' },
                { '@type': 'ListItem', position: 3, name: article.title, item: `https://cloudcanvas.co/blog/${slug}` },
              ],
            },
          ],
        }
      : null
  );

  // Wait for the DB check before giving up — otherwise a brand-new DB post
  // would briefly redirect to /blog while Supabase is still responding.
  if (!dbChecked && !staticArticle) {
    return (
      <div className="cc-blog-page">
        <BlogHeader />
        <div style={{ padding: '80px 20px', textAlign: 'center', color: '#6b7280' }}>Loading article…</div>
        <BlogFooter />
      </div>
    );
  }

  if (!article || !content) {
    return <Navigate to="/blog" replace />;
  }

  // Strip first H1 if it matches the title (avoid duplication with hero)
  const body = content.replace(/^#\s+.+\n?/, '');
  const html = renderMarkdown(injectDiagrams(body));
  const pal =
    categoryColors[article.category] ||
    { bg: 'linear-gradient(135deg,#0078D4,#50E6FF)', solid: '#0078D4', tint: '#eff6ff' };

  const related = blogArticles.filter((a) => a.slug !== slug && a.category === article.category).slice(0, 3);
  const fallbackRelated = blogArticles.filter((a) => a.slug !== slug).slice(0, 3 - related.length);
  const allRelated = [...related, ...fallbackRelated].slice(0, 3);

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="cc-blog-page">
      <BlogHeader />

      {/* Colored article hero */}
      <section className="cc-article-hero" style={{ background: pal.bg }}>
        <div className="cc-article-hero-overlay" />
        <div className="cc-article-hero-inner">
          <Link to="/blog" className="cc-article-back">← All articles</Link>
          <span className="cc-article-cat-badge">{article.category}</span>
          <div className="cc-article-hero-icon">{article.icon}</div>
          <h1 className="cc-article-hero-title">{article.title}</h1>
          <div className="cc-article-hero-meta">
            <span>✍️ {article.author}</span>
            <span>·</span>
            <span>📅 {fmtDate(article.date)}</span>
            <span>·</span>
            <span>⏱ {article.readTime} read</span>
          </div>
          <div className="cc-article-hero-actions">
            <LikeButton slug={slug} />
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="cc-article-body-wrap">
        <article
          className="cc-article-body"
          style={{ '--accent': pal.solid, '--accent-tint': pal.tint }}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Article CTA card */}
        <div className="cc-article-cta" style={{ background: pal.bg }}>
          <div className="cc-article-cta-text">
            <h3>Put these ideas into practice</h3>
            <p>Design, validate, and export Azure architectures visually — in minutes, not hours.</p>
          </div>
          <Link to="/signup" className="cc-article-cta-btn">Start Free Trial →</Link>
        </div>

        {/* Community notes / comments */}
        <BlogComments slug={slug} />

        {/* Related */}
        {allRelated.length > 0 && (
          <section className="cc-article-related">
            <h3 className="cc-article-related-title">Continue reading</h3>
            <div className="cc-related-grid">
              {allRelated.map((r) => {
                const rpal = categoryColors[r.category] || pal;
                return (
                  <Link key={r.slug} to={`/blog/${r.slug}`} className="cc-related-card">
                    <div className="cc-related-top" style={{ background: rpal.bg }}>
                      <span className="cc-related-icon">{r.icon}</span>
                    </div>
                    <div className="cc-related-body">
                      <span className="cc-related-cat" style={{ color: rpal.solid }}>{r.category}</span>
                      <h4>{r.title}</h4>
                      <span className="cc-related-read">{r.readTime} read →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <BlogFooter />
    </div>
  );
};

export default BlogArticle;
