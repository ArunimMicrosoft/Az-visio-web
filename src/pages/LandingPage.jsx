import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HowItWorksIllustration,
  ServiceMosaic,
  FeatureDragDrop,
  FeatureWAF,
  FeatureIaC,
  FeatureCost,
  FeatureExport,
  FeatureSecurity,
} from '../components/LandingIllustrations';
import '../components/LandingIllustrations.css';
import AppShowcase from '../components/AppShowcase';
import './LandingPage.css';

const LandingPage = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  return (
    <div className="landing-page">      {/* Hero Section */}
      <header className="landing-hero">
        <nav className="landing-nav">
          <div className="landing-nav-brand">
            <svg className="brand-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#0078D4"/>
              <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="#50E6FF"/>
            </svg>
            <div className="brand-info">
              <span className="brand-name">Cloud Canvas Designer</span>
              <span className="brand-tagline">Powered by Arunim's IT Café</span>
            </div>
          </div>          <div className="landing-nav-actions">
            <Link to="/blog" className="btn-secondary" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>Learn</Link>
            {isLoading ? (
              <div className="btn-secondary" style={{ opacity: 0.6, cursor: 'wait' }}>Loading...</div>
            ) : (
              <>
                {isAuthenticated ? (
                  <>
                    <div className="auth-status-indicator">
                      <span className="status-dot"></span>
                      <span className="status-text">{user?.name || 'Signed In'}</span>
                    </div>
                    <Link to="/app" className="btn-secondary">Dashboard</Link>
                    <button onClick={logout} className="btn-signout">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn-secondary">Sign In</Link>
                    <Link to="/signup" className="btn-primary">Get Started</Link>
                  </>
                )}
              </>
            )}
          </div>
        </nav>        <div className="hero-content">
          <h1 className="hero-title">
            Design Azure Architecture
            <span className="gradient-text"> Visually</span>
          </h1>
          <p className="hero-subtitle">
            Professional drag-and-drop tool for creating Azure architecture diagrams with real-time validation and cost estimation
          </p>
            <div className="hero-features-preview">
            <div className="hero-feature-item">
              <span className="hero-feature-icon">🏛️</span>
              <span className="hero-feature-text">WAF Validated</span>
            </div>
            <div className="hero-feature-item">
              <span className="hero-feature-icon">💰</span>
              <span className="hero-feature-text">Live Pricing</span>
            </div>
            <div className="hero-feature-item">
              <span className="hero-feature-icon">🔧</span>
              <span className="hero-feature-text">Terraform Parser</span>
            </div>
            <div className="hero-feature-item">
              <span className="hero-feature-icon">🏢</span>
              <span className="hero-feature-text">700+ Azure Icons</span>
            </div>
          </div>
          
          <div className="hero-cta">
            <Link to="/signup" className="btn-hero-primary">Start Designing Free</Link>
            <a href="#features" className="btn-hero-secondary">See Features</a>
          </div>
            <div className="hero-stats-box">            <div className="stat-item">
              <div className="stat-number">700+</div>
              <div className="stat-label">Azure Icons</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5 Pillars</div>
              <div className="stat-label">WAF Validated</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">Real-time</div>
              <div className="stat-label">Cost Calculator</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">IaC</div>
              <div className="stat-label">Terraform + ARM</div>
            </div>
          </div>

          {/* Real product screenshot — wrapped in browser frame */}
          <div className="hero-screenshot-wrap">
            <div className="hero-browser-frame">
              <div className="hero-browser-bar">
                <span className="hero-dot hero-dot-red" />
                <span className="hero-dot hero-dot-yellow" />
                <span className="hero-dot hero-dot-green" />
                <span className="hero-url">cloudcanvas.co/app</span>
              </div>
              <img
                src="/screenshots/app-overview.png"
                alt="Cloud Canvas Designer — full app workspace with Azure service sidebar, drag-and-drop canvas, cost estimator panel, and toolbar for templates, save, load, validate, and export"
                className="hero-screenshot"
                width="1024"
                height="600"
                loading="eager"
                fetchpriority="high"
              />
            </div>
            {/* Floating decorative orbs around the screenshot */}
            <div className="hero-orb hero-orb-1" />
            <div className="hero-orb hero-orb-2" />
            <div className="hero-orb hero-orb-3" />
          </div>

          <div className="scroll-indicator">
            <a href="#features" className="scroll-arrow">
              <span>↓</span>
              <span className="scroll-text">Explore Features</span>
            </a>
          </div>
        </div>
      </header>

      {/* How It Works — visual three-step flow */}
      <section className="how-it-works-section" style={{ padding: '60px 20px 20px', background: '#f8fafc', textAlign: 'center' }}>
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">How It Works</span>
            <h2 className="section-title">From Idea to Production in 3 Steps</h2>
            <p className="section-subtitle">No DevOps PhD required. Visual design, instant validation, exportable code.</p>
          </div>
          <HowItWorksIllustration />
        </div>
      </section>

      {/* Real product screenshots showcase */}
      <AppShowcase />

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Why Choose Us</span>
            <h2 className="section-title">Enterprise-Grade Features</h2>
            <p className="section-subtitle">Everything you need to design, validate, and deploy Azure architectures at scale</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <FeatureDragDrop />
              <div className="feature-icon">🎨</div>
              <h3>Drag & Drop Canvas</h3>
              <p>Intuitive visual editor with 700+ official Microsoft Azure icons. Place services, draw connections, create security boundaries.</p>
              <ul className="feature-list">
                <li>✓ 700+ Official Azure service icons</li>
                <li>✓ Smart connection routing with labels</li>
                <li>✓ Multi-select, group & boundary zones</li>
              </ul>
            </div>

            <div className="feature-card feature-card-highlight">
              <FeatureWAF />
              <div className="feature-icon">🏛️</div>
              <h3>Azure Well-Architected Framework</h3>
              <p>Built-in WAF validator checks your architecture against all 5 pillars — Reliability, Security, Cost Optimization, Operational Excellence, and Performance.</p>
              <ul className="feature-list">
                <li>✓ Real-time pillar score (0–100)</li>
                <li>✓ Actionable fix recommendations</li>
                <li>✓ WAF compliance report export</li>
              </ul>
            </div>

            <div className="feature-card feature-card-highlight">
              <FeatureIaC />
              <div className="feature-icon">🔧</div>
              <h3>Terraform HCL Parser & Generator</h3>
              <p>Import existing Terraform code and visualize it as a diagram — or export your canvas directly to production-ready Terraform HCL with proper resource blocks and dependencies.</p>
              <ul className="feature-list">
                <li>✓ Parse .tf files → auto-generate diagram</li>
                <li>✓ Export canvas → valid Terraform HCL</li>
                <li>✓ Supports azurerm provider resources</li>
              </ul>
            </div>

            <div className="feature-card">
              <FeatureCost />
              <div className="feature-icon">💰</div>
              <h3>Real-Time Cost Calculator</h3>
              <p>Estimate Azure costs as you design using the official Azure Retail Prices API. Compare SKUs, regions, and configurations instantly.</p>
              <ul className="feature-list">
                <li>✓ Live Azure Retail Prices API</li>
                <li>✓ Multi-region cost comparison</li>
                <li>✓ Exportable cost breakdown reports</li>
              </ul>
            </div>

            <div className="feature-card">
              <FeatureExport />
              <div className="feature-icon">📦</div>
              <h3>Multi-Format Export</h3>
              <p>Export your architecture in any format your team needs — from visual PNG/PDF to deployable IaC templates.</p>
              <ul className="feature-list">
                <li>✓ PNG / PDF (print-ready)</li>
                <li>✓ Terraform HCL, Bicep & ARM templates</li>
                <li>✓ JSON diagram (save & reload)</li>
              </ul>
            </div>

            <div className="feature-card">
              <FeatureSecurity />
              <div className="feature-icon">🔒</div>
              <h3>Enterprise Security</h3>
              <p>Bank-grade authentication with rate limiting, account lockout, and full audit logging for compliance.</p>
              <ul className="feature-list">
                <li>✓ Supabase Auth with RLS policies</li>
                <li>✓ Rate limiting & account lockout</li>
                <li>✓ Full audit log trail</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI Architecture Discovery Section */}
      <section id="discovery" className="discovery-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">🆕 New · Pro Feature</span>
            <h2 className="section-title">AI Architecture Discovery</h2>
            <p className="section-subtitle">
              Turn any Azure export into a professional architecture diagram in seconds — with WAF scoring, security issues, and traffic flows.
            </p>
          </div>

          <div className="discovery-landing-grid">
            {/* Left: what it does */}
            <div className="discovery-landing-info">
              <h3 className="discovery-landing-heading">Drop a file. Get a diagram.</h3>
              <p className="discovery-landing-desc">
                Upload an ARM template, Bicep file, Terraform HCL, Terraform state, Azure Resource Graph result, Az CLI JSON, PowerShell export, or a Cloud Canvas Discovery (.ccd) file. Our engine identifies every resource, infers relationships, traces traffic flows, and lays it all out in tiered Azure Architecture Center style.
              </p>

              <ul className="discovery-landing-features">
                <li><span className="disc-check">✓</span> Detects 11 export types automatically</li>
                <li><span className="disc-check">✓</span> Infers subnet, backend pool, private endpoint & identity links</li>
                <li><span className="disc-check">✓</span> Scores against all 5 Well-Architected pillars</li>
                <li><span className="disc-check">✓</span> Flags public storage, missing NSGs, no-backup VMs, and more</li>
                <li><span className="disc-check">✓</span> Groups by Resource Group and Region visually</li>
              </ul>

              <div className="discovery-landing-cta">
                <a href="/signup" className="discovery-landing-btn-primary">Try Discovery Free →</a>
                <a href="#pricing" className="discovery-landing-btn-secondary">See pricing</a>
              </div>
            </div>

            {/* Right: how to get the IaC */}
            <div className="discovery-landing-howto">
              <div className="discovery-landing-howto-header">
                <span className="discovery-landing-howto-icon">📤</span>
                <div>
                  <div className="discovery-landing-howto-title">How to export your Azure infrastructure</div>
                  <div className="discovery-landing-howto-sub">Pick the method you already use — no agent, no install.</div>
                </div>
              </div>

              <div className="discovery-landing-method">
                <div className="discovery-landing-method-name">
                  <span className="disc-badge">Portal</span> ARM template (fastest)
                </div>
                <ol className="discovery-landing-method-steps">
                  <li>Azure Portal → open your Resource Group</li>
                  <li>Settings → <b>Export template</b></li>
                  <li>Click <b>Download</b> — you get <code>template.json</code></li>
                  <li>Upload that file to Discovery</li>
                </ol>
              </div>

              <div className="discovery-landing-method">
                <div className="discovery-landing-method-name">
                  <span className="disc-badge">CLI</span> Azure CLI list
                </div>
                <pre className="discovery-landing-code">az resource list --subscription {`{sub-id}`} {'>'} resources.json</pre>
                <p className="discovery-landing-method-note">Or per resource group: <code>az resource list -g my-rg {'>'} rg.json</code></p>
              </div>

              <div className="discovery-landing-method">
                <div className="discovery-landing-method-name">
                  <span className="disc-badge">Graph</span> Azure Resource Graph
                </div>
                <pre className="discovery-landing-code">{`az graph query -q "Resources | project id,name,type,location,resourceGroup,subscriptionId,properties" --first 1000 > graph.json`}</pre>
              </div>

              <div className="discovery-landing-method">
                <div className="discovery-landing-method-name">
                  <span className="disc-badge">PowerShell</span> Get-AzResource
                </div>
                <pre className="discovery-landing-code">{`Get-AzResource | ConvertTo-Json -Depth 20 > resources.json`}</pre>
              </div>

              <div className="discovery-landing-method">
                <div className="discovery-landing-method-name">
                  <span className="disc-badge">IaC</span> Terraform / Bicep
                </div>
                <p className="discovery-landing-method-note">
                  Upload your <code>main.tf</code>, <code>terraform.tfstate</code>, or <code>main.bicep</code> directly. We parse it on the client — nothing is sent to any external LLM.
                </p>
              </div>

              <div className="discovery-landing-privacy">
                🔒 Your file is parsed in your browser. Nothing gets uploaded to third-party services.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WAF Deep-Dive Section */}
      <section className="waf-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Built-in Compliance</span>
            <h2 className="section-title">Azure Well-Architected Framework Validation</h2>
            <p className="section-subtitle">Every diagram is automatically scored against Microsoft's 5 WAF pillars</p>
          </div>
          <div className="waf-pillars">
            <div className="waf-pillar">
              <div className="waf-pillar-icon" style={{background:'#10b981'}}>🛡️</div>
              <h4>Reliability</h4>
              <p>Detects single points of failure, missing redundancy, and lack of availability zone coverage.</p>
            </div>
            <div className="waf-pillar">
              <div className="waf-pillar-icon" style={{background:'#ef4444'}}>🔐</div>
              <h4>Security</h4>
              <p>Flags unprotected endpoints, missing Key Vault integration, and open network access paths.</p>
            </div>
            <div className="waf-pillar">
              <div className="waf-pillar-icon" style={{background:'#f59e0b'}}>💸</div>
              <h4>Cost Optimization</h4>
              <p>Identifies over-provisioned resources and recommends right-sizing or reserved instances.</p>
            </div>
            <div className="waf-pillar">
              <div className="waf-pillar-icon" style={{background:'#8b5cf6'}}>⚙️</div>
              <h4>Operational Excellence</h4>
              <p>Checks for missing monitoring (Azure Monitor, Log Analytics) and alerting coverage.</p>
            </div>
            <div className="waf-pillar">
              <div className="waf-pillar-icon" style={{background:'#0078D4'}}>⚡</div>
              <h4>Performance Efficiency</h4>
              <p>Validates autoscaling, CDN usage, and load balancing across your compute resources.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Details Section */}
      <section className="tech-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Built on Standards</span>
            <h2 className="section-title">Official Azure Integration</h2>
            <p className="section-subtitle">Powered by Microsoft Azure official resources, APIs, and documentation</p>
          </div>
          
          <div className="tech-grid">
            <div className="tech-card">
              <h3>🏢 700+ Official Azure Icons</h3>
              <p>Uses Microsoft's complete official Azure service icon library — every service accurately represented in SVG format, always up to date.</p>
              <div className="tech-details">
                <span className="tech-tag">700+ Icons</span>
                <span className="tech-tag">SVG Format</span>
                <span className="tech-tag">Microsoft Official</span>
              </div>
              <a href="https://learn.microsoft.com/en-us/azure/architecture/icons/" target="_blank" rel="noopener noreferrer" className="tech-link">
                View Microsoft Icon Library →
              </a>
            </div>

            <div className="tech-card">
              <h3>🔧 Terraform Parser</h3>
              <p>Paste or upload your existing <code>.tf</code> files — the parser reads <code>azurerm_*</code> resources and auto-generates a visual architecture diagram with correct connections.</p>
              <div className="tech-details">
                <span className="tech-tag">azurerm provider</span>
                <span className="tech-tag">Import & Export</span>
                <span className="tech-tag">HCL Generation</span>
              </div>
              <a href="https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs" target="_blank" rel="noopener noreferrer" className="tech-link">
                AzureRM Provider Docs →
              </a>
            </div>

            <div className="tech-card">
              <h3>🏛️ WAF Validation Engine</h3>
              <p>Automated scoring against all 5 Azure Well-Architected Framework pillars with specific recommendations and fix suggestions per resource.</p>
              <div className="tech-details">
                <span className="tech-tag">5 Pillars</span>
                <span className="tech-tag">Auto-Score</span>
                <span className="tech-tag">Fix Suggestions</span>
              </div>
              <a href="https://learn.microsoft.com/en-us/azure/well-architected/" target="_blank" rel="noopener noreferrer" className="tech-link">
                Azure WAF Documentation →
              </a>
            </div>

            <div className="tech-card">
              <h3>💵 Live Cost Estimation</h3>
              <p>Real-time pricing via the Azure Retail Prices API. See monthly/yearly estimates for every service in your diagram as you design.</p>
              <div className="tech-details">
                <span className="tech-tag">Retail Prices API</span>
                <span className="tech-tag">Multi-region</span>
                <span className="tech-tag">Multi-currency</span>
              </div>
              <a href="https://azure.microsoft.com/en-us/pricing/calculator/" target="_blank" rel="noopener noreferrer" className="tech-link">
                Azure Pricing Calculator →
              </a>
            </div>
          </div>
        </div>
      </section>{/* Services Section */}
      <section className="services-section">
        <div className="section-container">
          <h2 className="section-title">Azure Services Supported</h2>
          <p className="section-subtitle" style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 8px' }}>
            700+ official Microsoft Azure service icons across 22 categories. Just a taste below.
          </p>
          <ServiceMosaic />
          <div className="services-categories" style={{ marginTop: '40px' }}>
            <div className="service-category">
              <span className="category-icon">💻</span>
              <span className="category-name">Compute</span>
              <span className="category-count">VMs, AKS, App Services</span>
            </div>
            <div className="service-category">
              <span className="category-icon">💾</span>
              <span className="category-name">Storage</span>
              <span className="category-count">Blob, Files, Disks</span>
            </div>
            <div className="service-category">
              <span className="category-icon">🗄️</span>
              <span className="category-name">Databases</span>
              <span className="category-count">SQL, Cosmos, PostgreSQL</span>
            </div>
            <div className="service-category">
              <span className="category-icon">🌐</span>
              <span className="category-name">Networking</span>
              <span className="category-count">VNet, Load Balancer, Firewall</span>
            </div>
            <div className="service-category">
              <span className="category-icon">🤖</span>
              <span className="category-name">AI/ML</span>
              <span className="category-count">OpenAI, Cognitive Services</span>
            </div>
            <div className="service-category">
              <span className="category-icon">🔐</span>
              <span className="category-name">Security</span>
              <span className="category-count">Key Vault, Sentinel, Defender</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Pricing Plans</span>
            <h2 className="section-title">Choose the plan that fits your needs</h2>
            <p className="section-subtitle">Transparent pricing with no hidden fees</p>
          </div>

          <div className="pricing-grid">
            {/* Trial Plan */}
            <div className="pricing-card">              <div className="pricing-header">
                <h3 className="pricing-title">Trial</h3>
                <div className="pricing-price">
                  <span className="price-amount">$0</span>
                  <span className="price-period">/7 days</span>
                </div>
                <div className="pricing-price-inr">
                  <span className="price-amount-small">₹0</span>
                  <span className="price-period-small">/7 days</span>
                </div>
                <p className="pricing-description">Try free, no credit card needed</p>
              </div>              <ul className="pricing-features">
                <li className="feature-item">✓ 3 diagrams</li>
                <li className="feature-item">✓ 5 PNG exports</li>
                <li className="feature-item">✓ WAF validation</li>
                <li className="feature-item">✓ Cost estimation</li>
                <li className="feature-item">✗ PDF / IaC exports</li>
              </ul>
              <Link to="/signup" className="btn-pricing btn-pricing-outline">Start Free Trial</Link>
            </div>

            {/* Starter Plan */}
            <div className="pricing-card">              <div className="pricing-header">
                <h3 className="pricing-title">Starter</h3>
                <div className="pricing-price">
                  <span className="price-amount">$6</span>
                  <span className="price-period">/mo</span>
                </div>
                <div className="pricing-price-inr">
                  <span className="price-amount-small">₹499</span>
                  <span className="price-period-small">/mo</span>
                </div>
                <p className="pricing-description">For individual architects</p>
              </div>              <ul className="pricing-features">
                <li className="feature-item">✓ 25 diagrams</li>
                <li className="feature-item">✓ 50 PNG exports</li>
                <li className="feature-item">✓ PDF export</li>
                <li className="feature-item">✓ Cloud save (10)</li>
                <li className="feature-item">✓ No watermark</li>
                <li className="feature-item">✓ Share links</li>
              </ul>
              <button
                className="btn-pricing btn-pricing-outline"
                onClick={() => window.location.href = '/payment?plan=starter'}
              >
                Get Starter
              </button>
            </div>

            {/* Professional Plan - Most Popular */}
            <div className="pricing-card pricing-card-popular">
              <div className="popular-badge">Most Popular</div>              <div className="pricing-header">
                <h3 className="pricing-title">Professional</h3>
                <div className="pricing-price">
                  <span className="price-amount">$15</span>
                  <span className="price-period">/mo</span>
                </div>
                <div className="pricing-price-inr">
                  <span className="price-amount-small">₹1,200</span>
                  <span className="price-period-small">/mo</span>
                </div>
                <p className="pricing-description">For growing businesses</p>
              </div>              <ul className="pricing-features">
                <li className="feature-item">✓ Unlimited diagrams</li>
                <li className="feature-item">✓ Unlimited exports</li>
                <li className="feature-item">✓ Terraform & Bicep export</li>
                <li className="feature-item">✓ ARM template export</li>
                <li className="feature-item">✓ TF paste & import</li>
                <li className="feature-item">✓ Priority support</li>
              </ul>
              <button 
                className="btn-pricing btn-pricing-solid"
                onClick={() => window.location.href = '/payment?plan=professional'}
              >
                Get Started
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="pricing-card">              <div className="pricing-header">
                <h3 className="pricing-title">Enterprise</h3>
                <div className="pricing-price">
                  <span className="price-amount">$80</span>
                  <span className="price-period">/mo</span>
                </div>
                <div className="pricing-price-inr">
                  <span className="price-amount-small">₹6,699</span>
                  <span className="price-period-small">/mo</span>
                </div>
                <p className="pricing-description">For large organizations</p>
              </div>              <ul className="pricing-features">
                <li className="feature-item">✓ Unlimited diagrams</li>
                <li className="feature-item">✓ Unlimited workspaces</li>
                <li className="feature-item">✓ All export formats</li>
                <li className="feature-item">✓ API access & webhooks</li>
                <li className="feature-item">✓ SSO / SAML</li>
                <li className="feature-item">✓ Audit logs</li>
                <li className="feature-item">✓ Dedicated support</li>
              </ul>
              <button 
                className="btn-pricing btn-pricing-outline"
                onClick={() => window.location.href = 'mailto:arunimpandey2903@hotmail.com?subject=Enterprise Plan Inquiry'}
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Design Your Azure Solution?</h2>
          <p className="cta-subtitle">Start designing Azure architectures visually</p>
          <Link to="/signup" className="btn-cta">Get Started Free</Link>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="disclaimer-section">
        <div className="section-container">
          <div className="disclaimer-content">
            <h4 className="disclaimer-title">Trademarks & Third-Party Services</h4>
            <p className="disclaimer-text">
              Microsoft, Azure, Azure Well-Architected Framework, Azure Retail Prices API, ARM Templates, and all Azure service names and icons are trademarks or registered trademarks of Microsoft Corporation. The Azure service icons used in this application are sourced from the <a href="https://learn.microsoft.com/en-us/azure/architecture/icons/" target="_blank" rel="noopener noreferrer">Microsoft Azure Architecture Icons</a> library and are used in accordance with Microsoft's usage guidelines for architectural diagram purposes.
            </p>
            <p className="disclaimer-text">
              Terraform and HCL are trademarks of HashiCorp, Inc. This application parses and generates Terraform configurations using the <a href="https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs" target="_blank" rel="noopener noreferrer">azurerm provider</a> format.
            </p>
            <p className="disclaimer-text">
              Cost estimates are provided via the <a href="https://learn.microsoft.com/en-us/rest/api/cost-management/retail-prices/azure-retail-prices" target="_blank" rel="noopener noreferrer">Azure Retail Prices API</a> and are approximate. Actual costs may vary based on usage, configuration, reserved instances, and enterprise agreements. This tool is not a substitute for the official <a href="https://azure.microsoft.com/en-us/pricing/calculator/" target="_blank" rel="noopener noreferrer">Azure Pricing Calculator</a>.
            </p>
            <p className="disclaimer-text">
              Payment processing is handled by <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer">Razorpay</a>. Authentication and data storage are powered by <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">Supabase</a>. This application is not affiliated with, endorsed by, or sponsored by Microsoft Corporation, HashiCorp, Razorpay, or Supabase.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
              <svg className="footer-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#0078D4"/>
                <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="#50E6FF"/>
              </svg>
              <div>
                <span className="footer-brand-name">Cloud Canvas Designer</span>
              </div>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Resources</h4>
            <div className="footer-links-column">
              <a href="https://learn.microsoft.com/en-us/azure/architecture/" target="_blank" rel="noopener noreferrer">Azure Architecture Center</a>
              <a href="https://learn.microsoft.com/en-us/azure/" target="_blank" rel="noopener noreferrer">Azure Documentation</a>
              <a href="https://azure.microsoft.com/en-us/pricing/calculator/" target="_blank" rel="noopener noreferrer">Azure Pricing Calculator</a>
              <a href="https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/" target="_blank" rel="noopener noreferrer">ARM Templates</a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Contact</h4>
            <div className="footer-contact">              <a href="mailto:arunimpandey2903@hotmail.com" className="footer-email">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8L10.89 13.26C11.24 13.47 11.66 13.47 12.01 13.26L20 8M5 19H19C20.1 19 21 18.1 21 17V7C21 5.9 20.1 5 19 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                arunimpandey2903@hotmail.com
              </a>
            </div>
          </div>
        </div>        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © 2026 Cloud Canvas Designer. All rights reserved. | Built By: <a href="https://arunimitcaffe.gumroad.com/" target="_blank" rel="noopener noreferrer" style={{color: '#00BCF2', textDecoration: 'none'}}>Arunim's IT Café</a>
              {' · '}<Link to="/terms" style={{color: '#00BCF2', textDecoration: 'none'}}>Terms</Link>
              {' · '}<Link to="/privacy" style={{color: '#00BCF2', textDecoration: 'none'}}>Privacy</Link>
              {' · '}<Link to="/blog" style={{color: '#00BCF2', textDecoration: 'none'}}>Learn</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
