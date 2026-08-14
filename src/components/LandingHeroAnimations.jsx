// Landing-page hero animations — pure SVG + CSS, no dependencies.
// Two components, each a self-contained "product demo in a box":
//   1) ValidateAnimation      — a canvas with services + a WAF scanner sweep
//   2) CodeConvertAnimation   — services on the left, Terraform typing on the right
//
// Both loop forever, respect `prefers-reduced-motion`, and use only inline
// SVG/CSS so they render instantly without hitting any font or JS bundle.

import React from 'react';
import './LandingHeroAnimations.css';

// ============================================================
// 1. VALIDATE ANIMATION
// ============================================================
export function ValidateAnimation() {
  return (
    <div className="va-root" aria-label="Live WAF validation demo">
      <div className="va-topbar">
        <div className="va-dots">
          <span /> <span /> <span />
        </div>
        <span className="va-file">architecture.canvas · Live WAF check</span>
        <span className="va-badge-live">
          <span className="va-live-dot" /> LIVE
        </span>
      </div>

      <div className="va-stage">
        {/* Canvas panel */}
        <div className="va-canvas">
          <svg viewBox="0 0 460 300" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="vaGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.6" />
              </pattern>
              <linearGradient id="vaScanGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#50E6FF" stopOpacity="0" />
                <stop offset="0.5" stopColor="#50E6FF" stopOpacity="0.85" />
                <stop offset="1" stopColor="#50E6FF" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="vaSvcOk" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#22c55e" />
                <stop offset="1" stopColor="#16a34a" />
              </linearGradient>
              <linearGradient id="vaSvcWarn" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f59e0b" />
                <stop offset="1" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="vaSvcAzure" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#0078D4" />
                <stop offset="1" stopColor="#0091EA" />
              </linearGradient>
            </defs>
            <rect width="460" height="300" fill="#f8fafc" />
            <rect width="460" height="300" fill="url(#vaGrid)" />

            {/* Connection lines drawn BEHIND services */}
            <g className="va-conns">
              <line x1="90"  y1="70"  x2="230" y2="70"  className="va-conn" />
              <line x1="230" y1="70"  x2="370" y2="70"  className="va-conn" />
              <line x1="230" y1="90"  x2="230" y2="170" className="va-conn" />
              <line x1="230" y1="200" x2="90"  y2="230" className="va-conn" />
              <line x1="230" y1="200" x2="370" y2="230" className="va-conn" />
            </g>

            {/* Services — each has its own delay for staged validation glow */}
            {[
              { x: 40,  y: 40,  icon: '🌐', label: 'Front Door',  id: 1 },
              { x: 180, y: 40,  icon: '🛡️', label: 'WAF',         id: 2 },
              { x: 320, y: 40,  icon: '🖥️', label: 'App Service', id: 3 },
              { x: 180, y: 170, icon: '🗃️', label: 'SQL',         id: 4 },
              { x: 40,  y: 200, icon: '💾', label: 'Storage',     id: 5 },
              { x: 320, y: 200, icon: '🔐', label: 'Key Vault',   id: 6 },
            ].map((s) => (
              <g key={s.id} className="va-svc" style={{ '--svc-i': s.id }}>
                <rect x={s.x} y={s.y} width="100" height="60" rx="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.4" />
                <rect x={s.x} y={s.y} width="100" height="60" rx="10" className="va-svc-fill" />
                <text x={s.x + 15} y={s.y + 35} className="va-svc-icon">{s.icon}</text>
                <text x={s.x + 40} y={s.y + 26} className="va-svc-label">{s.label}</text>
                <text x={s.x + 40} y={s.y + 44} className="va-svc-status" data-idx={s.id}>Checking…</text>
                {/* Result mark: check/warning/etc — cycles via CSS */}
                <text x={s.x + 88} y={s.y + 16} className="va-svc-mark" data-idx={s.id}>✓</text>
              </g>
            ))}

            {/* Scanning laser line */}
            <rect x="-4" y="0" width="8" height="300" fill="url(#vaScanGrad)" className="va-scanline" />
          </svg>

          {/* Callouts that pop as the scanner finds things */}
          <div className="va-callout va-callout-1">
            <span className="va-callout-tag va-tag-warn">! Warning</span>
            Storage public access — remediating
          </div>
          <div className="va-callout va-callout-2">
            <span className="va-callout-tag va-tag-ok">✓ Fixed</span>
            Private endpoint added
          </div>
        </div>

        {/* Score panel */}
        <aside className="va-report">
          <div className="va-score-block">
            <div className="va-score-label">WAF Score</div>
            <div className="va-score-num">
              <span className="va-num va-num-first">0</span>
              <span className="va-num va-num-mid">62</span>
              <span className="va-num va-num-final">95</span>
            </div>
            <div className="va-score-status">Well-architected</div>
          </div>

          <ul className="va-pillars">
            {[
              { label: 'Reliability',     v: 94 },
              { label: 'Security',        v: 98 },
              { label: 'Cost',            v: 92 },
              { label: 'Operations',      v: 95 },
              { label: 'Performance',     v: 97 },
            ].map((p, i) => (
              <li key={p.label} className="va-pillar" style={{ '--p-i': i + 1 }}>
                <div className="va-pillar-row">
                  <span className="va-pillar-name">{p.label}</span>
                  <span className="va-pillar-val">{p.v}</span>
                </div>
                <div className="va-pillar-bar"><span style={{ width: `${p.v}%` }} /></div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

// ============================================================
// 2. CODE CONVERT ANIMATION
// ============================================================
export function CodeConvertAnimation() {
  return (
    <div className="cc-root" aria-label="Diagram-to-Terraform code demo">
      <div className="cc-topbar">
        <div className="cc-dots">
          <span /> <span /> <span />
        </div>
        <span className="cc-file">Diagram → main.tf · One-click export</span>
        <span className="cc-badge-live">
          <span className="cc-live-dot" /> AUTO
        </span>
      </div>

      <div className="cc-stage">
        {/* Left: services */}
        <div className="cc-left">
          {[
            { icon: '🌐', name: 'Front Door',      sub: 'Global entry' },
            { icon: '🖥️', name: 'App Service',     sub: 'Prod / East US 2' },
            { icon: '🗃️', name: 'SQL Database',    sub: 'Zone-redundant' },
            { icon: '🔐', name: 'Key Vault',       sub: 'HSM + soft-delete' },
          ].map((s, i) => (
            <div key={s.name} className="cc-tile" style={{ '--tile-i': i + 1 }}>
              <span className="cc-tile-icon">{s.icon}</span>
              <div className="cc-tile-meta">
                <span className="cc-tile-name">{s.name}</span>
                <span className="cc-tile-sub">{s.sub}</span>
              </div>
              <span className="cc-tile-glow" />
            </div>
          ))}
        </div>

        {/* Arrow */}
        <div className="cc-arrow">
          <svg viewBox="0 0 60 40" width="60" height="40">
            <defs>
              <linearGradient id="ccArrow" x1="0" x2="1">
                <stop offset="0" stopColor="#0078D4" />
                <stop offset="1" stopColor="#50E6FF" />
              </linearGradient>
            </defs>
            <path d="M0 20 L48 20" stroke="url(#ccArrow)" strokeWidth="3" strokeLinecap="round" />
            <path d="M40 10 L52 20 L40 30" fill="none" stroke="url(#ccArrow)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Right: terminal with typing code */}
        <div className="cc-terminal">
          <div className="cc-terminal-bar">
            <span className="cc-t-dot cc-red" />
            <span className="cc-t-dot cc-amber" />
            <span className="cc-t-dot cc-green" />
            <span className="cc-t-file">main.tf</span>
          </div>
          <pre className="cc-code">
{[
`resource "azurerm_frontdoor" "main" {`,
`  name                = "fd-prod-cc"`,
`  resource_group_name = azurerm_resource_group.main.name`,
`}`,
`resource "azurerm_app_service" "web" {`,
`  name                = "app-prod-eastus2"`,
`  location            = "East US 2"`,
`  app_service_plan_id = azurerm_app_service_plan.p.id`,
`  https_only          = true`,
`}`,
`resource "azurerm_mssql_database" "sql" {`,
`  name         = "sqldb-prod"`,
`  server_id    = azurerm_mssql_server.s.id`,
`  zone_redundant = true`,
`  sku_name     = "S1"`,
`}`,
`resource "azurerm_key_vault" "kv" {`,
`  name                = "kv-prod-eastus2"`,
`  sku_name            = "premium"`,
`  purge_protection_enabled = true`,
`}`,
].map((line, i) => (
  <span key={i} className="cc-line" style={{ '--line-i': i + 1 }}>
    <span className="cc-lineno">{String(i + 1).padStart(2, ' ')}</span>
    <span className="cc-linetext">{line}</span>
  </span>
))}
          </pre>
        </div>
      </div>

      <div className="cc-formats">
        <span>Export formats:</span>
        <span className="cc-chip cc-chip-active">Terraform</span>
        <span className="cc-chip">Bicep</span>
        <span className="cc-chip">ARM</span>
        <span className="cc-chip">PNG</span>
        <span className="cc-chip">PDF</span>
      </div>
    </div>
  );
}
