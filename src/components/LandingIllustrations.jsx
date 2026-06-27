// Landing page SVG illustrations — pure inline SVG, no external assets, themeable.
// Uses the Cloud Canvas color palette and shows what the app actually does visually.

import React from 'react';

// =============================================================
// HERO ILLUSTRATION
// A stylized "app preview" — browser frame with a diagram inside,
// surrounded by orbiting Azure-service-style icons. Animated.
// =============================================================
export const HeroIllustration = () => (
  <div className="hero-illustration-wrap" aria-hidden="true">
    <svg
      viewBox="0 0 720 520"
      xmlns="http://www.w3.org/2000/svg"
      className="hero-illustration"
      role="img"
      aria-label="Cloud Canvas app preview"
    >
      <defs>
        <linearGradient id="windowBg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f1f5f9" />
        </linearGradient>
        <linearGradient id="nodeBlue" x1="0" x2="1">
          <stop offset="0" stopColor="#0078D4" />
          <stop offset="1" stopColor="#50E6FF" />
        </linearGradient>
        <linearGradient id="nodeGreen" x1="0" x2="1">
          <stop offset="0" stopColor="#10b981" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="nodeOrange" x1="0" x2="1">
          <stop offset="0" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#ef4444" />
        </linearGradient>
        <linearGradient id="nodePurple" x1="0" x2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0f172a" floodOpacity="0.25" />
        </filter>
        <marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#94a3b8" />
        </marker>
      </defs>

      {/* Background glow blobs */}
      <ellipse cx="120" cy="80" rx="180" ry="120" fill="#06b6d4" opacity="0.12" />
      <ellipse cx="600" cy="440" rx="200" ry="140" fill="#8b5cf6" opacity="0.15" />
      <ellipse cx="640" cy="100" rx="120" ry="90" fill="#f59e0b" opacity="0.10" />

      {/* Floating Azure-service icons orbiting the app window */}
      <g className="hero-orbit">
        <g transform="translate(40,160)" className="float-1">
          <rect width="64" height="64" rx="14" fill="url(#nodeBlue)" filter="url(#shadow)" />
          <text x="32" y="42" textAnchor="middle" fontSize="28">⚡</text>
        </g>
        <g transform="translate(620,170)" className="float-2">
          <rect width="64" height="64" rx="14" fill="url(#nodeGreen)" filter="url(#shadow)" />
          <text x="32" y="42" textAnchor="middle" fontSize="28">☸️</text>
        </g>
        <g transform="translate(60,400)" className="float-3">
          <rect width="64" height="64" rx="14" fill="url(#nodeOrange)" filter="url(#shadow)" />
          <text x="32" y="42" textAnchor="middle" fontSize="28">🗄️</text>
        </g>
        <g transform="translate(620,380)" className="float-1">
          <rect width="64" height="64" rx="14" fill="url(#nodePurple)" filter="url(#shadow)" />
          <text x="32" y="42" textAnchor="middle" fontSize="28">🔐</text>
        </g>
      </g>

      {/* Main app window */}
      <g filter="url(#shadow)">
        <rect x="120" y="60" width="480" height="400" rx="16" fill="url(#windowBg)" />
        {/* Title bar */}
        <rect x="120" y="60" width="480" height="38" rx="16" fill="#0f172a" />
        <rect x="120" y="80" width="480" height="18" fill="#0f172a" />
        <circle cx="142" cy="79" r="6" fill="#ef4444" />
        <circle cx="162" cy="79" r="6" fill="#f59e0b" />
        <circle cx="182" cy="79" r="6" fill="#10b981" />
        <rect x="220" y="69" width="200" height="20" rx="6" fill="#1e293b" />
        <text x="320" y="84" textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="Segoe UI">cloudcanvas.co/app</text>

        {/* Canvas grid */}
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
        </pattern>
        <rect x="120" y="98" width="480" height="362" fill="url(#grid)" />

        {/* Subscription boundary */}
        <rect x="145" y="120" width="430" height="320" rx="12" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="6 4" />
        <text x="155" y="138" fill="#8b5cf6" fontSize="11" fontWeight="700" fontFamily="Segoe UI">SUBSCRIPTION · prod-east</text>

        {/* Resource Group boundary */}
        <rect x="170" y="155" width="380" height="265" rx="10" fill="none" stroke="#0891b2" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="180" y="172" fill="#0891b2" fontSize="10" fontWeight="700" fontFamily="Segoe UI">RG · rg-web-prod</text>

        {/* Diagram nodes */}
        <g>
          {/* Front Door */}
          <rect x="200" y="190" width="80" height="60" rx="10" fill="url(#nodeBlue)" filter="url(#shadow)" />
          <text x="240" y="218" textAnchor="middle" fontSize="22">🌐</text>
          <text x="240" y="238" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="Segoe UI">Front Door</text>

          {/* App Service */}
          <rect x="320" y="190" width="80" height="60" rx="10" fill="url(#nodeGreen)" filter="url(#shadow)" />
          <text x="360" y="218" textAnchor="middle" fontSize="22">🚀</text>
          <text x="360" y="238" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="Segoe UI">App Service</text>

          {/* Function */}
          <rect x="440" y="190" width="80" height="60" rx="10" fill="url(#nodeOrange)" filter="url(#shadow)" />
          <text x="480" y="218" textAnchor="middle" fontSize="22">⚡</text>
          <text x="480" y="238" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="Segoe UI">Function</text>

          {/* SQL */}
          <rect x="240" y="320" width="80" height="60" rx="10" fill="url(#nodeBlue)" filter="url(#shadow)" />
          <text x="280" y="348" textAnchor="middle" fontSize="22">🗄️</text>
          <text x="280" y="368" textAnchor="middle" fill="#fff" font-size="9" fontWeight="700" fontFamily="Segoe UI">Azure SQL</text>

          {/* Cosmos DB */}
          <rect x="340" y="320" width="80" height="60" rx="10" fill="url(#nodePurple)" filter="url(#shadow)" />
          <text x="380" y="348" textAnchor="middle" fontSize="22">🌍</text>
          <text x="380" y="368" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="Segoe UI">Cosmos DB</text>

          {/* Key Vault */}
          <rect x="440" y="320" width="80" height="60" rx="10" fill="url(#nodePurple)" filter="url(#shadow)" />
          <text x="480" y="348" textAnchor="middle" fontSize="22">🔐</text>
          <text x="480" y="368" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="Segoe UI">Key Vault</text>
        </g>

        {/* Connection lines */}
        <g stroke="#94a3b8" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)">
          <path d="M 280 250 L 320 220" />
          <path d="M 400 220 L 440 220" />
          <path d="M 360 250 L 280 320" />
          <path d="M 360 250 L 380 320" />
          <path d="M 480 250 L 480 320" />
        </g>

        {/* Cost badge */}
        <g transform="translate(450, 130)">
          <rect width="115" height="22" rx="11" fill="#10b981" />
          <text x="57" y="15" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="Segoe UI">$237/mo · WAF: 95</text>
        </g>
      </g>
    </svg>
  </div>
);

// =============================================================
// FEATURE CARD ILLUSTRATIONS
// Small SVG visuals for each feature card.
// =============================================================
export const FeatureDragDrop = () => (
  <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" className="feature-illustration">
    <defs>
      <linearGradient id="fdd1" x1="0" x2="1"><stop offset="0" stopColor="#0078D4" /><stop offset="1" stopColor="#50E6FF" /></linearGradient>
    </defs>
    <rect width="200" height="130" rx="12" fill="#eff6ff" />
    <rect x="20" y="20" width="50" height="40" rx="8" fill="url(#fdd1)" />
    <rect x="80" y="60" width="50" height="40" rx="8" fill="url(#fdd1)" opacity="0.4" strokeDasharray="4 4" stroke="#0078D4" />
    <path d="M70 40 L80 60" stroke="#0078D4" strokeWidth="2" strokeDasharray="3 3" />
    <circle cx="80" cy="60" r="5" fill="#10b981" />
    <text x="100" y="120" textAnchor="middle" fontSize="10" fill="#475569" fontFamily="Segoe UI">Drag · Drop · Connect</text>
  </svg>
);

export const FeatureWAF = () => (
  <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" className="feature-illustration">
    <rect width="200" height="130" rx="12" fill="#fef3c7" />
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i} transform={`translate(${20 + i * 32}, 30)`}>
        <rect width="24" height="70" rx="5" fill={['#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#0078D4'][i]} />
        <circle cx="12" cy="12" r="9" fill="#fff" opacity="0.95" />
        <text x="12" y="16" textAnchor="middle" fontSize="11">{['🛡️', '🔐', '💸', '⚙️', '⚡'][i]}</text>
      </g>
    ))}
    <text x="100" y="120" textAnchor="middle" fontSize="10" fill="#92400e" fontWeight="700" fontFamily="Segoe UI">5 Pillars · Validated Live</text>
  </svg>
);

export const FeatureIaC = () => (
  <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" className="feature-illustration">
    <rect width="200" height="130" rx="12" fill="#1e293b" />
    <text x="14" y="34" fontSize="9" fill="#64748b" fontFamily="Consolas, monospace">resource &quot;azurerm_app_service&quot; &quot;web&quot; {'{'}</text>
    <text x="22" y="50" fontSize="9" fill="#50E6FF" fontFamily="Consolas, monospace">name = &quot;app-prod&quot;</text>
    <text x="22" y="64" fontSize="9" fill="#50E6FF" fontFamily="Consolas, monospace">location = &quot;eastus&quot;</text>
    <text x="22" y="78" fontSize="9" fill="#fbbf24" fontFamily="Consolas, monospace">sku_name = &quot;P1v3&quot;</text>
    <text x="14" y="92" fontSize="9" fill="#64748b" fontFamily="Consolas, monospace">{'}'}</text>
    <rect x="130" y="14" width="55" height="22" rx="11" fill="#10b981" />
    <text x="157" y="29" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700" fontFamily="Segoe UI">Terraform</text>
    <text x="100" y="118" textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="Segoe UI">Terraform · Bicep · ARM</text>
  </svg>
);

export const FeatureCost = () => (
  <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" className="feature-illustration">
    <rect width="200" height="130" rx="12" fill="#ecfdf5" />
    <polyline points="20,90 50,75 80,82 110,55 140,45 175,30" fill="none" stroke="#10b981" strokeWidth="3" />
    {[
      [20, 90], [50, 75], [80, 82], [110, 55], [140, 45], [175, 30],
    ].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill="#10b981" />)}
    <text x="20" y="20" fontSize="11" fill="#065f46" fontWeight="700" fontFamily="Segoe UI">💰 $4,820/mo</text>
    <text x="20" y="118" fontSize="10" fill="#065f46" fontFamily="Segoe UI">Live Azure pricing · 30+ regions</text>
  </svg>
);

export const FeatureExport = () => (
  <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" className="feature-illustration">
    <rect width="200" height="130" rx="12" fill="#fdf2f8" />
    {['PNG', 'PDF', 'TF', 'BICEP', 'ARM', 'JSON'].map((fmt, i) => (
      <g key={fmt} transform={`translate(${15 + (i % 3) * 60}, ${25 + Math.floor(i / 3) * 45})`}>
        <rect width="50" height="32" rx="8" fill={['#0078D4', '#ef4444', '#8b5cf6', '#10b981', '#f59e0b', '#0891b2'][i]} />
        <text x="25" y="20" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="700" fontFamily="Segoe UI">{fmt}</text>
      </g>
    ))}
    <text x="100" y="123" textAnchor="middle" fontSize="9" fill="#831843" fontFamily="Segoe UI">6 formats · One click</text>
  </svg>
);

export const FeatureSecurity = () => (
  <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" className="feature-illustration">
    <defs>
      <linearGradient id="shieldG" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#ec4899" /><stop offset="1" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <rect width="200" height="130" rx="12" fill="#faf5ff" />
    <path d="M100 20 L140 35 L140 75 Q140 95 100 110 Q60 95 60 75 L60 35 Z" fill="url(#shieldG)" />
    <path d="M82 70 L95 83 L118 58" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <text x="100" y="123" textAnchor="middle" fontSize="10" fill="#581c87" fontWeight="700" fontFamily="Segoe UI">Enterprise · MFA · Audit</text>
  </svg>
);

// =============================================================
// HOW IT WORKS — three numbered illustrated steps
// =============================================================
export const HowItWorksIllustration = () => (
  <div className="how-it-works-strip" aria-hidden="true">
    <svg viewBox="0 0 1000 220" xmlns="http://www.w3.org/2000/svg" className="hiw-svg">
      <defs>
        <linearGradient id="hiw1" x1="0" x2="1"><stop offset="0" stopColor="#6366f1" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient>
        <linearGradient id="hiw2" x1="0" x2="1"><stop offset="0" stopColor="#0891b2" /><stop offset="1" stopColor="#06b6d4" /></linearGradient>
        <linearGradient id="hiw3" x1="0" x2="1"><stop offset="0" stopColor="#10b981" /><stop offset="1" stopColor="#059669" /></linearGradient>
      </defs>

      {/* Step 1 */}
      <g transform="translate(60, 30)">
        <circle r="40" cx="40" cy="40" fill="url(#hiw1)" />
        <text x="40" y="52" textAnchor="middle" fontSize="32">🎨</text>
        <text x="40" y="105" textAnchor="middle" fontSize="14" fontWeight="800" fill="#0f172a" fontFamily="Segoe UI">1. Design</text>
        <text x="40" y="125" textAnchor="middle" fontSize="11" fill="#475569" fontFamily="Segoe UI">Drag · Drop · Connect</text>
        <text x="40" y="142" textAnchor="middle" fontSize="11" fill="#475569" fontFamily="Segoe UI">700+ Azure icons</text>
      </g>

      {/* Connector 1 → 2 */}
      <path d="M180 70 Q280 30 380 70" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="6 4" fill="none" />
      <polygon points="378,64 392,70 378,76" fill="#cbd5e1" />

      {/* Step 2 */}
      <g transform="translate(400, 30)">
        <circle r="40" cx="40" cy="40" fill="url(#hiw2)" />
        <text x="40" y="52" textAnchor="middle" fontSize="32">🛡️</text>
        <text x="40" y="105" textAnchor="middle" fontSize="14" fontWeight="800" fill="#0f172a" fontFamily="Segoe UI">2. Validate</text>
        <text x="40" y="125" textAnchor="middle" fontSize="11" fill="#475569" fontFamily="Segoe UI">WAF score live</text>
        <text x="40" y="142" textAnchor="middle" fontSize="11" fill="#475569" fontFamily="Segoe UI">Cost estimate live</text>
      </g>

      {/* Connector 2 → 3 */}
      <path d="M520 70 Q620 30 720 70" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="6 4" fill="none" />
      <polygon points="718,64 732,70 718,76" fill="#cbd5e1" />

      {/* Step 3 */}
      <g transform="translate(740, 30)">
        <circle r="40" cx="40" cy="40" fill="url(#hiw3)" />
        <text x="40" y="52" textAnchor="middle" fontSize="32">🚀</text>
        <text x="40" y="105" textAnchor="middle" fontSize="14" fontWeight="800" fill="#0f172a" fontFamily="Segoe UI">3. Export</text>
        <text x="40" y="125" textAnchor="middle" fontSize="11" fill="#475569" fontFamily="Segoe UI">Terraform · Bicep</text>
        <text x="40" y="142" textAnchor="middle" fontSize="11" fill="#475569" fontFamily="Segoe UI">ARM · PDF · PNG</text>
      </g>
    </svg>
  </div>
);

// =============================================================
// AZURE SERVICES MOSAIC
// A grid of pulsing service tiles to visualize 700+ icons.
// =============================================================
export const ServiceMosaic = () => {
  const tiles = [
    { icon: '☸️', label: 'AKS', g: '#0078D4' },
    { icon: '🚀', label: 'App Service', g: '#0891b2' },
    { icon: '⚡', label: 'Functions', g: '#f59e0b' },
    { icon: '🗄️', label: 'SQL', g: '#1d4ed8' },
    { icon: '🌍', label: 'Cosmos', g: '#8b5cf6' },
    { icon: '🔐', label: 'Key Vault', g: '#ec4899' },
    { icon: '🌐', label: 'Front Door', g: '#0078D4' },
    { icon: '🔥', label: 'Firewall', g: '#ef4444' },
    { icon: '📡', label: 'IoT Hub', g: '#10b981' },
    { icon: '🧠', label: 'OpenAI', g: '#6366f1' },
    { icon: '📊', label: 'Monitor', g: '#0891b2' },
    { icon: '💾', label: 'Storage', g: '#1e3a8a' },
  ];
  return (
    <div className="service-mosaic" aria-hidden="true">
      {tiles.map((t, i) => (
        <div key={i} className="mosaic-tile" style={{ background: t.g }}>
          <div className="mosaic-icon">{t.icon}</div>
          <div className="mosaic-label">{t.label}</div>
        </div>
      ))}
      <div className="mosaic-tile mosaic-more">
        <div className="mosaic-icon">+</div>
        <div className="mosaic-label">688 more</div>
      </div>
    </div>
  );
};
