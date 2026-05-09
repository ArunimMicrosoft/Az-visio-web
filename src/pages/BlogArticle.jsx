// Individual blog article view — renders markdown-style content as HTML
import React, { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { blogArticles, articleContent } from '../utils/blogArticles';
import './Blog.css';

// Simple markdown-to-HTML converter (no external lib needed)
const renderMarkdown = (md) => {
  if (!md) return '';
  const lines = md.split('\n');
  const out = [];
  let inList = false;
  let listTag = '';

  const inline = (s) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');

  const closeList = () => {
    if (inList) {
      out.push(`</${listTag}>`);
      inList = false;
      listTag = '';
    }
  };

  lines.forEach((raw) => {
    const line = raw.trim();
    if (!line) {
      closeList();
      return;
    }
    if (line.startsWith('### ')) {
      closeList();
      out.push(`<h3>${inline(line.slice(4))}</h3>`);
    } else if (line.startsWith('## ')) {
      closeList();
      out.push(`<h2>${inline(line.slice(3))}</h2>`);
    } else if (line.startsWith('# ')) {
      closeList();
      out.push(`<h1>${inline(line.slice(2))}</h1>`);
    } else if (/^[-*] /.test(line)) {
      if (!inList || listTag !== 'ul') {
        closeList();
        listTag = 'ul';
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inline(line.slice(2))}</li>`);
    } else if (/^\d+\. /.test(line)) {
      if (!inList || listTag !== 'ol') {
        closeList();
        listTag = 'ol';
        out.push('<ol>');
        inList = true;
      }
      out.push(`<li>${inline(line.replace(/^\d+\. /, ''))}</li>`);
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
  });
  closeList();
  return out.join('\n');
};

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

  const html = renderMarkdown(content);

  return (
    <div className="article-page">
      <div className="article-container">
        <Link to="/blog" className="article-back">← Back to all articles</Link>

        <header className="article-header">
          <div className="article-cat">{article.category}</div>
          <h1 className="article-title">{article.title}</h1>
          <div className="article-meta">
            <span>{article.author}</span>
            <span>·</span>
            <span>
              {new Date(article.date).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span>·</span>
            <span>{article.readTime} read</span>
          </div>
        </header>

        <article
          className="article-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="article-footer">
          <h3>Want to put these ideas into practice?</h3>
          <p>Design your own Azure architecture visually with Cloud Canvas Designer</p>
          <Link to="/signup">Start Free Trial</Link>
        </div>
      </div>
    </div>
  );
};

export default BlogArticle;
