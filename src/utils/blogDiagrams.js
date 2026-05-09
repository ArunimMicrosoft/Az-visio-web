// Inline SVG architecture diagrams used inside blog articles.
// Each diagram is a plain SVG string that renders inside a fenced ```svg block.
// Colors follow the Cloud Canvas Designer palette.

// Shared palette helpers
const COLORS = {
  azure: '#0078D4',
  cyan: '#50E6FF',
  navy: '#0f172a',
  indigo: '#6366f1',
  purple: '#8b5cf6',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#ec4899',
  red: '#ef4444',
  slate: '#475569',
  mist: '#e2e8f0',
};

// Hub-spoke topology
export const hubSpokeSvg = `
<svg viewBox="0 0 820 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Hub-spoke network topology">
  <defs>
    <linearGradient id="hubGrad" x1="0" x2="1">
      <stop offset="0" stop-color="${COLORS.azure}"/><stop offset="1" stop-color="${COLORS.cyan}"/>
    </linearGradient>
    <linearGradient id="spokeGrad" x1="0" x2="1">
      <stop offset="0" stop-color="${COLORS.indigo}"/><stop offset="1" stop-color="${COLORS.purple}"/>
    </linearGradient>
    <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="${COLORS.slate}"/>
    </marker>
  </defs>
  <rect width="820" height="420" fill="#f8fafc" rx="14"/>
  <!-- Hub -->
  <g>
    <rect x="330" y="150" width="160" height="120" rx="14" fill="url(#hubGrad)"/>
    <text x="410" y="190" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="14" font-weight="700">HUB VNet</text>
    <text x="410" y="210" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">10.0.0.0/16</text>
    <text x="410" y="232" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">🔥 Firewall · 🌐 Gateway</text>
    <text x="410" y="252" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">🧭 DNS · 🛡️ Bastion</text>
  </g>
  <!-- Spokes -->
  <g>
    <rect x="40" y="40"  width="150" height="90" rx="12" fill="url(#spokeGrad)"/>
    <text x="115" y="70" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">Prod Web</text>
    <text x="115" y="90" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">10.1.0.0/16</text>
    <text x="115" y="108" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">App Service · AKS</text>
  </g>
  <g>
    <rect x="630" y="40" width="150" height="90" rx="12" fill="url(#spokeGrad)"/>
    <text x="705" y="70" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">Prod Data</text>
    <text x="705" y="90" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">10.2.0.0/16</text>
    <text x="705" y="108" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">SQL · Cosmos</text>
  </g>
  <g>
    <rect x="40" y="290" width="150" height="90" rx="12" fill="url(#spokeGrad)"/>
    <text x="115" y="320" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">Dev</text>
    <text x="115" y="340" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">10.3.0.0/16</text>
    <text x="115" y="358" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">VMs · Containers</text>
  </g>
  <g>
    <rect x="630" y="290" width="150" height="90" rx="12" fill="url(#spokeGrad)"/>
    <text x="705" y="320" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">Shared Svcs</text>
    <text x="705" y="340" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">10.4.0.0/16</text>
    <text x="705" y="358" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">CI/CD · Monitor</text>
  </g>
  <!-- Peering lines -->
  <g stroke="${COLORS.slate}" stroke-width="2" fill="none">
    <line x1="190" y1="85"  x2="330" y2="180" marker-end="url(#arr)" marker-start="url(#arr)"/>
    <line x1="630" y1="85"  x2="490" y2="180" marker-end="url(#arr)" marker-start="url(#arr)"/>
    <line x1="190" y1="335" x2="330" y2="240" marker-end="url(#arr)" marker-start="url(#arr)"/>
    <line x1="630" y1="335" x2="490" y2="240" marker-end="url(#arr)" marker-start="url(#arr)"/>
  </g>
  <!-- On-prem -->
  <g>
    <rect x="340" y="330" width="140" height="60" rx="10" fill="${COLORS.navy}"/>
    <text x="410" y="358" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🏢 On-Prem</text>
    <text x="410" y="376" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">ExpressRoute / VPN</text>
  </g>
  <line x1="410" y1="270" x2="410" y2="330" stroke="${COLORS.slate}" stroke-width="2" stroke-dasharray="6 4"/>
</svg>
`;

// Zero-trust pillars
export const zeroTrustSvg = `
<svg viewBox="0 0 820 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Zero Trust pillars">
  <defs>
    <linearGradient id="ztBg" x1="0" x2="1">
      <stop offset="0" stop-color="${COLORS.rose}"/><stop offset="1" stop-color="${COLORS.purple}"/>
    </linearGradient>
  </defs>
  <rect width="820" height="340" fill="#f8fafc" rx="14"/>
  <text x="410" y="40" text-anchor="middle" font-family="Segoe UI" font-size="18" font-weight="800" fill="${COLORS.navy}">Zero Trust — Verify Explicitly</text>
  <text x="410" y="62" text-anchor="middle" font-family="Segoe UI" font-size="13" fill="${COLORS.slate}">Identity · Device · Location · Risk → Decision</text>
  ${[
    { x: 40,  icon: '👤', t: 'Identity', s: 'Entra ID · MFA · PIM' },
    { x: 180, icon: '💻', t: 'Device',   s: 'Intune · Compliance' },
    { x: 320, icon: '📱', t: 'Apps',     s: 'SSO · App Proxy' },
    { x: 460, icon: '📦', t: 'Data',     s: 'Purview · DLP' },
    { x: 600, icon: '🏗️', t: 'Infra',   s: 'Defender · JIT' },
    { x: 740, icon: '🌐', t: 'Network',  s: 'Firewall · PE' },
  ].map(p => `
    <g>
      <rect x="${p.x - 6}" y="100" width="75" height="130" rx="14" fill="url(#ztBg)"/>
      <text x="${p.x + 31}" y="140" text-anchor="middle" font-size="28">${p.icon}</text>
      <text x="${p.x + 31}" y="175" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">${p.t}</text>
      <text x="${p.x + 31}" y="196" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="9.5">${p.s}</text>
    </g>
  `).join('')}
  <rect x="40" y="262" width="740" height="52" rx="12" fill="${COLORS.navy}"/>
  <text x="410" y="286" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">Conditional Access Policy Engine</text>
  <text x="410" y="305" text-anchor="middle" fill="#50E6FF" font-family="Segoe UI" font-size="11">Grant · Block · MFA · Require Compliant Device · Session Controls</text>
</svg>
`;

// WAF 5 pillars
export const wafPillarsSvg = `
<svg viewBox="0 0 820 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="WAF 5 Pillars">
  <rect width="820" height="260" fill="#f8fafc" rx="14"/>
  <text x="410" y="36" text-anchor="middle" font-family="Segoe UI" font-size="18" font-weight="800" fill="${COLORS.navy}">Azure Well-Architected Framework</text>
  ${[
    { x: 40,  c: '#10b981', i: '🛡️', t: 'Reliability' },
    { x: 200, c: '#ef4444', i: '🔐', t: 'Security' },
    { x: 360, c: '#f59e0b', i: '💸', t: 'Cost' },
    { x: 520, c: '#8b5cf6', i: '⚙️', t: 'Operations' },
    { x: 680, c: '#0078D4', i: '⚡', t: 'Performance' },
  ].map(p => `
    <g>
      <rect x="${p.x}" y="74" width="100" height="150" rx="14" fill="${p.c}"/>
      <text x="${p.x + 50}" y="130" text-anchor="middle" font-size="42">${p.i}</text>
      <text x="${p.x + 50}" y="170" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="14" font-weight="700">${p.t}</text>
    </g>
  `).join('')}
</svg>
`;

// Event-driven e-commerce (unique architecture)
export const eventDrivenSvg = `
<svg viewBox="0 0 860 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Event-driven e-commerce architecture">
  <defs>
    <linearGradient id="edBlue" x1="0" x2="1"><stop offset="0" stop-color="${COLORS.azure}"/><stop offset="1" stop-color="${COLORS.cyan}"/></linearGradient>
    <linearGradient id="edOrange" x1="0" x2="1"><stop offset="0" stop-color="${COLORS.amber}"/><stop offset="1" stop-color="${COLORS.red}"/></linearGradient>
    <linearGradient id="edGreen" x1="0" x2="1"><stop offset="0" stop-color="${COLORS.emerald}"/><stop offset="1" stop-color="#059669"/></linearGradient>
  </defs>
  <rect width="860" height="460" fill="#f8fafc" rx="14"/>
  <text x="430" y="30" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="${COLORS.navy}">Event-Driven E-Commerce — Order Pipeline</text>
  <!-- Edge -->
  <g>
    <rect x="24" y="70" width="140" height="70" rx="12" fill="url(#edBlue)"/>
    <text x="94" y="100" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🌐 Front Door</text>
    <text x="94" y="120" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">WAF · CDN · Global LB</text>
  </g>
  <!-- APIM -->
  <g>
    <rect x="200" y="70" width="140" height="70" rx="12" fill="url(#edBlue)"/>
    <text x="270" y="100" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🔌 API Mgmt</text>
    <text x="270" y="120" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Auth · Rate Limit</text>
  </g>
  <!-- Order API -->
  <g>
    <rect x="376" y="70" width="160" height="70" rx="12" fill="url(#edGreen)"/>
    <text x="456" y="100" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">📦 Order API</text>
    <text x="456" y="120" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Container Apps</text>
  </g>
  <!-- Event Grid -->
  <g>
    <rect x="570" y="70" width="160" height="70" rx="12" fill="url(#edOrange)"/>
    <text x="650" y="100" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">⚡ Event Grid</text>
    <text x="650" y="120" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Pub/Sub · At-least-once</text>
  </g>
  <!-- Subscribers row -->
  <g>
    <rect x="24"  y="200" width="150" height="70" rx="12" fill="${COLORS.indigo}"/>
    <text x="99"  y="230" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">💳 Payments Fn</text>
    <text x="99"  y="250" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Functions · Stripe</text>

    <rect x="194" y="200" width="150" height="70" rx="12" fill="${COLORS.indigo}"/>
    <text x="269" y="230" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">📧 Notify Fn</text>
    <text x="269" y="250" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Email · SMS</text>

    <rect x="364" y="200" width="150" height="70" rx="12" fill="${COLORS.indigo}"/>
    <text x="439" y="230" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">📊 Analytics Fn</text>
    <text x="439" y="250" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Event Hubs → Fabric</text>

    <rect x="534" y="200" width="150" height="70" rx="12" fill="${COLORS.indigo}"/>
    <text x="609" y="230" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">📦 Fulfillment Fn</text>
    <text x="609" y="250" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">WMS Integration</text>

    <rect x="704" y="200" width="130" height="70" rx="12" fill="${COLORS.indigo}"/>
    <text x="769" y="230" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🤖 AI Fraud</text>
    <text x="769" y="250" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">ML Model</text>
  </g>
  <!-- Data layer -->
  <g>
    <rect x="50"  y="330" width="220" height="80" rx="12" fill="${COLORS.azure}"/>
    <text x="160" y="360" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🗄️ Azure SQL</text>
    <text x="160" y="380" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Orders · Customers (OLTP)</text>
    <text x="160" y="396" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Hyperscale · Read replicas</text>

    <rect x="310" y="330" width="220" height="80" rx="12" fill="#1d4ed8"/>
    <text x="420" y="360" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🌍 Cosmos DB</text>
    <text x="420" y="380" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Cart · Sessions · Catalog read</text>
    <text x="420" y="396" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Multi-region writes</text>

    <rect x="570" y="330" width="220" height="80" rx="12" fill="${COLORS.purple}"/>
    <text x="680" y="360" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🔄 Redis Cache</text>
    <text x="680" y="380" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Inventory · Pricing</text>
    <text x="680" y="396" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Sub-ms reads</text>
  </g>
  <!-- Arrows -->
  <g stroke="${COLORS.slate}" stroke-width="2" fill="none">
    <line x1="164" y1="105" x2="200" y2="105"/>
    <line x1="340" y1="105" x2="376" y2="105"/>
    <line x1="536" y1="105" x2="570" y2="105"/>
    <line x1="99"  y1="200" x2="99"  y2="140"/>
    <line x1="269" y1="200" x2="269" y2="140"/>
    <line x1="439" y1="200" x2="439" y2="140"/>
    <line x1="609" y1="200" x2="609" y2="140"/>
    <line x1="769" y1="200" x2="769" y2="140"/>
    <line x1="650" y1="140" x2="650" y2="160"/>
  </g>
</svg>
`;

// Database decision matrix
export const dbDecisionSvg = `
<svg viewBox="0 0 820 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Database decision matrix">
  <rect width="820" height="360" fill="#f8fafc" rx="14"/>
  <text x="410" y="34" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="${COLORS.navy}">Pick Your Azure Database</text>
  <g>
    <rect x="40"  y="70"  width="230" height="260" rx="14" fill="${COLORS.azure}"/>
    <text x="155" y="104" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="16" font-weight="800">🗄️ Azure SQL</text>
    <text x="155" y="128" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Relational · Strong ACID</text>
    <text x="155" y="150" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">✓ OLTP</text>
    <text x="155" y="170" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">✓ Joins, FKs, TX</text>
    <text x="155" y="190" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">✓ BI tooling</text>
    <text x="155" y="225" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">❌ Global active-active</text>
    <text x="155" y="245" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">❌ 50K+ w/s telemetry</text>
    <text x="155" y="290" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Best for: orders, CRM,</text>
    <text x="155" y="308" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">ERP, financial records</text>
  </g>
  <g>
    <rect x="295" y="70"  width="230" height="260" rx="14" fill="#1d4ed8"/>
    <text x="410" y="104" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="16" font-weight="800">🌍 Cosmos DB</text>
    <text x="410" y="128" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Global NoSQL · Tunable</text>
    <text x="410" y="150" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">✓ Multi-region writes</text>
    <text x="410" y="170" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">✓ Sub-10ms globally</text>
    <text x="410" y="190" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">✓ High write throughput</text>
    <text x="410" y="225" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">❌ Complex joins</text>
    <text x="410" y="245" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">❌ Ad-hoc analytics</text>
    <text x="410" y="290" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Best for: IoT, sessions,</text>
    <text x="410" y="308" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">profiles, leaderboards</text>
  </g>
  <g>
    <rect x="550" y="70"  width="230" height="260" rx="14" fill="${COLORS.indigo}"/>
    <text x="665" y="104" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="16" font-weight="800">🐘 PostgreSQL</text>
    <text x="665" y="128" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Open Source · Extensions</text>
    <text x="665" y="150" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">✓ PostGIS (geo)</text>
    <text x="665" y="170" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">✓ pgvector (AI/RAG)</text>
    <text x="665" y="190" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">✓ Timescale (time-series)</text>
    <text x="665" y="225" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">❌ Extreme write scale</text>
    <text x="665" y="245" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">❌ Vendor lock-in fans</text>
    <text x="665" y="290" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Best for: geospatial,</text>
    <text x="665" y="308" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">content, AI workloads</text>
  </g>
</svg>
`;

// Landing zone hierarchy
export const landingZoneSvg = `
<svg viewBox="0 0 820 430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Azure Landing Zone hierarchy">
  <rect width="820" height="430" fill="#f8fafc" rx="14"/>
  <text x="410" y="30" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="${COLORS.navy}">Enterprise-Scale Landing Zone Hierarchy</text>
  <g>
    <rect x="340" y="56" width="140" height="44" rx="8" fill="${COLORS.navy}"/>
    <text x="410" y="84" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">Tenant Root</text>
  </g>
  <g>
    <rect x="340" y="124" width="140" height="44" rx="8" fill="${COLORS.azure}"/>
    <text x="410" y="152" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">Contoso (Top)</text>
  </g>
  <g>
    <rect x="40"  y="196" width="160" height="44" rx="8" fill="${COLORS.indigo}"/>
    <text x="120" y="224" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">🏗️ Platform</text>

    <rect x="230" y="196" width="160" height="44" rx="8" fill="${COLORS.emerald}"/>
    <text x="310" y="224" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">📦 Landing Zones</text>

    <rect x="420" y="196" width="160" height="44" rx="8" fill="${COLORS.amber}"/>
    <text x="500" y="224" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">🧪 Sandbox</text>

    <rect x="610" y="196" width="180" height="44" rx="8" fill="${COLORS.slate}"/>
    <text x="700" y="224" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">♻️ Decommissioned</text>
  </g>
  <g>
    <rect x="20"  y="266" width="100" height="44" rx="8" fill="#334155"/>
    <text x="70"  y="294" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Management</text>

    <rect x="128" y="266" width="110" height="44" rx="8" fill="#334155"/>
    <text x="183" y="294" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Connectivity</text>

    <rect x="246" y="266" width="100" height="44" rx="8" fill="#334155"/>
    <text x="296" y="294" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Identity</text>

    <rect x="360" y="266" width="100" height="44" rx="8" fill="#065f46"/>
    <text x="410" y="294" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Corp</text>

    <rect x="468" y="266" width="100" height="44" rx="8" fill="#065f46"/>
    <text x="518" y="294" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Online</text>
  </g>
  <g>
    <rect x="60"  y="340" width="200" height="64" rx="10" fill="#f1f5f9" stroke="${COLORS.slate}"/>
    <text x="160" y="362" text-anchor="middle" font-family="Segoe UI" font-size="11" font-weight="700" fill="${COLORS.navy}">Central Log Analytics</text>
    <text x="160" y="380" text-anchor="middle" font-family="Segoe UI" font-size="10" fill="${COLORS.slate}">Sentinel · Defender · Automation</text>
    <text x="160" y="396" text-anchor="middle" font-family="Segoe UI" font-size="10" fill="${COLORS.slate}">Backup Vault · Recovery Services</text>

    <rect x="290" y="340" width="200" height="64" rx="10" fill="#f1f5f9" stroke="${COLORS.slate}"/>
    <text x="390" y="362" text-anchor="middle" font-family="Segoe UI" font-size="11" font-weight="700" fill="${COLORS.navy}">Hub VNet · Azure Firewall</text>
    <text x="390" y="380" text-anchor="middle" font-family="Segoe UI" font-size="10" fill="${COLORS.slate}">ExpressRoute / VPN Gateway</text>
    <text x="390" y="396" text-anchor="middle" font-family="Segoe UI" font-size="10" fill="${COLORS.slate}">Private DNS Zones · Bastion</text>

    <rect x="520" y="340" width="260" height="64" rx="10" fill="#f1f5f9" stroke="${COLORS.slate}"/>
    <text x="650" y="362" text-anchor="middle" font-family="Segoe UI" font-size="11" font-weight="700" fill="${COLORS.navy}">Workload Subscriptions</text>
    <text x="650" y="380" text-anchor="middle" font-family="Segoe UI" font-size="10" fill="${COLORS.slate}">Inherit policy · Tagging · Diagnostics</text>
    <text x="650" y="396" text-anchor="middle" font-family="Segoe UI" font-size="10" fill="${COLORS.slate}">Peer to Hub · Central Logging</text>
  </g>
  <g stroke="${COLORS.slate}" stroke-width="1.5" fill="none">
    <line x1="410" y1="100" x2="410" y2="124"/>
    <line x1="410" y1="168" x2="120" y2="196"/>
    <line x1="410" y1="168" x2="310" y2="196"/>
    <line x1="410" y1="168" x2="500" y2="196"/>
    <line x1="410" y1="168" x2="700" y2="196"/>
    <line x1="120" y1="240" x2="70"  y2="266"/>
    <line x1="120" y1="240" x2="183" y2="266"/>
    <line x1="120" y1="240" x2="296" y2="266"/>
    <line x1="310" y1="240" x2="410" y2="266"/>
    <line x1="310" y1="240" x2="518" y2="266"/>
  </g>
</svg>
`;

// Multi-tenant SaaS pattern (unique)
export const multiTenantSaasSvg = `
<svg viewBox="0 0 840 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Multi-tenant SaaS architecture">
  <defs>
    <linearGradient id="mtTop" x1="0" x2="1"><stop offset="0" stop-color="${COLORS.indigo}"/><stop offset="1" stop-color="${COLORS.purple}"/></linearGradient>
  </defs>
  <rect width="840" height="440" fill="#f8fafc" rx="14"/>
  <text x="420" y="32" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="${COLORS.navy}">Multi-Tenant SaaS — Pool + Silo Hybrid</text>
  <text x="420" y="52" text-anchor="middle" font-family="Segoe UI" font-size="12" fill="${COLORS.slate}">Shared control plane · Per-tier isolation · Tenant-aware routing</text>
  <!-- Control plane -->
  <g>
    <rect x="40" y="80" width="760" height="88" rx="14" fill="url(#mtTop)"/>
    <text x="420" y="106" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="800">Control Plane (Shared)</text>
    <rect x="60"  y="120" width="170" height="36" rx="8" fill="rgba(255,255,255,0.2)"/>
    <text x="145" y="143" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11" font-weight="600">Tenant Registry (SQL)</text>
    <rect x="240" y="120" width="170" height="36" rx="8" fill="rgba(255,255,255,0.2)"/>
    <text x="325" y="143" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11" font-weight="600">Billing · Metering</text>
    <rect x="420" y="120" width="170" height="36" rx="8" fill="rgba(255,255,255,0.2)"/>
    <text x="505" y="143" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11" font-weight="600">Entra ID B2C</text>
    <rect x="600" y="120" width="180" height="36" rx="8" fill="rgba(255,255,255,0.2)"/>
    <text x="690" y="143" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11" font-weight="600">Provisioning Pipeline</text>
  </g>
  <!-- Data planes -->
  <g>
    <rect x="40"  y="200" width="245" height="160" rx="14" fill="${COLORS.azure}"/>
    <text x="162" y="224" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="14" font-weight="800">🥈 Basic Tier (POOL)</text>
    <text x="162" y="244" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Shared DB with RLS</text>
    <text x="162" y="264" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">1000s tenants / cluster</text>
    <text x="162" y="284" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Lowest cost</text>
    <rect x="60"  y="298" width="205" height="48" rx="8" fill="rgba(255,255,255,0.18)"/>
    <text x="162" y="317" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Azure SQL Elastic Pool</text>
    <text x="162" y="333" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">+ tenantId column everywhere</text>
  </g>
  <g>
    <rect x="297" y="200" width="245" height="160" rx="14" fill="${COLORS.emerald}"/>
    <text x="420" y="224" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="14" font-weight="800">🥇 Pro Tier (BRIDGE)</text>
    <text x="420" y="244" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">DB per tenant, shared compute</text>
    <text x="420" y="264" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">100s tenants / cluster</text>
    <text x="420" y="284" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Balance of cost + isolation</text>
    <rect x="317" y="298" width="205" height="48" rx="8" fill="rgba(255,255,255,0.18)"/>
    <text x="420" y="317" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Azure SQL DB / tenant</text>
    <text x="420" y="333" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Shared App Service Plan</text>
  </g>
  <g>
    <rect x="555" y="200" width="245" height="160" rx="14" fill="${COLORS.rose}"/>
    <text x="677" y="224" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="14" font-weight="800">💎 Enterprise (SILO)</text>
    <text x="677" y="244" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Dedicated resource group</text>
    <text x="677" y="264" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Dedicated subnet + keys</text>
    <text x="677" y="284" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Compliance-ready</text>
    <rect x="575" y="298" width="205" height="48" rx="8" fill="rgba(255,255,255,0.18)"/>
    <text x="677" y="317" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Dedicated VNet + PEs</text>
    <text x="677" y="333" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">CMK · Private AKS node pool</text>
  </g>
  <!-- Router -->
  <g>
    <rect x="280" y="388" width="280" height="42" rx="10" fill="${COLORS.navy}"/>
    <text x="420" y="414" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">🎯 Tenant-Aware Router (Front Door + Header)</text>
  </g>
  <line x1="420" y1="360" x2="420" y2="388" stroke="${COLORS.slate}" stroke-width="2"/>
</svg>
`;

// IoT lambda architecture
export const iotLambdaSvg = `
<svg viewBox="0 0 860 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="IoT Lambda architecture">
  <rect width="860" height="420" fill="#f8fafc" rx="14"/>
  <text x="430" y="30" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="${COLORS.navy}">IoT Lambda — Hot + Cold Path</text>
  <!-- Devices -->
  <g>
    <rect x="30" y="160" width="120" height="96" rx="12" fill="${COLORS.slate}"/>
    <text x="90" y="195" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="28">📡</text>
    <text x="90" y="222" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">Devices</text>
    <text x="90" y="242" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">100K sensors · MQTT</text>
  </g>
  <!-- IoT Hub -->
  <g>
    <rect x="175" y="160" width="130" height="96" rx="12" fill="${COLORS.azure}"/>
    <text x="240" y="195" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="28">☁️</text>
    <text x="240" y="222" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">IoT Hub</text>
    <text x="240" y="242" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Device Registry · TLS</text>
  </g>
  <!-- Hot path -->
  <g>
    <rect x="330" y="50"  width="170" height="80" rx="12" fill="${COLORS.red}"/>
    <text x="415" y="78" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🔥 Hot Path</text>
    <text x="415" y="98" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Stream Analytics</text>
    <text x="415" y="116" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Windowed aggregates</text>

    <rect x="525" y="50" width="160" height="80" rx="12" fill="#1d4ed8"/>
    <text x="605" y="78" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">⚡ Cosmos DB</text>
    <text x="605" y="98" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Serving Layer</text>
    <text x="605" y="116" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Real-time reads</text>

    <rect x="705" y="50" width="130" height="80" rx="12" fill="${COLORS.amber}"/>
    <text x="770" y="80" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🚨 Alerts</text>
    <text x="770" y="100" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Event Grid</text>
    <text x="770" y="116" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Teams · PagerDuty</text>
  </g>
  <!-- Cold path -->
  <g>
    <rect x="330" y="290" width="170" height="80" rx="12" fill="${COLORS.navy}"/>
    <text x="415" y="318" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🧊 Cold Path</text>
    <text x="415" y="338" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">ADLS Gen2</text>
    <text x="415" y="356" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Parquet · Delta</text>

    <rect x="525" y="290" width="160" height="80" rx="12" fill="${COLORS.indigo}"/>
    <text x="605" y="318" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🔬 Fabric / Synapse</text>
    <text x="605" y="338" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Batch ML · BI</text>
    <text x="605" y="356" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Feature store</text>

    <rect x="705" y="290" width="130" height="80" rx="12" fill="${COLORS.emerald}"/>
    <text x="770" y="318" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">📊 Power BI</text>
    <text x="770" y="338" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Dashboards</text>
    <text x="770" y="356" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Embedded + reports</text>
  </g>
  <g stroke="${COLORS.slate}" stroke-width="2" fill="none">
    <line x1="150" y1="208" x2="175" y2="208"/>
    <line x1="305" y1="190" x2="330" y2="90"/>
    <line x1="305" y1="224" x2="330" y2="330"/>
    <line x1="500" y1="90"  x2="525" y2="90"/>
    <line x1="685" y1="90"  x2="705" y2="90"/>
    <line x1="500" y1="330" x2="525" y2="330"/>
    <line x1="685" y1="330" x2="705" y2="330"/>
  </g>
</svg>
`;

// RAG / AI architecture
export const ragArchSvg = `
<svg viewBox="0 0 860 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="RAG architecture on Azure">
  <rect width="860" height="420" fill="#f8fafc" rx="14"/>
  <text x="430" y="30" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="${COLORS.navy}">Enterprise RAG on Azure — Ingest & Serve</text>
  <!-- Ingest row -->
  <text x="110" y="62" font-family="Segoe UI" font-size="12" font-weight="700" fill="${COLORS.rose}">INGEST PIPELINE</text>
  <g>
    <rect x="30"  y="76" width="130" height="70" rx="10" fill="${COLORS.slate}"/>
    <text x="95"  y="104" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">📄 Sources</text>
    <text x="95"  y="124" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">SharePoint · Blob · Web</text>

    <rect x="180" y="76" width="140" height="70" rx="10" fill="${COLORS.indigo}"/>
    <text x="250" y="104" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">⚙️ Doc Intel</text>
    <text x="250" y="124" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Layout · OCR · Tables</text>

    <rect x="340" y="76" width="130" height="70" rx="10" fill="${COLORS.purple}"/>
    <text x="405" y="104" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">✂️ Chunker</text>
    <text x="405" y="124" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Semantic · Overlap</text>

    <rect x="490" y="76" width="150" height="70" rx="10" fill="${COLORS.rose}"/>
    <text x="565" y="104" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🧬 Embed Model</text>
    <text x="565" y="124" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">text-embedding-3-large</text>

    <rect x="660" y="76" width="170" height="70" rx="10" fill="${COLORS.azure}"/>
    <text x="745" y="104" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🔎 AI Search</text>
    <text x="745" y="124" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Vector + Keyword Hybrid</text>
  </g>
  <!-- Serve row -->
  <text x="110" y="200" font-family="Segoe UI" font-size="12" font-weight="700" fill="${COLORS.emerald}">SERVE PIPELINE</text>
  <g>
    <rect x="30"  y="214" width="120" height="74" rx="10" fill="${COLORS.navy}"/>
    <text x="90"  y="244" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">👤 User</text>
    <text x="90"  y="264" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Web / Teams bot</text>

    <rect x="170" y="214" width="140" height="74" rx="10" fill="${COLORS.azure}"/>
    <text x="240" y="244" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🔐 APIM</text>
    <text x="240" y="264" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Auth · RBAC · Budget</text>

    <rect x="330" y="214" width="150" height="74" rx="10" fill="${COLORS.indigo}"/>
    <text x="405" y="244" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🤖 Orchestrator</text>
    <text x="405" y="262" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Function · Semantic Kernel</text>

    <rect x="500" y="214" width="150" height="74" rx="10" fill="${COLORS.azure}"/>
    <text x="575" y="244" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🔎 AI Search</text>
    <text x="575" y="262" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Retrieve top-k</text>

    <rect x="670" y="214" width="160" height="74" rx="10" fill="${COLORS.rose}"/>
    <text x="750" y="244" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🧠 Azure OpenAI</text>
    <text x="750" y="262" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">GPT-4o · Content Safety</text>
  </g>
  <!-- Observability -->
  <g>
    <rect x="30" y="322" width="800" height="68" rx="12" fill="#f1f5f9" stroke="${COLORS.slate}"/>
    <text x="430" y="348" text-anchor="middle" font-family="Segoe UI" font-size="13" font-weight="700" fill="${COLORS.navy}">📊 Observability &amp; Governance</text>
    <text x="430" y="368" text-anchor="middle" font-family="Segoe UI" font-size="11" fill="${COLORS.slate}">App Insights · Prompt Flow traces · Content Safety filters · Cost per tenant · Hallucination eval</text>
    <text x="430" y="384" text-anchor="middle" font-family="Segoe UI" font-size="11" fill="${COLORS.slate}">Entra ID tenant isolation · Purview labels · Private Endpoints on every service</text>
  </g>
  <g stroke="${COLORS.slate}" stroke-width="2" fill="none">
    <line x1="160" y1="111" x2="180" y2="111"/>
    <line x1="320" y1="111" x2="340" y2="111"/>
    <line x1="470" y1="111" x2="490" y2="111"/>
    <line x1="640" y1="111" x2="660" y2="111"/>
    <line x1="150" y1="251" x2="170" y2="251"/>
    <line x1="310" y1="251" x2="330" y2="251"/>
    <line x1="480" y1="251" x2="500" y2="251"/>
    <line x1="650" y1="251" x2="670" y2="251"/>
    <line x1="745" y1="146" x2="575" y2="214" stroke-dasharray="5 3"/>
  </g>
</svg>
`;

// Cost breakdown chart
export const costBreakdownSvg = `
<svg viewBox="0 0 820 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Azure cost breakdown typical">
  <rect width="820" height="320" fill="#f8fafc" rx="14"/>
  <text x="410" y="32" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="${COLORS.navy}">Typical Azure Spend Breakdown — Where the Money Goes</text>
  ${[
    { label: 'Compute (VMs, AKS, App Svc)', pct: 42, color: COLORS.azure, y: 70 },
    { label: 'Databases (SQL, Cosmos)',      pct: 22, color: COLORS.emerald, y: 110 },
    { label: 'Storage + Backups',            pct: 14, color: COLORS.indigo, y: 150 },
    { label: 'Networking + Egress',          pct: 10, color: COLORS.amber, y: 190 },
    { label: 'Logs + Monitoring',            pct: 7,  color: COLORS.rose, y: 230 },
    { label: 'Everything else',              pct: 5,  color: COLORS.slate, y: 270 },
  ].map(r => `
    <g>
      <text x="300" y="${r.y + 18}" text-anchor="end" font-family="Segoe UI" font-size="12" fill="${COLORS.navy}" font-weight="600">${r.label}</text>
      <rect x="320" y="${r.y}" width="${r.pct * 8}" height="28" rx="6" fill="${r.color}"/>
      <text x="${320 + r.pct * 8 + 8}" y="${r.y + 18}" font-family="Segoe UI" font-size="12" fill="${COLORS.navy}" font-weight="700">${r.pct}%</text>
    </g>
  `).join('')}
</svg>
`;

// Saga pattern
export const sagaSvg = `
<svg viewBox="0 0 860 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Saga orchestration pattern">
  <rect width="860" height="320" fill="#f8fafc" rx="14"/>
  <text x="430" y="30" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="${COLORS.navy}">Saga Orchestration — Distributed Transaction</text>
  <g>
    <rect x="30"  y="80" width="170" height="72" rx="12" fill="${COLORS.navy}"/>
    <text x="115" y="108" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🎭 Orchestrator</text>
    <text x="115" y="128" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Durable Functions</text>
    <text x="115" y="144" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">State + retries</text>
  </g>
  ${[
    { x: 230, c: COLORS.azure,   t: '①  Reserve Inventory', s: 'Cosmos DB' },
    { x: 410, c: COLORS.emerald, t: '②  Charge Payment',    s: 'Stripe API' },
    { x: 590, c: COLORS.indigo,  t: '③  Assign Shipping',   s: 'WMS Service' },
    { x: 770, c: COLORS.rose,    t: '④  Confirm Order',    s: 'Notifications' },
  ].slice(0,3).map((step, idx) => `
    <g>
      <rect x="${step.x}" y="80" width="160" height="72" rx="12" fill="${step.c}"/>
      <text x="${step.x + 80}" y="108" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">${step.t}</text>
      <text x="${step.x + 80}" y="128" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">${step.s}</text>
      <text x="${step.x + 80}" y="144" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">⟲ compensate</text>
    </g>
  `).join('')}
  <g>
    <rect x="590" y="80" width="160" height="72" rx="12" fill="${COLORS.rose}"/>
    <text x="670" y="108" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">④ Confirm</text>
    <text x="670" y="128" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Notifications</text>
  </g>
  <g stroke="${COLORS.slate}" stroke-width="2" fill="none">
    <line x1="200" y1="116" x2="230" y2="116"/>
    <line x1="390" y1="116" x2="410" y2="116"/>
    <line x1="570" y1="116" x2="590" y2="116"/>
  </g>
  <g>
    <rect x="30" y="200" width="800" height="90" rx="12" fill="#fef2f2" stroke="${COLORS.red}"/>
    <text x="50" y="226" font-family="Segoe UI" font-size="13" font-weight="800" fill="${COLORS.red}">🚨 FAILURE PATH — Compensating transactions roll back in reverse</text>
    <text x="50" y="248" font-family="Segoe UI" font-size="11" fill="${COLORS.navy}">If step ③ fails: compensate ② (refund payment) → compensate ① (release inventory)</text>
    <text x="50" y="266" font-family="Segoe UI" font-size="11" fill="${COLORS.navy}">State persisted in orchestrator so crash + resume is safe</text>
    <text x="50" y="283" font-family="Segoe UI" font-size="11" fill="${COLORS.navy}">All compensations are idempotent · all steps emit events to Event Grid for observability</text>
  </g>
</svg>
`;

// Disaster recovery active-passive
export const drActivePassiveSvg = `
<svg viewBox="0 0 860 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Active-passive disaster recovery">
  <rect width="860" height="380" fill="#f8fafc" rx="14"/>
  <text x="430" y="30" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="${COLORS.navy}">Active-Passive Multi-Region DR</text>
  <text x="430" y="50" text-anchor="middle" font-family="Segoe UI" font-size="12" fill="${COLORS.slate}">RTO &lt; 15 min · RPO &lt; 5 min · Cost-efficient</text>
  <!-- Front Door -->
  <g>
    <rect x="320" y="76" width="220" height="60" rx="12" fill="${COLORS.navy}"/>
    <text x="430" y="104" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="14" font-weight="700">🌐 Azure Front Door</text>
    <text x="430" y="123" text-anchor="middle" fill="#50E6FF" font-family="Segoe UI" font-size="11">Priority routing · Health probes · Auto failover</text>
  </g>
  <!-- Primary region -->
  <g>
    <rect x="30"  y="170" width="380" height="180" rx="16" fill="none" stroke="${COLORS.emerald}" stroke-width="2" stroke-dasharray="6 4"/>
    <text x="220" y="190" text-anchor="middle" font-family="Segoe UI" font-size="13" font-weight="800" fill="${COLORS.emerald}">🟢 PRIMARY — East US (Active)</text>
    <rect x="50"  y="206" width="160" height="56" rx="10" fill="${COLORS.azure}"/>
    <text x="130" y="228" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">App Service</text>
    <text x="130" y="248" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Zone-redundant</text>
    <rect x="230" y="206" width="160" height="56" rx="10" fill="${COLORS.azure}"/>
    <text x="310" y="228" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">Azure SQL</text>
    <text x="310" y="248" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Primary read/write</text>
    <rect x="50"  y="278" width="160" height="56" rx="10" fill="${COLORS.indigo}"/>
    <text x="130" y="300" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">Storage (GRS)</text>
    <text x="130" y="320" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Geo-replicated</text>
    <rect x="230" y="278" width="160" height="56" rx="10" fill="${COLORS.purple}"/>
    <text x="310" y="300" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">Key Vault</text>
    <text x="310" y="320" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Replicated</text>
  </g>
  <!-- Secondary region -->
  <g>
    <rect x="450" y="170" width="380" height="180" rx="16" fill="none" stroke="${COLORS.amber}" stroke-width="2" stroke-dasharray="6 4"/>
    <text x="640" y="190" text-anchor="middle" font-family="Segoe UI" font-size="13" font-weight="800" fill="${COLORS.amber}">🟡 SECONDARY — West US (Passive)</text>
    <rect x="470" y="206" width="160" height="56" rx="10" fill="${COLORS.slate}"/>
    <text x="550" y="228" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">App Service</text>
    <text x="550" y="248" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Warm standby</text>
    <rect x="650" y="206" width="160" height="56" rx="10" fill="${COLORS.slate}"/>
    <text x="730" y="228" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">Azure SQL</text>
    <text x="730" y="248" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Geo-replica (read)</text>
    <rect x="470" y="278" width="160" height="56" rx="10" fill="${COLORS.slate}"/>
    <text x="550" y="300" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">Storage</text>
    <text x="550" y="320" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">GRS replica</text>
    <rect x="650" y="278" width="160" height="56" rx="10" fill="${COLORS.slate}"/>
    <text x="730" y="300" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">Key Vault</text>
    <text x="730" y="320" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Replicated</text>
  </g>
  <g stroke="${COLORS.slate}" stroke-width="2" fill="none">
    <line x1="430" y1="136" x2="220" y2="170"/>
    <line x1="430" y1="136" x2="640" y2="170" stroke-dasharray="4 3"/>
    <line x1="390" y1="234" x2="650" y2="234" stroke="${COLORS.emerald}" stroke-width="1.5" stroke-dasharray="6 3"/>
    <text x="520" y="226" font-family="Segoe UI" font-size="10" fill="${COLORS.emerald}">geo-replication</text>
  </g>
</svg>
`;

// Payments PCI DSS
export const paymentsArchSvg = `
<svg viewBox="0 0 860 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PCI-compliant payments architecture">
  <rect width="860" height="440" fill="#f8fafc" rx="14"/>
  <text x="430" y="30" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="${COLORS.navy}">PCI-DSS Ready Payments — Segmented CDE</text>
  <!-- Public -->
  <g>
    <rect x="30" y="70" width="800" height="60" rx="14" fill="#fef2f2" stroke="${COLORS.red}"/>
    <text x="50" y="92" font-family="Segoe UI" font-size="12" font-weight="800" fill="${COLORS.red}">🌐 PUBLIC INTERNET</text>
    <text x="50" y="112" font-family="Segoe UI" font-size="10" fill="${COLORS.slate}">Front Door + WAF (OWASP rules + Bot Protection + DDoS Standard)</text>
  </g>
  <!-- Non-CDE -->
  <g>
    <rect x="30" y="150" width="390" height="270" rx="14" fill="none" stroke="${COLORS.indigo}" stroke-dasharray="6 4" stroke-width="2"/>
    <text x="225" y="170" text-anchor="middle" font-family="Segoe UI" font-size="13" font-weight="800" fill="${COLORS.indigo}">📦 APP ZONE (Out of scope)</text>
    <rect x="50" y="186" width="160" height="56" rx="10" fill="${COLORS.indigo}"/>
    <text x="130" y="210" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">Web App</text>
    <text x="130" y="228" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Product / cart</text>
    <rect x="230" y="186" width="170" height="56" rx="10" fill="${COLORS.indigo}"/>
    <text x="315" y="210" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">Order API</text>
    <text x="315" y="228" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Container Apps</text>
    <rect x="50" y="260" width="160" height="56" rx="10" fill="${COLORS.azure}"/>
    <text x="130" y="284" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">SQL (non-card)</text>
    <text x="130" y="302" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Orders metadata</text>
    <rect x="230" y="260" width="170" height="56" rx="10" fill="${COLORS.azure}"/>
    <text x="315" y="284" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">Redis cache</text>
    <text x="315" y="302" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Sessions · no PAN</text>
    <rect x="50" y="334" width="350" height="72" rx="10" fill="#eef2ff"/>
    <text x="225" y="358" text-anchor="middle" font-family="Segoe UI" font-size="12" font-weight="700" fill="${COLORS.navy}">Stores only payment TOKEN</text>
    <text x="225" y="378" text-anchor="middle" font-family="Segoe UI" font-size="11" fill="${COLORS.slate}">Never sees cardholder data (CHD)</text>
    <text x="225" y="396" text-anchor="middle" font-family="Segoe UI" font-size="11" fill="${COLORS.slate}">Scope reduction via tokenization</text>
  </g>
  <!-- CDE -->
  <g>
    <rect x="440" y="150" width="390" height="270" rx="14" fill="none" stroke="${COLORS.red}" stroke-dasharray="6 4" stroke-width="2.5"/>
    <text x="635" y="170" text-anchor="middle" font-family="Segoe UI" font-size="13" font-weight="800" fill="${COLORS.red}">🔒 CARDHOLDER DATA ENVIRONMENT</text>
    <rect x="460" y="186" width="170" height="56" rx="10" fill="${COLORS.red}"/>
    <text x="545" y="210" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">Payment API</text>
    <text x="545" y="228" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">Private subnet · mTLS</text>
    <rect x="650" y="186" width="170" height="56" rx="10" fill="${COLORS.red}"/>
    <text x="735" y="210" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">Tokenization</text>
    <text x="735" y="228" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">HSM-backed</text>
    <rect x="460" y="260" width="170" height="56" rx="10" fill="${COLORS.purple}"/>
    <text x="545" y="284" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">Key Vault Premium</text>
    <text x="545" y="302" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">FIPS 140-2 Level 3</text>
    <rect x="650" y="260" width="170" height="56" rx="10" fill="${COLORS.purple}"/>
    <text x="735" y="284" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">Encrypted Vault</text>
    <text x="735" y="302" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">CMK · column encryption</text>
    <rect x="460" y="334" width="360" height="72" rx="10" fill="#fef2f2"/>
    <text x="640" y="358" text-anchor="middle" font-family="Segoe UI" font-size="12" font-weight="700" fill="${COLORS.red}">Only systems touching PAN live here</text>
    <text x="640" y="378" text-anchor="middle" font-family="Segoe UI" font-size="11" fill="${COLORS.navy}">Dedicated VNet · restricted RBAC · JIT access</text>
    <text x="640" y="396" text-anchor="middle" font-family="Segoe UI" font-size="11" fill="${COLORS.navy}">Daily vuln scan · quarterly ASV · annual QSA audit</text>
  </g>
</svg>
`;

// Data mesh (unique)
export const dataMeshSvg = `
<svg viewBox="0 0 860 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Azure Data Mesh architecture">
  <rect width="860" height="400" fill="#f8fafc" rx="14"/>
  <text x="430" y="30" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="${COLORS.navy}">Azure Data Mesh — Federated Ownership</text>
  <text x="430" y="50" text-anchor="middle" font-family="Segoe UI" font-size="12" fill="${COLORS.slate}">Domains own data products · Central governance · Self-serve infra</text>
  <!-- Governance plane -->
  <g>
    <rect x="30" y="70" width="800" height="60" rx="12" fill="${COLORS.navy}"/>
    <text x="430" y="94" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">🛡️ Central Governance (Microsoft Purview)</text>
    <text x="430" y="114" text-anchor="middle" fill="#50E6FF" font-family="Segoe UI" font-size="11">Catalog · Classification · Lineage · Access Policies · DQ Rules</text>
  </g>
  <!-- Domains -->
  ${[
    { x: 30,  c: COLORS.azure,    t: '🛒 Sales Domain',   s1: 'Orders · Customers', s2: 'Fabric Lakehouse' },
    { x: 218, c: COLORS.emerald,  t: '📦 Ops Domain',     s1: 'Inventory · Ship',   s2: 'Synapse + ADLS' },
    { x: 406, c: COLORS.rose,     t: '💰 Finance Domain', s1: 'Billing · GL',       s2: 'Databricks' },
    { x: 594, c: COLORS.indigo,   t: '👥 HR Domain',      s1: 'Employees · Payroll', s2: 'Fabric Lakehouse' },
  ].map(d => `
    <g>
      <rect x="${d.x}" y="150" width="180" height="130" rx="12" fill="${d.c}"/>
      <text x="${d.x + 90}" y="180" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="800">${d.t}</text>
      <rect x="${d.x + 14}" y="198" width="152" height="34" rx="6" fill="rgba(255,255,255,0.18)"/>
      <text x="${d.x + 90}" y="220" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">${d.s1}</text>
      <rect x="${d.x + 14}" y="238" width="152" height="30" rx="6" fill="rgba(255,255,255,0.18)"/>
      <text x="${d.x + 90}" y="258" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="10">${d.s2}</text>
    </g>
  `).join('')}
  <!-- Platform -->
  <g>
    <rect x="30" y="304" width="800" height="76" rx="12" fill="#eef2ff"/>
    <text x="430" y="328" text-anchor="middle" font-family="Segoe UI" font-size="13" font-weight="800" fill="${COLORS.indigo}">⚙️ Self-Serve Data Platform (Terraform modules)</text>
    <text x="430" y="348" text-anchor="middle" font-family="Segoe UI" font-size="11" fill="${COLORS.navy}">Lakehouse template · Workspace provisioning · CI/CD pipelines · Data contracts</text>
    <text x="430" y="366" text-anchor="middle" font-family="Segoe UI" font-size="11" fill="${COLORS.slate}">Domains consume; central platform team maintains</text>
  </g>
</svg>
`;

// Map diagram IDs to SVGs for easy lookup from markdown
export const diagramBySlug = {
  hubSpoke: hubSpokeSvg,
  zeroTrust: zeroTrustSvg,
  wafPillars: wafPillarsSvg,
  eventDriven: eventDrivenSvg,
  dbDecision: dbDecisionSvg,
  landingZone: landingZoneSvg,
  multiTenantSaas: multiTenantSaasSvg,
  iotLambda: iotLambdaSvg,
  ragArch: ragArchSvg,
  costBreakdown: costBreakdownSvg,
  saga: sagaSvg,
  drActivePassive: drActivePassiveSvg,
  paymentsArch: paymentsArchSvg,
  dataMesh: dataMeshSvg,
};

// ============== ADDITIONAL DIAGRAMS ==============

// Container Apps scaling
export const containerAppsScaleSvg = `
<svg viewBox="0 0 820 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Container Apps scale-to-zero">
  <rect width="820" height="320" fill="#f8fafc" rx="14"/>
  <text x="410" y="32" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="#0f172a">Container Apps — KEDA-Driven Autoscale</text>
  ${[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
    const h = i < 2 ? 0 : i < 4 ? 40 : i < 8 ? 120 : 200;
    const load = i < 2 ? 'idle' : i < 4 ? 'warm' : i < 8 ? 'peak' : 'burst';
    const color = i < 2 ? '#cbd5e1' : i < 4 ? '#60a5fa' : i < 8 ? '#10b981' : '#f59e0b';
    return `<g>
      <rect x="${40 + i * 62}" y="${260 - h}" width="48" height="${Math.max(h, 4)}" rx="6" fill="${color}"/>
      <text x="${64 + i * 62}" y="278" text-anchor="middle" font-size="10" fill="#475569">${i}h</text>
    </g>`;
  }).join('')}
  <line x1="40" y1="260" x2="790" y2="260" stroke="#cbd5e1"/>
  <text x="40" y="70" font-family="Segoe UI" font-size="12" font-weight="700" fill="#10b981">🟢 Replicas scale 0 → 20 on HTTP concurrency</text>
  <text x="40" y="90" font-family="Segoe UI" font-size="11" fill="#475569">Idle: pay $0 · Peak: bill by replica-seconds</text>
  <text x="40" y="110" font-family="Segoe UI" font-size="11" fill="#475569">KEDA triggers: HTTP, Queue, Event Hub, CPU, Cron, custom</text>
</svg>
`;

// AKS cost optimization tactics
export const aksCostSvg = `
<svg viewBox="0 0 820 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AKS cost optimization">
  <rect width="820" height="340" fill="#f8fafc" rx="14"/>
  <text x="410" y="34" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="#0f172a">AKS Cost Optimization Stack — Typical Savings</text>
  ${[
    { y: 70,  label: 'Baseline (no optimization)',    w: 700, color: '#ef4444', value: '$10,000/mo' },
    { y: 108, label: '+ Right-size node pools',        w: 600, color: '#f59e0b', value: '$8,500' },
    { y: 146, label: '+ Spot nodes for batch/dev',     w: 450, color: '#f59e0b', value: '$6,400' },
    { y: 184, label: '+ HPA + VPA pod right-sizing',   w: 380, color: '#10b981', value: '$5,400' },
    { y: 222, label: '+ Cluster Autoscaler min=2',     w: 330, color: '#10b981', value: '$4,700' },
    { y: 260, label: '+ 3-yr Reservations on baseline',w: 260, color: '#059669', value: '$3,700' },
  ].map(r => `
    <g>
      <text x="20" y="${r.y + 24}" font-size="12" fill="#0f172a" font-weight="600">${r.label}</text>
      <rect x="300" y="${r.y + 4}" width="${r.w * 0.44}" height="28" rx="6" fill="${r.color}"/>
      <text x="${300 + r.w * 0.44 + 10}" y="${r.y + 24}" font-size="12" fill="#0f172a" font-weight="700">${r.value}</text>
    </g>
  `).join('')}
  <text x="20" y="315" font-size="12" fill="#059669" font-weight="700">↓ 63% total savings from stacking all tactics</text>
</svg>
`;

// KQL flow diagram
export const kqlFlowSvg = `
<svg viewBox="0 0 820 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="KQL query flow">
  <rect width="820" height="240" fill="#f8fafc" rx="14"/>
  <text x="410" y="34" text-anchor="middle" font-family="Segoe UI" font-size="16" font-weight="800" fill="#0f172a">KQL Query Execution Order</text>
  ${['where', 'extend', 'project', 'summarize', 'order by', 'render'].map((op, i) => `
    <g>
      <rect x="${30 + i * 132}" y="90" width="120" height="54" rx="10" fill="${['#0078D4','#6366f1','#8b5cf6','#10b981','#f59e0b','#ec4899'][i]}"/>
      <text x="${90 + i * 132}" y="122" text-anchor="middle" fill="#fff" font-family="Consolas, monospace" font-size="14" font-weight="700">| ${op}</text>
    </g>
    ${i < 5 ? `<line x1="${150 + i * 132}" y1="117" x2="${162 + i * 132}" y2="117" stroke="#475569" stroke-width="2" marker-end="url(#kqlArr)"/>` : ''}
  `).join('')}
  <defs><marker id="kqlArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#475569"/></marker></defs>
  <text x="410" y="190" text-anchor="middle" font-size="12" fill="#475569" font-weight="600">Tip: put filters early and projections before summarize to minimize data shuffled</text>
</svg>
`;

// DevOps pipeline
export const devopsPipelineSvg = `
<svg viewBox="0 0 860 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CI/CD pipeline">
  <rect width="860" height="260" fill="#f8fafc" rx="14"/>
  <text x="430" y="34" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="#0f172a">Secure CI/CD — GitHub Actions → Azure (No Secrets)</text>
  ${['📥 PR', '✅ CI Tests', '🔐 OIDC Federation', '🧪 Plan (Terraform)', '👀 Manual Approve', '🚀 Deploy Prod', '📊 Monitor'].map((step, i) => `
    <g>
      <rect x="${20 + i * 120}" y="100" width="108" height="70" rx="10" fill="${['#6366f1','#0891b2','#10b981','#f59e0b','#ec4899','#0078D4','#8b5cf6'][i]}"/>
      <text x="${74 + i * 120}" y="132" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">${step.split(' ')[0]}</text>
      <text x="${74 + i * 120}" y="152" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">${step.split(' ').slice(1).join(' ')}</text>
    </g>
    ${i < 6 ? `<line x1="${128 + i * 120}" y1="135" x2="${140 + i * 120}" y2="135" stroke="#475569" stroke-width="2"/>` : ''}
  `).join('')}
  <text x="430" y="220" text-anchor="middle" font-size="12" fill="#059669" font-weight="700">Zero secrets stored · OIDC short-lived tokens · Audit logs on every step</text>
</svg>
`;

// Reservation vs Savings Plan
export const reservationsSvg = `
<svg viewBox="0 0 820 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Reservations vs Savings Plans">
  <rect width="820" height="300" fill="#f8fafc" rx="14"/>
  <text x="410" y="32" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="#0f172a">Reservations vs Savings Plans — When Each Wins</text>
  <g>
    <rect x="30" y="72" width="360" height="200" rx="14" fill="#0078D4"/>
    <text x="210" y="104" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="15" font-weight="800">🔒 Reserved Instances</text>
    <text x="210" y="130" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Commit specific SKU for 1 or 3 years</text>
    <text x="210" y="160" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="600">✓ Max discount: 40-72%</text>
    <text x="210" y="180" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="600">✓ Best for stable workloads</text>
    <text x="210" y="200" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="600">✗ SKU lock-in</text>
    <text x="210" y="235" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Best for: production SQL, steady VMs,</text>
    <text x="210" y="252" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Cosmos, App Service, AKS baseline</text>
  </g>
  <g>
    <rect x="430" y="72" width="360" height="200" rx="14" fill="#10b981"/>
    <text x="610" y="104" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="15" font-weight="800">💳 Savings Plans</text>
    <text x="610" y="130" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Commit hourly $ spend for 1 or 3 years</text>
    <text x="610" y="160" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="600">✓ Discount: up to 65%</text>
    <text x="610" y="180" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="600">✓ Flexible: any VM family</text>
    <text x="610" y="200" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="600">✗ Slightly less discount</text>
    <text x="610" y="235" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Best for: evolving compute,</text>
    <text x="610" y="252" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">multi-region, frequent right-sizing</text>
  </g>
</svg>
`;

// Firewall vs NVA
export const firewallNvaSvg = `
<svg viewBox="0 0 820 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Azure Firewall vs NVA">
  <rect width="820" height="280" fill="#f8fafc" rx="14"/>
  <text x="410" y="32" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="#0f172a">Azure Firewall vs Third-Party NVA</text>
  <g>
    <rect x="30" y="70" width="360" height="180" rx="14" fill="#0078D4"/>
    <text x="210" y="100" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="15" font-weight="800">🔥 Azure Firewall Premium</text>
    <text x="210" y="126" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">~$1,500/mo · TLS inspect + IDPS</text>
    <text x="210" y="155" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12">✓ Managed · Zero patching</text>
    <text x="210" y="173" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12">✓ Auto-scale · Multi-AZ</text>
    <text x="210" y="191" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12">✓ Threat intel + URL filter</text>
    <text x="210" y="214" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">✗ Less granular than Palo/Forti</text>
    <text x="210" y="232" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">✗ Rule limit at very high scale</text>
  </g>
  <g>
    <rect x="430" y="70" width="360" height="180" rx="14" fill="#ef4444"/>
    <text x="610" y="100" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="15" font-weight="800">🛡️ Palo Alto / Fortinet NVA</text>
    <text x="610" y="126" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">~$2,500-4,000/mo + licenses</text>
    <text x="610" y="155" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12">✓ Feature-rich · Consistent on/off cloud</text>
    <text x="610" y="173" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12">✓ Advanced L7 inspection</text>
    <text x="610" y="191" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12">✓ Existing team expertise</text>
    <text x="610" y="214" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">✗ You manage the VMs, HA, upgrades</text>
    <text x="610" y="232" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">✗ Licensing complexity</text>
  </g>
</svg>
`;

// Vector DB comparison
export const vectorDbSvg = `
<svg viewBox="0 0 820 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Vector database options">
  <rect width="820" height="340" fill="#f8fafc" rx="14"/>
  <text x="410" y="34" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="#0f172a">Vector Database Options on Azure</text>
  <g>
    <rect x="30" y="70" width="240" height="240" rx="14" fill="#0078D4"/>
    <text x="150" y="104" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="15" font-weight="800">🔎 AI Search</text>
    <text x="150" y="136" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Hybrid search (vec + BM25)</text>
    <text x="150" y="156" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Semantic reranker included</text>
    <text x="150" y="180" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">Best for: RAG</text>
    <text x="150" y="210" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">$420/mo S1 · scalable</text>
    <text x="150" y="240" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Filterable, faceted, secure</text>
    <text x="150" y="270" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Enterprise-grade</text>
  </g>
  <g>
    <rect x="290" y="70" width="240" height="240" rx="14" fill="#6366f1"/>
    <text x="410" y="104" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="15" font-weight="800">🐘 pgvector (Postgres)</text>
    <text x="410" y="136" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Same DB as your app</text>
    <text x="410" y="156" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">SQL joins to metadata</text>
    <text x="410" y="180" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">Best for: app-embedded AI</text>
    <text x="410" y="210" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">$175/mo baseline</text>
    <text x="410" y="240" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">HNSW + IVF indexes</text>
    <text x="410" y="270" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Struggles > 10M vectors</text>
  </g>
  <g>
    <rect x="550" y="70" width="240" height="240" rx="14" fill="#1d4ed8"/>
    <text x="670" y="104" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="15" font-weight="800">🌍 Cosmos DB</text>
    <text x="670" y="136" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Vector in MongoDB vCore</text>
    <text x="670" y="156" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Global distribution</text>
    <text x="670" y="180" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="12" font-weight="700">Best for: global AI apps</text>
    <text x="670" y="210" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">$600/mo baseline</text>
    <text x="670" y="240" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Multi-region writes</text>
    <text x="670" y="270" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">Best at extreme scale</text>
  </g>
</svg>
`;

// Multi-region active-active
export const multiRegionActiveActiveSvg = `
<svg viewBox="0 0 860 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Active-active multi-region">
  <rect width="860" height="380" fill="#f8fafc" rx="14"/>
  <text x="430" y="30" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="#0f172a">Active-Active Multi-Region — Global Scale</text>
  <text x="430" y="50" text-anchor="middle" font-family="Segoe UI" font-size="12" fill="#475569">Reads local · Writes replicated · Last-write-wins with conflict handlers</text>
  <g>
    <rect x="320" y="76" width="220" height="60" rx="12" fill="#0f172a"/>
    <text x="430" y="104" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="14" font-weight="700">🌐 Front Door</text>
    <text x="430" y="123" text-anchor="middle" fill="#50E6FF" font-family="Segoe UI" font-size="11">Weighted routing · Geo-proximity</text>
  </g>
  ${[
    { x: 20,  label: 'East US',    subs: 'US East Coast', color: '#0078D4' },
    { x: 310, label: 'West Europe', subs: 'EU users', color: '#8b5cf6' },
    { x: 600, label: 'Southeast Asia', subs: 'APAC users', color: '#10b981' },
  ].map(r => `
    <g>
      <rect x="${r.x}" y="170" width="240" height="180" rx="14" fill="none" stroke="${r.color}" stroke-width="2" stroke-dasharray="6 4"/>
      <text x="${r.x + 120}" y="192" text-anchor="middle" font-family="Segoe UI" font-size="13" font-weight="800" fill="${r.color}">🌍 ${r.label}</text>
      <text x="${r.x + 120}" y="208" text-anchor="middle" font-family="Segoe UI" font-size="10" fill="#475569">${r.subs}</text>
      <rect x="${r.x + 20}" y="220" width="200" height="36" rx="8" fill="${r.color}"/>
      <text x="${r.x + 120}" y="242" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11" font-weight="700">App Service · AKS</text>
      <rect x="${r.x + 20}" y="262" width="200" height="36" rx="8" fill="${r.color}"/>
      <text x="${r.x + 120}" y="284" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11" font-weight="700">Cosmos DB (multi-write)</text>
      <rect x="${r.x + 20}" y="304" width="200" height="36" rx="8" fill="${r.color}"/>
      <text x="${r.x + 120}" y="326" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11" font-weight="700">Redis · Storage GZRS</text>
    </g>
  `).join('')}
  <g stroke="#475569" stroke-width="2" fill="none">
    <line x1="430" y1="136" x2="140" y2="170"/>
    <line x1="430" y1="136" x2="430" y2="170"/>
    <line x1="430" y1="136" x2="720" y2="170"/>
    <line x1="260" y1="280" x2="310" y2="280" stroke="#10b981" stroke-dasharray="6 3"/>
    <line x1="550" y1="280" x2="600" y2="280" stroke="#10b981" stroke-dasharray="6 3"/>
  </g>
</svg>
`;

// Fabric architecture
export const fabricSvg = `
<svg viewBox="0 0 860 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Microsoft Fabric architecture">
  <rect width="860" height="300" fill="#f8fafc" rx="14"/>
  <text x="430" y="34" text-anchor="middle" font-family="Segoe UI" font-size="17" font-weight="800" fill="#0f172a">Microsoft Fabric — One Lake, Many Workloads</text>
  <g>
    <rect x="30" y="70" width="800" height="50" rx="10" fill="#1d4ed8"/>
    <text x="430" y="102" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="14" font-weight="800">🏞️ OneLake (Delta Parquet · open format · ADLS Gen2)</text>
  </g>
  ${[
    { x: 30,  label: 'Data Factory',        sub: 'Ingest',    c: '#0891b2' },
    { x: 190, label: 'Data Engineering',    sub: 'Spark',     c: '#6366f1' },
    { x: 350, label: 'Data Warehouse',      sub: 'T-SQL',     c: '#10b981' },
    { x: 510, label: 'Real-Time Intel',     sub: 'KQL',       c: '#f59e0b' },
    { x: 670, label: 'Power BI',            sub: 'Reports',   c: '#ec4899' },
  ].map(w => `
    <g>
      <rect x="${w.x}" y="140" width="148" height="90" rx="10" fill="${w.c}"/>
      <text x="${w.x + 74}" y="180" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="13" font-weight="700">${w.label}</text>
      <text x="${w.x + 74}" y="200" text-anchor="middle" fill="#fff" font-family="Segoe UI" font-size="11">${w.sub}</text>
    </g>
  `).join('')}
  <text x="430" y="270" text-anchor="middle" font-size="12" fill="#475569" font-weight="600">Purview governance · Copilot integration · single capacity SKU</text>
</svg>
`;

Object.assign(diagramBySlug, {
  containerAppsScale: containerAppsScaleSvg,
  aksCost: aksCostSvg,
  kqlFlow: kqlFlowSvg,
  devopsPipeline: devopsPipelineSvg,
  reservations: reservationsSvg,
  firewallNva: firewallNvaSvg,
  vectorDb: vectorDbSvg,
  multiRegionActiveActive: multiRegionActiveActiveSvg,
  fabric: fabricSvg,
});
