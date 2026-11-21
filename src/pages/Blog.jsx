// Blog listing page — shows all articles with filter by category
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogArticles, categoryColors } from '../utils/blogArticles';
import { BlogHeader, BlogFooter } from '../components/BlogLayout';
import { fetchLikeCounts } from '../utils/blogLikes';
import { fetchCommentCounts } from '../utils/blogComments';
import { fetchPublishedPosts } from '../utils/blogPosts';
import { useAuth } from '../contexts/AuthContext';
import usePageSEO from '../hooks/usePageSEO';
import './Blog.css';

// Merge DB posts with the static array, DB-first on slug collision, sorted
// newest first. Keeps the shape identical to blogArticles so existing filter
// and card components keep working unchanged.
const mergeArticles = (dbPosts, staticPosts) => {
  const bySlug = new Map();
  for (const a of staticPosts) bySlug.set(a.slug, a);
  for (const a of dbPosts) bySlug.set(a.slug, a); // DB wins
  const merged = Array.from(bySlug.values());
  merged.sort((x, y) => new Date(y.date || 0) - new Date(x.date || 0));
  return merged;
};

const Blog = () => {
  usePageSEO({
    title: 'Azure Architecture Blog — Learn WAF, IaC, Cost, Networking | Cloud Canvas',
    description:
      'Deep-dive Azure architecture guides — Well-Architected Framework, hub-spoke networking, Terraform vs Bicep, cost optimization, security, migration, AKS, cost APIs, and more. 60+ practical articles.',
    keywords:
      'Azure architecture blog, Azure Well-Architected Framework, Azure networking, hub-spoke, Terraform, Bicep, ARM template, Azure cost optimization, Azure security, AKS, Azure migration, Azure landing zone, Azure Resource Graph, cloud architecture, Azure engineering, infrastructure as code',
    canonical: 'https://cloudcanvas.co/blog',
    image: 'https://cloudcanvas.co/screenshots/app-overview.png',
    type: 'website',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Cloud Canvas Designer — Azure Architecture Blog',
      url: 'https://cloudcanvas.co/blog',
      description: 'Deep-dive Azure architecture guides, cost, WAF, IaC, and networking articles.',
      publisher: {
        '@type': 'Organization',
        name: "Arunim's IT Café",
        logo: { '@type': 'ImageObject', url: 'https://cloudcanvas.co/favicon.svg' },
      },
    },
  });

  const { isAuthenticated } = useAuth();
  const submitHref = isAuthenticated ? '/blog/submit' : '/login?returnTo=/blog/submit';

  const [category, setCategory] = useState('All');
  const [dbPosts, setDbPosts] = useState([]);

  // Load DB-backed posts on mount. Failure is non-fatal — merged list just
  // falls back to the static array.
  useEffect(() => {
    let alive = true;
    fetchPublishedPosts()
      .then((rows) => { if (alive) setDbPosts(rows); })
      .catch(() => { /* already logged */ });
    return () => { alive = false; };
  }, []);

  const allArticles = React.useMemo(
    () => mergeArticles(dbPosts, blogArticles),
    [dbPosts]
  );
  const categories = ['All', ...new Set(allArticles.map((a) => a.category))];
  const filtered = category === 'All' ? allArticles : allArticles.filter((a) => a.category === category);
  const [featured, ...rest] = filtered;

  // Fetch engagement counts once for all articles
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  useEffect(() => {
    const slugs = allArticles.map((a) => a.slug);
    if (slugs.length === 0) return;
    fetchLikeCounts(slugs).then(setLikes);
    fetchCommentCounts(slugs).then(setComments);
  }, [allArticles]);

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const fmtCount = (n) => (n || 0).toLocaleString('en-IN');

  return (
    <div className="cc-blog-page">
      <BlogHeader />

      {/* Hero */}
      <section className="cc-blog-hero">
        <div className="cc-blog-hero-bg" />
        <div className="cc-blog-hero-inner">
          <span className="cc-blog-hero-badge">📘 Learn Center</span>
          <h1 className="cc-blog-hero-title">
            Azure Architecture <span className="cc-blog-hero-gradient">Insights</span>
          </h1>
          <p className="cc-blog-hero-sub">
            Practical guides, best practices, and deep dives on designing production-grade Azure workloads.
            Written by practitioners — for practitioners.
          </p>
          <div className="cc-blog-hero-stats">
            <div><strong>{allArticles.length}</strong><span>Articles</span></div>
            <div><strong>{categories.length - 1}</strong><span>Topics</span></div>
            <div><strong>Weekly</strong><span>New Content</span></div>
          </div>
        </div>
      </section>

      <div className="cc-blog-main">
        {/* Submit-your-story CTA strip — visible to everyone; logged-out users
             get bounced through /login with ?returnTo so they land back here. */}
        <Link to={submitHref} className="cc-blog-submit-strip">
          <div className="cc-blog-submit-strip-icon">📝</div>
          <div className="cc-blog-submit-strip-body">
            <div className="cc-blog-submit-strip-title">Share your Azure story — submit an article</div>
            <div className="cc-blog-submit-strip-sub">
              Draft a post and our admins will review it before publishing. No markdown gymnastics required.
            </div>
          </div>
          <div className="cc-blog-submit-strip-cta">Start writing →</div>
        </Link>

        {/* Category chips */}
        <div className="cc-blog-cats">
          {categories.map((cat) => {
            const pal = categoryColors[cat];
            return (
              <button
                key={cat}
                className={`cc-blog-cat ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
                style={category === cat && pal ? { background: pal.bg, borderColor: 'transparent', color: '#fff' } : {}}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Featured card */}
        {featured && (
          <Link
            to={`/blog/${featured.slug}`}
            className="cc-blog-featured"
            style={{ '--feat-bg': (categoryColors[featured.category]?.bg) || 'linear-gradient(135deg,#1e3a8a,#0891b2)' }}
          >
            <div className="cc-blog-featured-left">
              <span className="cc-blog-featured-label">Featured</span>
              <div className="cc-blog-featured-cat">{featured.category}</div>
              <h2 className="cc-blog-featured-title">{featured.title}</h2>
              <p className="cc-blog-featured-excerpt">{featured.excerpt}</p>
              <div className="cc-blog-featured-meta">
                <span>{featured.author}</span>
                <span>·</span>
                <span>{fmtDate(featured.date)}</span>
                <span>·</span>
                <span>{featured.readTime} read</span>
              </div>
              <div className="cc-featured-engagement">
                <span>❤️ {fmtCount(likes[featured.slug])} likes</span>
                <span>💬 {fmtCount(comments[featured.slug])} comments</span>
              </div>
              <span className="cc-blog-featured-cta">Read article →</span>
            </div>
            <div className="cc-blog-featured-right">
              <div className="cc-blog-featured-icon">{featured.icon}</div>
            </div>
          </Link>
        )}

        {/* Grid of remaining articles */}
        <div className="cc-blog-grid">
          {rest.map((article) => {
            const pal = categoryColors[article.category] || { bg: 'linear-gradient(135deg,#0078D4,#50E6FF)', solid: '#0078D4', tint: '#eff6ff' };
            return (
              <Link key={article.slug} to={`/blog/${article.slug}`} className="cc-blog-card">
                <div className="cc-blog-card-top" style={{ background: pal.bg }}>
                  <div className="cc-blog-card-icon">{article.icon}</div>
                </div>
                <div className="cc-blog-card-body">
                  <span className="cc-blog-card-cat" style={{ background: pal.tint, color: pal.solid }}>
                    {article.category}
                  </span>
                  <h3 className="cc-blog-card-title">{article.title}</h3>
                  <p className="cc-blog-card-excerpt">{article.excerpt}</p>
                  <div className="cc-blog-card-meta">
                    <span>📅 {fmtDate(article.date)}</span>
                    <span>⏱ {article.readTime}</span>
                  </div>
                  <div className="cc-blog-card-engagement">
                    <span>❤️ {fmtCount(likes[article.slug])}</span>
                    <span>💬 {fmtCount(comments[article.slug])}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="cc-blog-cta">
          <div className="cc-blog-cta-inner">
            <h2>Ready to design your own architecture?</h2>
            <p>Try Cloud Canvas Designer free for 7 days. No credit card required.</p>
            <div className="cc-blog-cta-actions">
              <Link to="/signup" className="cc-blog-cta-primary">🚀 Start Designing Free</Link>
              <Link to="/" className="cc-blog-cta-secondary">Explore Features</Link>
            </div>
          </div>
        </div>
      </div>

      <BlogFooter />
    </div>
  );
};

export default Blog;
