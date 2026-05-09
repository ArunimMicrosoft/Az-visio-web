// Shared branded layout (header + footer) for blog pages
import React from 'react';
import { Link } from 'react-router-dom';

export const BlogHeader = () => (
  <header className="cc-blog-topnav">
    <Link to="/" className="cc-blog-brand">
      <svg className="cc-blog-brand-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#0078D4" />
        <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="#50E6FF" />
      </svg>
      <div className="cc-blog-brand-text">
        <span className="cc-blog-brand-name">Cloud Canvas Designer</span>
        <span className="cc-blog-brand-tag">Learn Center</span>
      </div>
    </Link>
    <nav className="cc-blog-topnav-actions">
      <Link to="/blog" className="cc-blog-nav-link">Articles</Link>
      <Link to="/" className="cc-blog-nav-link">Home</Link>
      <Link to="/signup" className="cc-blog-nav-cta">Start Free Trial</Link>
    </nav>
  </header>
);

export const BlogFooter = () => (
  <footer className="cc-blog-footer">
    <div className="cc-blog-footer-content">
      <div className="cc-blog-footer-brand">
        <svg className="cc-blog-footer-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#0078D4" />
          <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="#50E6FF" />
        </svg>
        <div>
          <div className="cc-blog-footer-name">Cloud Canvas Designer</div>
          <div className="cc-blog-footer-sub">Design. Validate. Deploy Azure architectures visually.</div>
        </div>
      </div>
      <div className="cc-blog-footer-grid">
        <div className="cc-blog-footer-col">
          <h5>Product</h5>
          <Link to="/">Home</Link>
          <Link to="/signup">Start Free Trial</Link>
          <Link to="/login">Sign In</Link>
        </div>
        <div className="cc-blog-footer-col">
          <h5>Learn</h5>
          <Link to="/blog">All Articles</Link>
          <a href="https://learn.microsoft.com/en-us/azure/architecture/" target="_blank" rel="noopener noreferrer">Azure Arch Center</a>
          <a href="https://azure.microsoft.com/en-us/pricing/calculator/" target="_blank" rel="noopener noreferrer">Azure Pricing</a>
        </div>
        <div className="cc-blog-footer-col">
          <h5>Contact</h5>
          <a href="mailto:arunimpandey2903@hotmail.com">arunimpandey2903@hotmail.com</a>
        </div>
      </div>
    </div>
    <div className="cc-blog-footer-bottom">
      © 2026 Cloud Canvas Designer · Built By{' '}
      <a href="https://arunimitcaffe.gumroad.com/" target="_blank" rel="noopener noreferrer">Arunim&apos;s IT Café</a>
    </div>
  </footer>
);
