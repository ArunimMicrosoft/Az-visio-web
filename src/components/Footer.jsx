import React from 'react';
import './Footer.css';

const appVersion = import.meta.env.VITE_APP_VERSION || '0.0.0';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <span className="footer-copyright">
          © {new Date().getFullYear()} Azure Architecture Designer v{appVersion}
        </span>
        <span className="footer-divider">|</span>
        <span className="footer-author">
          Built by: <strong>Arunim Pandey</strong>
        </span>
        <span className="footer-divider">|</span>
        <span className="footer-suggestions">
          Suggestions: <a href="mailto:arunimpandey2903@hotmail.com">arunimpandey2903@hotmail.com</a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
