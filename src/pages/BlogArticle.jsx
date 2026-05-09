// Individual blog article view — branded, colorful, with related articles
import React, { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { blogArticles, articleContent, categoryColors } from '../utils/blogArticles';
import { BlogHeader, BlogFooter } from '../components/BlogLayout';
import { renderMarkdown } from '../utils/blogRenderer';
import { diagramBySlug } from '../utils/blogDiagrams';
import './Blog.css';

// Replace {{diagram:id}} tokens with fenced SVG blocks so the renderer emits <figure>
const injectDiagrams = (md) =>
  md.replace(/\{\{diagram:([a-zA-Z]+)\}\}/g, (_match, id) => {
    const svg = diagramBySlug[id];
    return svg ? `\n\n\`\`\`svg\n${svg}\n\`\`\`\n\n` : '';
  });

const BlogArticle = () => {
  const { slug } = useParams();
  const article = blogArticles.find((a) => a.slug === slug);
  const content = articleContent[slug];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

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
