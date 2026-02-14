import React from 'react';
import './Footer.css';

const APP_VERSION = '1.0.0';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <span className="footer-copyright">
          © {new Date().getFullYear()} Azure Architecture Designer
        </span>
        <span className="footer-divider">|</span>
        <span className="footer-author">
          Built by: <strong>Arunim Pandey</strong>
        </span>
        <span className="footer-divider">|</span>
        <span className="footer-suggestions">
          Suggestions: <a href="mailto:arunimpandey2903@hotmail.com" className="footer-email">arunimpandey2903@hotmail.com</a>
        </span>
        <span className="footer-divider">|</span>
        <span className="footer-version">v{APP_VERSION}</span>
      </div>
    </footer>
  );
};

export default Footer;
