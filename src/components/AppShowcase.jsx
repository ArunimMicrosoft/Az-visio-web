// AppShowcase — "See it in action" section showcasing real product screenshots.
// Now animated:
//   - Each row slides up on scroll-into-view (IntersectionObserver)
//   - Screenshots have floating annotation chips that pulse in/out
//   - Browser frame gently floats + tilts on hover
//   - Bullet list items stagger-fade in when the row enters view

import React, { useEffect, useRef, useState } from 'react';
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
    // {x, y, label, tone}. x/y are % of the image (0-100). Tone: azure|amber|emerald|violet
    annotations: [
      { x: 18, y: 22, label: '📦 Nested Resource Groups', tone: 'azure',  delay: 0 },
      { x: 68, y: 30, label: '🔷 VNet · Subnet',            tone: 'emerald', delay: 1.2 },
      { x: 32, y: 78, label: '💰 $10.87 / mo',                tone: 'amber',  delay: 2.4 },
      { x: 78, y: 68, label: '🖱️ Drag from 700+ icons',      tone: 'violet', delay: 3.6 },
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
    annotations: [
      { x: 22, y: 24, label: '📊 Score 80 / B',              tone: 'azure',   delay: 0 },
      { x: 72, y: 20, label: '✅ Ready to Deploy',            tone: 'emerald', delay: 1.2 },
      { x: 30, y: 74, label: '🚫 0 blocking errors',          tone: 'emerald', delay: 2.4 },
      { x: 74, y: 66, label: '💡 2 actionable tips',          tone: 'amber',  delay: 3.6 },
    ],
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
    annotations: [
      { x: 20, y: 20, label: '🏛️ 5 WAF Pillars',           tone: 'violet', delay: 0 },
      { x: 74, y: 26, label: '🎯 Fix: Add Load Balancer', tone: 'amber',  delay: 1.2 },
      { x: 30, y: 72, label: '🔒 Missing Key Vault',      tone: 'rose',   delay: 2.4 },
      { x: 72, y: 78, label: '📖 Microsoft WAF docs →',    tone: 'azure',  delay: 3.6 },
    ],
  },
];

// Hook — sets `inView = true` once when the element enters the viewport,
// then stops observing (fade-in is one-shot).
function useOnScreen(rootMargin = '0px 0px -100px 0px') {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current || inView) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin, threshold: 0.15 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [rootMargin, inView]);
  return [ref, inView];
}

// One showcase row — encapsulated so we can attach the useOnScreen hook.
const ShowcaseRow = ({ data, isLast }) => {
  const [ref, inView] = useOnScreen();
  return (
    <div
      ref={ref}
      className={`showcase-row ${data.flip ? 'flip' : ''} ${inView ? 'is-in-view' : ''}`}
    >
      <div className="showcase-copy">
        <span className="showcase-row-badge">{data.badge}</span>
        <h3 className="showcase-row-title">{data.title}</h3>
        <p className="showcase-row-sub">{data.sub}</p>
        <ul className="showcase-bullets">
          {data.bullets.map((b, j) => (
            <li key={j} style={{ '--bullet-i': j + 1 }}>{b}</li>
          ))}
        </ul>
        {isLast && (
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

          {/* Screenshot */}
          <img
            src={data.image}
            alt={data.alt}
            className="showcase-image"
            loading="lazy"
            width="1024"
            height="600"
          />

          {/* Floating annotation chips — pulse in/out cycling */}
          {inView && (
            <div className="showcase-annotations" aria-hidden="true">
              {(data.annotations || []).map((a, k) => (
                <span
                  key={k}
                  className={`showcase-chip showcase-chip-${a.tone}`}
                  style={{
                    left: `${a.x}%`,
                    top: `${a.y}%`,
                    animationDelay: `${a.delay}s`,
                  }}
                >
                  {a.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AppShowcase = () => (
  <section className="app-showcase">
    <div className="showcase-container">
      <div className="showcase-header">
        <span className="showcase-badge">📸 See It In Action</span>
        <h2 className="showcase-title">
          What Cloud Canvas Designer Actually <span className="showcase-title-grad">Looks Like</span>
        </h2>
        <p className="showcase-sub">
          Not stock photos. Not marketing renders. Screenshots from the live product — with live annotations.
        </p>
      </div>

      {showcases.map((s, i) => (
        <ShowcaseRow key={i} data={s} isLast={i === showcases.length - 1} />
      ))}
    </div>
  </section>
);

export default AppShowcase;
