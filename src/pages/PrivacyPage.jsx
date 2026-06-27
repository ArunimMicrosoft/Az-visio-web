// Privacy Policy — Cloud Canvas Designer
import React, { useEffect } from 'react';
import { LegalHeader, LegalFooter } from './LegalLayout';
import './LegalPage.css';

const PrivacyPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const lastUpdated = 'May 9, 2026';

  return (
    <div className="legal-page">
      <LegalHeader />

      <section className="legal-hero">
        <div className="legal-hero-inner">
          <span className="legal-hero-badge">🔒 PRIVACY</span>
          <h1>Privacy Policy</h1>
          <div className="legal-hero-meta">Last updated: {lastUpdated}</div>
        </div>
      </section>

      <div className="legal-container">
        <article className="legal-body">

          <div className="legal-toc">
            <h4>On this page</h4>
            <ol>
              <li><a href="#scope">1. Scope</a></li>
              <li><a href="#data">2. Data We Collect</a></li>
              <li><a href="#how">3. How We Use Your Data</a></li>
              <li><a href="#legal-basis">4. Legal Basis (GDPR/DPDP)</a></li>
              <li><a href="#sharing">5. Sharing & Processors</a></li>
              <li><a href="#cookies">6. Cookies & Tracking</a></li>
              <li><a href="#retention">7. Retention</a></li>
              <li><a href="#rights">8. Your Rights</a></li>
              <li><a href="#security">9. Security</a></li>
              <li><a href="#children">10. Children</a></li>
              <li><a href="#international">11. International Transfers</a></li>
              <li><a href="#changes">12. Changes to This Policy</a></li>
              <li><a href="#contact">13. Contact / DPO</a></li>
            </ol>
          </div>

          <div className="legal-callout">
            <strong>Plain-English summary:</strong> We collect the minimum data needed to run your account (email, name, your diagrams). We do not sell your data. We do not train AI on your diagrams. Payments go directly to Razorpay; we never see your card. We use Cloudflare for hosting and Supabase for the database. You can export and delete your data anytime by emailing us.
          </div>

          <h2 id="scope">1. Scope</h2>
          <p>This Privacy Policy explains what personal data Arunim&apos;s IT Café ("<strong>we</strong>", "<strong>Cloud Canvas Designer</strong>") collects from users of <code>cloudcanvas.co</code> and the Cloud Canvas Designer Service, how we use it, who we share it with, and the rights you have.</p>
          <p>For the purposes of the EU GDPR and UK GDPR, we are the <strong>data controller</strong> of your account data. For the Indian Digital Personal Data Protection Act, 2023 ("<strong>DPDP Act</strong>"), we act as the <strong>data fiduciary</strong>.</p>

          <h2 id="data">2. Data We Collect</h2>

          <h3>2.1 Account data (you provide)</h3>
          <ul>
            <li>Email address</li>
            <li>Name (display name)</li>
            <li>Password — stored as a salted bcrypt hash by Supabase Auth, never in plain text</li>
            <li>Subscription tier and billing status</li>
          </ul>

          <h3>2.2 Diagram content (you create)</h3>
          <ul>
            <li>Diagram JSON (nodes, connections, boundaries, labels)</li>
            <li>Diagram names and metadata</li>
            <li>Version history (last 50 versions per diagram)</li>
            <li>Share links and their access settings</li>
          </ul>

          <h3>2.3 Usage data (auto-collected)</h3>
          <ul>
            <li>Page views, feature usage, button clicks (via Google Analytics, anonymized)</li>
            <li>Login timestamps, last-active timestamp</li>
            <li>Export counts (PNG, PDF, Terraform, etc.) for plan-limit enforcement</li>
            <li>IP address — captured via Cloudflare for security and via our audit log table</li>
            <li>Device fingerprint at login: user-agent, platform, screen size, timezone, language, hardware concurrency, device memory, color depth, pixel ratio (used for fraud / account-takeover detection)</li>
            <li>Referrer URL on signup</li>
          </ul>

          <h3>2.4 Payment data</h3>
          <p>We do <strong>NOT</strong> collect or store your card number, CVV, UPI handle, or bank account. Razorpay handles all payment data directly. We only receive:</p>
          <ul>
            <li>Razorpay payment ID and order ID</li>
            <li>Amount, currency, plan name</li>
            <li>Success / failure status</li>
            <li>Last 4 digits of card (if shown by Razorpay)</li>
          </ul>

          <h3>2.5 Communications</h3>
          <ul>
            <li>Support emails you send us</li>
            <li>Notification emails we send (delivery / open metadata only if applicable)</li>
          </ul>

          <h3>2.6 Data we do NOT collect</h3>
          <ul>
            <li>❌ Your Azure subscription credentials or any actual cloud account data — we never connect to your real Azure tenant</li>
            <li>❌ Personally identifiable information from your diagrams (the icons and labels are your data; we treat them as opaque content)</li>
            <li>❌ Your card number or CVV</li>
            <li>❌ Biometric data</li>
            <li>❌ Sensitive personal data (race, religion, health, political views, sexual orientation)</li>
            <li>❌ Cross-site tracking cookies for advertising</li>
          </ul>

          <h2 id="how">3. How We Use Your Data</h2>
          <table>
            <thead><tr><th>Purpose</th><th>Data used</th></tr></thead>
            <tbody>
              <tr><td>Account creation, login, password reset</td><td>Email, password hash, name</td></tr>
              <tr><td>Storing and rendering your diagrams</td><td>Diagram content, your user ID</td></tr>
              <tr><td>Enforcing plan limits (e.g., 25 diagrams for Starter)</td><td>Diagram count, export counts</td></tr>
              <tr><td>Processing payments and subscription state</td><td>Plan, billing status, Razorpay order/payment IDs</td></tr>
              <tr><td>Anti-abuse / fraud detection</td><td>IP, device fingerprint, login pattern</td></tr>
              <tr><td>Customer support</td><td>Email correspondence, account history</td></tr>
              <tr><td>Product analytics and improvement (aggregated)</td><td>Anonymous usage events</td></tr>
              <tr><td>Legal compliance (tax, fraud, court orders)</td><td>As required by law</td></tr>
            </tbody>
          </table>
          <p>We do <strong>not</strong> use your data for:</p>
          <ul>
            <li>Selling to data brokers</li>
            <li>Training AI / ML models on your diagrams or content</li>
            <li>Targeted advertising</li>
            <li>Profile sharing with third parties beyond the processors listed below</li>
          </ul>

          <h2 id="legal-basis">4. Legal Basis for Processing</h2>
          <p>Under GDPR (EEA / UK users) and DPDP Act (India users):</p>
          <ul>
            <li><strong>Contract performance</strong> — to provide the Service you signed up for (account, diagrams, payments)</li>
            <li><strong>Legitimate interest</strong> — security monitoring, fraud prevention, product analytics</li>
            <li><strong>Legal obligation</strong> — tax records, responding to lawful requests</li>
            <li><strong>Consent</strong> — non-essential cookies, marketing emails (you may withdraw consent anytime)</li>
          </ul>

          <h2 id="sharing">5. Sharing & Processors</h2>
          <p>We share the minimum necessary data with these vetted sub-processors:</p>
          <table>
            <thead><tr><th>Processor</th><th>Purpose</th><th>Data shared</th><th>Location</th></tr></thead>
            <tbody>
              <tr><td>Cloudflare, Inc.</td><td>Hosting, CDN, DDoS protection</td><td>HTTP requests, IPs</td><td>Global (edge)</td></tr>
              <tr><td>Supabase Inc.</td><td>Authentication + database</td><td>Account data, diagrams</td><td>AWS, region of project</td></tr>
              <tr><td>Razorpay Software Pvt Ltd</td><td>Payment processing</td><td>Email, name, amount, order/payment IDs</td><td>India</td></tr>
              <tr><td>Google LLC (Analytics)</td><td>Anonymous usage analytics</td><td>Pseudonymous client ID, page views</td><td>USA / EU</td></tr>
            </tbody>
          </table>
          <p>Each processor has executed a Data Processing Agreement and is contractually bound to use your data only to provide their service to us.</p>
          <p>We do <strong>NOT</strong> sell or rent personal data to anyone.</p>
          <p>We may disclose data if required by a valid legal process (court order, subpoena, regulatory demand). We will notify you unless legally prohibited.</p>

          <h2 id="cookies">6. Cookies & Tracking</h2>
          <table>
            <thead><tr><th>Cookie / Storage</th><th>Purpose</th><th>Type</th></tr></thead>
            <tbody>
              <tr><td><code>azure-arch-auth</code> (localStorage)</td><td>Persisted login session (Supabase Auth)</td><td>Essential</td></tr>
              <tr><td><code>_ga</code>, <code>_ga_*</code></td><td>Google Analytics anonymous metrics</td><td>Analytics</td></tr>
              <tr><td>Cloudflare <code>__cf_bm</code>, <code>cf_clearance</code></td><td>Bot detection, security</td><td>Essential security</td></tr>
            </tbody>
          </table>
          <p>We do not use third-party advertising cookies, retargeting pixels, or cross-site trackers. Browser settings (e.g., Chrome &quot;Block third-party cookies&quot;) work without breaking essential features.</p>

          <h2 id="retention">7. Data Retention</h2>
          <table>
            <thead><tr><th>Data type</th><th>Retention</th></tr></thead>
            <tbody>
              <tr><td>Account &amp; profile</td><td>Until account deletion + 30 days grace period</td></tr>
              <tr><td>Diagrams</td><td>Same as account; 30-day export window after deletion request</td></tr>
              <tr><td>Audit logs (login, exports)</td><td>1 year, then anonymized</td></tr>
              <tr><td>Payment records</td><td>7 years (tax/legal requirement)</td></tr>
              <tr><td>Support emails</td><td>2 years</td></tr>
              <tr><td>Backups</td><td>Rolling 30-day backups; deletions reflected within 90 days</td></tr>
            </tbody>
          </table>

          <h2 id="rights">8. Your Rights</h2>
          <p>You have the following rights regarding your personal data. To exercise them, email <a href="mailto:arunimpandey2903@hotmail.com">arunimpandey2903@hotmail.com</a> from the address on file. We respond within 30 days (or as required by your local law).</p>
          <ul>
            <li><strong>Access</strong> — get a copy of the data we hold about you</li>
            <li><strong>Rectification</strong> — correct inaccurate data (or do it yourself in your account settings)</li>
            <li><strong>Erasure / "Right to be forgotten"</strong> — delete your account and all personal data (subject to legal retention obligations)</li>
            <li><strong>Portability</strong> — export your diagrams in JSON format anytime from your dashboard, or request a full data export by email</li>
            <li><strong>Objection / restriction</strong> — object to specific processing (e.g., analytics)</li>
            <li><strong>Withdraw consent</strong> — for processing based on consent</li>
            <li><strong>Lodge a complaint</strong> — with your local data protection authority (e.g., the Information Commissioner&apos;s Office in the UK, your national DPA in the EU, or in India once the Data Protection Board is operational under the DPDP Act)</li>
            <li><strong>No automated decision-making</strong> — we do not make decisions about you using solely automated profiling</li>
          </ul>

          <h2 id="security">9. Security Measures</h2>
          <p>We protect your data with multiple layers of controls covering identity, network, data, and operations:</p>
          <ul>
            <li><strong>Encryption in transit</strong> — TLS 1.2+ everywhere, HSTS preloaded</li>
            <li><strong>Encryption at rest</strong> — Supabase Postgres encrypted via AWS KMS; backups encrypted</li>
            <li><strong>Password hashing</strong> — bcrypt with salt (Supabase Auth)</li>
            <li><strong>Access control</strong> — Postgres Row Level Security on every table; users can only read their own data</li>
            <li><strong>Payment isolation</strong> — card data flows directly to Razorpay; we never see or store it</li>
            <li><strong>Network protection</strong> — Cloudflare WAF, DDoS mitigation, bot protection</li>
            <li><strong>Audit logging</strong> — every login, signup, plan change, and admin action is logged with timestamp and IP</li>
            <li><strong>Rate limiting</strong> — per-IP rate limits on auth and API endpoints</li>
            <li><strong>Supply chain</strong> — Dependabot, CodeQL, GitHub secret scanning, branch protection</li>
            <li><strong>Multi-factor authentication</strong> — enforced on all administrator accounts</li>
            <li><strong>Backups</strong> — Supabase managed daily backups with point-in-time recovery</li>
            <li><strong>Incident response</strong> — if a breach affects you, we will notify within 72 hours of becoming aware (GDPR / DPDP Act compliant)</li>
          </ul>

          <h2 id="children">10. Children</h2>
          <p>The Service is not directed to children under 13. We do not knowingly collect personal data from anyone under 13. If you believe a child has provided us with personal data, contact us and we will delete it. For users aged 13–18, parental/guardian consent is required (see Terms §3).</p>

          <h2 id="international">11. International Data Transfers</h2>
          <p>Your data may be processed in India (Razorpay, our base of operations), the United States (Cloudflare edge nodes, Supabase AWS region depending on project, Google Analytics), and other regions where our processors operate. We rely on the EU&apos;s Standard Contractual Clauses (SCCs) and equivalent safeguards where applicable.</p>

          <h2 id="changes">12. Changes to This Policy</h2>
          <p>We may update this Privacy Policy. Material changes will be emailed to active subscribers at least 14 days before they take effect. Non-material changes will be reflected by an updated &quot;Last updated&quot; date at the top.</p>

          <h2 id="contact">13. Contact / Data Protection Officer</h2>
          <p>For any privacy question, data request, or to exercise your rights, contact:</p>
          <ul>
            <li><strong>Data Protection Contact:</strong> Arunim Pandey</li>
            <li><strong>Email:</strong> <a href="mailto:arunimpandey2903@hotmail.com">arunimpandey2903@hotmail.com</a></li>
            <li><strong>Postal:</strong> Arunim&apos;s IT Café, New Delhi, India</li>
          </ul>

          <div className="legal-callout legal-callout-warning">
            <strong>Want to delete your account?</strong> Email us with the subject line &quot;Delete my account&quot; from your registered email address. We&apos;ll confirm deletion within 7 business days. Your diagrams remain exportable for 30 days before permanent deletion.
          </div>

        </article>
      </div>

      <LegalFooter />
    </div>
  );
};

export default PrivacyPage;
