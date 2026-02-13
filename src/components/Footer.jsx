import React from 'react';
import './Footer.css';

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
      </div>
    </footer>
  );
};

export default Footer;
