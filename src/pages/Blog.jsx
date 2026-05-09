// Blog listing page — shows all articles with filter by category
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { blogArticles } from '../utils/blogArticles';
import './Blog.css';

const Blog = () => {
  const [category, setCategory] = useState('All');
  const categories = ['All', ...new Set(blogArticles.map(a => a.category))];

  const filtered = category === 'All' ? blogArticles : blogArticles.filter(a => a.category === category);

  return (
    <div className="blog-page">
      <header className="blog-header">
        <div className="blog-header-inner">
          <Link to="/" className="blog-home-link">← Home</Link>
          <h1 className="blog-title">Azure Architecture Learn Center</h1>
          <p className="blog-subtitle">
            Practical guides, best practices, and deep dives on Azure cloud architecture
          </p>
        </div>
      </header>

      <div className="blog-container">
        <div className="blog-categories">
          {categories.map(cat => (
            <button
              key={cat}
              className={`blog-cat-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="blog-grid">
          {filtered.map(article => (
            <Link key={article.slug} to={`/blog/${article.slug}`} className="blog-card">
              <div className="blog-card-icon">{article.icon}</div>
              <div className="blog-card-cat">{article.category}</div>
              <h3 className="blog-card-title">{article.title}</h3>
              <p className="blog-card-excerpt">{article.excerpt}</p>
              <div className="blog-card-meta">
                <span>{article.readTime}</span>
                <span>·</span>
                <span>{new Date(article.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="blog-cta">
          <h2>Ready to design your own architecture?</h2>
          <p>Try Cloud Canvas Designer free for 7 days — no credit card needed</p>
          <Link to="/signup" className="blog-cta-btn">Start Designing Free</Link>
        </div>
      </div>
    </div>
  );
};

export default Blog;
