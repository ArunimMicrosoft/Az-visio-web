import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
              <span className="brand-name">Azure Architecture Designer</span>
              <span className="brand-tagline">Powered by Arunim's IT Café</span>
            </div>
          </div>          <div className="landing-nav-actions">
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
              <span className="hero-feature-icon">✅</span>
              <span className="hero-feature-text">Azure Validated</span>
            </div>
            <div className="hero-feature-item">
              <span className="hero-feature-icon">💰</span>
              <span className="hero-feature-text">Live Pricing</span>
            </div>
            <div className="hero-feature-item">
              <span className="hero-feature-icon">🔄</span>
              <span className="hero-feature-text">Export to Terraform</span>
            </div>
            <div className="hero-feature-item">
              <span className="hero-feature-icon">🏢</span>
              <span className="hero-feature-text">Official Icons</span>
            </div>
          </div>
          
          <div className="hero-cta">
            <Link to="/signup" className="btn-hero-primary">Start Designing Free</Link>
            <a href="#features" className="btn-hero-secondary">See Features</a>
          </div>
            <div className="hero-stats-box">
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Azure Services</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">Real-time</div>
              <div className="stat-label">Cost Calculator</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5+</div>
              <div className="stat-label">Export Formats</div>
            </div>
          </div>
          
          <div className="scroll-indicator">
            <a href="#features" className="scroll-arrow">
              <span>↓</span>
              <span className="scroll-text">Explore Features</span>
            </a>
          </div>
        </div>
      </header>      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Why Choose Us</span>
            <h2 className="section-title">Enterprise-Grade Features</h2>
            <p className="section-subtitle">Everything you need to design, validate, and deploy Azure architectures</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Drag & Drop Canvas</h3>
              <p>Intuitive visual editor with Azure official icons. Place services, draw connections, create boundaries.</p>
              <ul className="feature-list">
                <li>✓ 50+ Official Azure service icons</li>
                <li>✓ Smart connection routing</li>
                <li>✓ Multi-select and group operations</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Real-Time Cost Calculator</h3>
              <p>Estimate Azure costs as you design. Compare SKUs, regions, and configurations instantly.</p>
              <ul className="feature-list">
                <li>✓ Live Azure pricing data</li>
                <li>✓ Multi-region cost comparison</li>
                <li>✓ Export detailed cost reports</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Architecture Validation</h3>
              <p>Validates dependencies and deployment requirements against Azure best practices.</p>
              <ul className="feature-list">
                <li>✓ Real-time dependency checking</li>
                <li>✓ Security best practices</li>
                <li>✓ Deployment readiness validation</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Multi-Format Export</h3>
              <p>Export to PNG, PDF, JSON, Terraform, ARM templates with one click.</p>
              <ul className="feature-list">
                <li>✓ Terraform HCL generation</li>
                <li>✓ ARM template export</li>
                <li>✓ Professional PDF reports</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Visual Connections</h3>
              <p>Draw arrows between services to show data flow and dependencies clearly.</p>
              <ul className="feature-list">
                <li>✓ Custom connection labels</li>
                <li>✓ Multiple connection types</li>
                <li>✓ Auto-routing algorithms</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Enterprise Security</h3>
              <p>Bank-grade authentication with rate limiting and account protection.</p>
              <ul className="feature-list">
                <li>✓ Password strength enforcement</li>
                <li>✓ Session management</li>
                <li>✓ Account lockout protection</li>
              </ul>
            </div>
          </div>
        </div>
      </section>      {/* Technical Details Section */}
      <section className="tech-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Built on Standards</span>
            <h2 className="section-title">Official Azure Integration</h2>
            <p className="section-subtitle">Powered by Microsoft Azure official resources and documentation</p>
          </div>
          
          <div className="tech-grid">
            <div className="tech-card">
              <h3>🏢 Official Azure Icons</h3>
              <p>Uses Microsoft's official Azure service icon library for accurate and consistent representation of your architecture.</p>
              <div className="tech-details">
                <span className="tech-tag">Icon Library</span>
                <span className="tech-tag">SVG Format</span>
                <span className="tech-tag">Always Updated</span>
              </div>
              <a href="https://learn.microsoft.com/en-us/azure/architecture/icons/" target="_blank" rel="noopener noreferrer" className="tech-link">
                View Microsoft Icon Library →
              </a>
            </div>

            <div className="tech-card">
              <h3>📐 Architecture Validation</h3>
              <p>Validates your designs against Azure deployment rules and dependency requirements from official documentation.</p>
              <div className="tech-details">
                <span className="tech-tag">Best Practices</span>
                <span className="tech-tag">Real-time Check</span>
                <span className="tech-tag">Auto-fix Suggestions</span>
              </div>
              <a href="https://learn.microsoft.com/en-us/azure/architecture/" target="_blank" rel="noopener noreferrer" className="tech-link">
                Azure Architecture Center →
              </a>
            </div>

            <div className="tech-card">
              <h3>🏗️ Infrastructure as Code</h3>
              <p>Export your designs to Terraform HCL and Azure ARM templates for automated deployment and version control.</p>
              <div className="tech-details">
                <span className="tech-tag">Terraform</span>
                <span className="tech-tag">ARM Templates</span>
                <span className="tech-tag">CI/CD Ready</span>
              </div>
              <a href="https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/" target="_blank" rel="noopener noreferrer" className="tech-link">
                ARM Templates Documentation →
              </a>
            </div>

            <div className="tech-card">
              <h3>💵 Live Cost Estimation</h3>
              <p>Built-in cost calculator provides real-time Azure service pricing estimates based on your selected configurations.</p>
              <div className="tech-details">
                <span className="tech-tag">Real-time Pricing</span>
                <span className="tech-tag">Multi-region</span>
                <span className="tech-tag">Cost Reports</span>
              </div>
              <a href="https://azure.microsoft.com/en-us/pricing/calculator/" target="_blank" rel="noopener noreferrer" className="tech-link">
                Official Azure Pricing Calculator →
              </a>
            </div>
          </div>
        </div>
      </section>{/* Services Section */}
      <section className="services-section">
        <div className="section-container">
          <h2 className="section-title">Azure Services Supported</h2>
          <div className="services-categories">
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
            {/* Starter Plan */}
            <div className="pricing-card">              <div className="pricing-header">
                <h3 className="pricing-title">Starter</h3>
                <div className="pricing-price">
                  <span className="price-amount">$0</span>
                  <span className="price-period">/mo</span>
                </div>
                <div className="pricing-price-inr">
                  <span className="price-amount-small">₹0</span>
                  <span className="price-period-small">/mo</span>
                </div>
                <p className="pricing-description">Perfect for testing and small projects</p>
              </div>
              <ul className="pricing-features">
                <li className="feature-item">✓ Up to 100 licenses</li>
                <li className="feature-item">✓ 1 workspace</li>
                <li className="feature-item">✓ Basic analytics</li>
                <li className="feature-item">✓ Email support</li>
                <li className="feature-item">✓ REST API access</li>
              </ul>
              <Link to="/signup" className="btn-pricing btn-pricing-outline">Get Started</Link>
            </div>

            {/* Professional Plan - Most Popular */}
            <div className="pricing-card pricing-card-popular">
              <div className="popular-badge">Most Popular</div>              <div className="pricing-header">
                <h3 className="pricing-title">Professional</h3>
                <div className="pricing-price">
                  <span className="price-amount">$49</span>
                  <span className="price-period">/mo</span>
                </div>
                <div className="pricing-price-inr">
                  <span className="price-amount-small">₹4,099</span>
                  <span className="price-period-small">/mo</span>
                </div>
                <p className="pricing-description">For growing businesses</p>
              </div>
              <ul className="pricing-features">
                <li className="feature-item">✓ Up to 10,000 licenses</li>
                <li className="feature-item">✓ Unlimited workspaces</li>
                <li className="feature-item">✓ Advanced analytics</li>
                <li className="feature-item">✓ Priority support</li>
                <li className="feature-item">✓ Custom domains</li>
                <li className="feature-item">✓ Webhook integrations</li>
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
                  <span className="price-amount">$199</span>
                  <span className="price-period">/mo</span>
                </div>
                <div className="pricing-price-inr">
                  <span className="price-amount-small">₹16,649</span>
                  <span className="price-period-small">/mo</span>
                </div>
                <p className="pricing-description">For large organizations</p>
              </div>
              <ul className="pricing-features">
                <li className="feature-item">✓ Unlimited licenses</li>
                <li className="feature-item">✓ Unlimited workspaces</li>
                <li className="feature-item">✓ Real-time analytics</li>
                <li className="feature-item">✓ 24/7 dedicated support</li>
                <li className="feature-item">✓ SSO & SAML</li>
                <li className="feature-item">✓ On-premise deployment</li>
                <li className="feature-item">✓ SLA guarantee</li>
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
                <span className="footer-brand-name">Azure Architecture Designer</span>
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
              © 2026 Azure Architecture Designer. All rights reserved. | Built By: <a href="https://arunimitcaffe.gumroad.com/" target="_blank" rel="noopener noreferrer" style={{color: '#00BCF2', textDecoration: 'none'}}>Arunim's IT Café</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
