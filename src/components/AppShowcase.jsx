// AppShowcase — "See it in action" section showcasing real product screenshots
// Three alternating panels (zigzag): description left, screenshot right; then flip.

import React from 'react';
import { Link } from 'react-router-dom';
import './AppShowcase.css';

const showcases = [
  {
    image: '/screenshots/canvas-boundaries.png',
    alt: 'Cloud Canvas Designer — drag-and-drop canvas with nested subscription, resource group, virtual network, and subnet boundaries containing VMs, disks, and NSGs with live cost labels',
    badge: '🎨 CANVAS',
    title: 'Drag, Drop, Group — Just Like Real Azure',
    sub: 'Build hub-spoke, multi-tier, or landing-zone diagrams with proper nesting',
    bullets: [
      'Nested boundaries — Subscription → RG → VNet → Subnet',
      'Live per-resource cost labels ($10.87/mo shown on each link)',
      '700+ official Azure service icons in 22 categories',
      'Smart connection routing with auto-layout',
      'Zoom, pan, multi-select like a CAD tool',
    ],
  },
  {
    image: '/screenshots/validation-summary.png',
    alt: 'Architecture Validation Report dialog showing a score of 80/B grade with "Ready for Deployment" status, 6 services, 0 errors, 4 warnings, and 2 tips',
    badge: '✅ VALIDATE',
    title: 'Know if Your Architecture Will Actually Deploy',
    sub: 'One-click validation against deployment best practices',
    bullets: [
      'Overall deployment readiness score (0-100)',
      'Errors block deployment · Warnings suggest improvements · Tips optimize',
      'Per-service health checks (region availability, dependencies, sizing)',
      'Letter grade (A/B/C/D/F) for stakeholder-friendly reporting',
      '"Proceed to Export" only when score is green',
    ],
    flip: true,
  },
  {
    image: '/screenshots/waf-score.png',
    alt: 'Azure Well-Architected Framework Score showing 42 overall across 5 pillars — Reliability 40 with recommendations to add Load Balancer, and Security 45 with missing Key Vault flagged',
    badge: '🏛️ WAF SCORE',
    title: 'Auto-Scored Against Microsoft\'s 5 Pillars',
    sub: 'Every diagram is validated against Reliability, Security, Cost, Operations, Performance',
    bullets: [
      'Per-pillar score with letter grade',
      'Actionable fixes ("Add Load Balancer", "Missing Key Vault")',
      'Detects single points of failure, missing redundancy',
      'Detects missing security (Key Vault, Firewall, Private Endpoints)',
      'Direct links to Microsoft WAF documentation',
    ],
  },
];

const AppShowcase = () => (
  <section className="app-showcase">
    <div className="showcase-container">
      <div className="showcase-header">
        <span className="showcase-badge">📸 See It In Action</span>
        <h2 className="showcase-title">
          What Cloud Canvas Designer Actually <span className="showcase-title-grad">Looks Like</span>
        </h2>
        <p className="showcase-sub">
          Not stock photos. Not marketing renders. Screenshots from the live product.
        </p>
      </div>

      {showcases.map((s, i) => (
        <div key={i} className={`showcase-row ${s.flip ? 'flip' : ''}`}>
          <div className="showcase-copy">
            <span className="showcase-row-badge">{s.badge}</span>
            <h3 className="showcase-row-title">{s.title}</h3>
            <p className="showcase-row-sub">{s.sub}</p>
            <ul className="showcase-bullets">
              {s.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
            {i === showcases.length - 1 && (
              <Link to="/signup" className="showcase-cta">
                Try it free for 7 days →
              </Link>
            )}
          </div>

          <div className="showcase-image-wrap">
            <div className="browser-frame">
              <div className="browser-bar">
                <span className="browser-dot dot-red" />
                <span className="browser-dot dot-yellow" />
                <span className="browser-dot dot-green" />
                <span className="browser-url">cloudcanvas.co/app</span>
              </div>
              <img
                src={s.image}
                alt={s.alt}
                className="showcase-image"
                loading="lazy"
                width="1024"
                height="600"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default AppShowcase;
