// Shared header/footer for Terms and Privacy pages
import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPage.css';

export const LegalHeader = () => (
  <header className="legal-topnav">
    <Link to="/" className="legal-brand">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#0078D4" />
        <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="#50E6FF" />
      </svg>
      <span className="legal-brand-name">Cloud Canvas Designer</span>
    </Link>
    <nav className="legal-nav-links">
      <Link to="/">Home</Link>
      <Link to="/blog">Learn</Link>
      <Link to="/terms">Terms</Link>
      <Link to="/privacy">Privacy</Link>
      <Link to="/signup">Sign Up</Link>
    </nav>
  </header>
);

export const LegalFooter = () => (
  <footer className="legal-footer">
    © {new Date().getFullYear()} Cloud Canvas Designer · Built by{' '}
    <a href="https://arunimitcaffe.gumroad.com/" target="_blank" rel="noopener noreferrer">
      Arunim&apos;s IT Café
    </a>
    {' · '}
    <Link to="/terms">Terms</Link>{' · '}
    <Link to="/privacy">Privacy</Link>{' · '}
    <a href="mailto:arunimpandey2903@hotmail.com">Contact</a>
  </footer>
);
