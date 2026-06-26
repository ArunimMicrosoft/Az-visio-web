// Terms of Service — Cloud Canvas Designer
import React, { useEffect } from 'react';
import { LegalHeader, LegalFooter } from './LegalLayout';
import './LegalPage.css';

const TermsPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const lastUpdated = 'May 9, 2026';

  return (
    <div className="legal-page">
      <LegalHeader />

      <section className="legal-hero">
        <div className="legal-hero-inner">
          <span className="legal-hero-badge">📄 LEGAL</span>
          <h1>Terms of Service</h1>
          <div className="legal-hero-meta">Last updated: {lastUpdated}</div>
        </div>
      </section>

      <div className="legal-container">
        <article className="legal-body">

          <div className="legal-toc">
            <h4>On this page</h4>
            <ol>
              <li><a href="#acceptance">1. Acceptance</a></li>
              <li><a href="#service">2. The Service</a></li>
              <li><a href="#account">3. Your Account</a></li>
              <li><a href="#plans">4. Subscription Plans & Billing</a></li>
              <li><a href="#trial">5. Free Trial</a></li>
              <li><a href="#refunds">6. Refunds & Cancellations</a></li>
              <li><a href="#use">7. Acceptable Use</a></li>
              <li><a href="#content">8. Your Content</a></li>
              <li><a href="#ip">9. Intellectual Property</a></li>
              <li><a href="#third-party">10. Third-Party Services</a></li>
              <li><a href="#disclaimer">11. Disclaimer of Warranties</a></li>
              <li><a href="#liability">12. Limitation of Liability</a></li>
              <li><a href="#indemnity">13. Indemnification</a></li>
              <li><a href="#termination">14. Termination</a></li>
              <li><a href="#changes">15. Changes to These Terms</a></li>
              <li><a href="#law">16. Governing Law</a></li>
              <li><a href="#contact">17. Contact</a></li>
            </ol>
          </div>

          <div className="legal-callout">
            <strong>Plain-English summary:</strong> Cloud Canvas Designer is a SaaS tool for designing Azure architecture diagrams. By using it, you agree to use it lawfully, not abuse our service, pay for what you subscribe to, and accept that we provide it "as is" without unlimited liability. Refunds within 7 days for first-time subscribers. We can suspend abuse. India law applies.
          </div>

          <h2 id="acceptance">1. Acceptance of these Terms</h2>
          <p>These Terms of Service (the "<strong>Terms</strong>") form a binding agreement between you ("<strong>you</strong>", "<strong>User</strong>") and Arunim&apos;s IT Café ("<strong>we</strong>", "<strong>us</strong>", "<strong>Cloud Canvas Designer</strong>") regarding your use of the <code>cloudcanvas.co</code> website and all related applications, APIs, and services (collectively the "<strong>Service</strong>").</p>
          <p>By creating an account, clicking "I agree", or otherwise accessing or using the Service, you accept these Terms and our <a href="/privacy">Privacy Policy</a>. If you do not agree, do not use the Service.</p>
          <p>If you use the Service on behalf of an organization, you represent that you have authority to bind that organization, and "you" includes both you personally and that organization.</p>

          <h2 id="service">2. The Service</h2>
          <p>Cloud Canvas Designer provides a web-based visual editor to design Microsoft Azure cloud architecture diagrams, validate them against the Azure Well-Architected Framework, estimate costs via the public Azure Retail Prices API, and export to Terraform / Bicep / ARM / PNG / PDF formats.</p>
          <p>The Service is provided as a software-as-a-service product. You access it via your web browser; no software installation is required.</p>

          <h2 id="account">3. Your Account</h2>
          <ul>
            <li>You must be at least 13 years old to create an account. If you are between 13 and 18, you must have parental or guardian consent.</li>
            <li>You agree to provide accurate, current, and complete information.</li>
            <li>You are responsible for keeping your password confidential and for all activity under your account.</li>
            <li>One person or legal entity per account. Sharing credentials is prohibited.</li>
            <li>You must notify us promptly at <a href="mailto:arunimpandey2903@hotmail.com">arunimpandey2903@hotmail.com</a> if you suspect unauthorized access.</li>
          </ul>

          <h2 id="plans">4. Subscription Plans & Billing</h2>
          <p>We offer the following paid plans (prices in INR; equivalent USD shown is approximate and may vary with exchange rates):</p>
          <table>
            <thead>
              <tr><th>Plan</th><th>Price (INR/month)</th><th>Billing</th></tr>
            </thead>
            <tbody>
              <tr><td>Starter</td><td>₹499</td><td>Monthly, prepaid</td></tr>
              <tr><td>Professional</td><td>₹2,000</td><td>Monthly, prepaid</td></tr>
              <tr><td>Enterprise</td><td>₹6,699</td><td>Monthly, prepaid</td></tr>
            </tbody>
          </table>
          <p>Payments are processed by <strong>Razorpay Software Private Limited</strong>, a PCI-DSS Level 1 certified payment processor. We do not see or store your card or bank details.</p>
          <p>Plans renew automatically each billing cycle until you cancel. Taxes (if applicable) are added at checkout based on your billing region. You can cancel at any time from your account; cancellation takes effect at the end of the current billing cycle.</p>

          <h2 id="trial">5. Free Trial</h2>
          <p>New accounts receive a 7-day free trial with limited features (up to 3 diagrams, 5 PNG exports, watermark on exports). No payment information is required to start a trial. The trial ends automatically after 7 days; you can upgrade at any time during or after the trial.</p>

          <h2 id="refunds">6. Refunds & Cancellations</h2>
          <p><strong>7-day refund window (first-time subscribers only):</strong> If you subscribe to a paid plan for the first time and are not satisfied, request a refund within 7 days of the initial charge by emailing <a href="mailto:arunimpandey2903@hotmail.com">arunimpandey2903@hotmail.com</a>. We will refund the full amount via the original payment method within 5–10 business days.</p>
          <p><strong>Standard cancellations:</strong> You may cancel any time. Cancellation stops future renewals; we do not pro-rate the current billing cycle.</p>
          <p><strong>Exclusions:</strong> Refunds are not available for accounts terminated under Section 14 (Acceptable Use violations), for fraudulent chargebacks, or after the 7-day window has elapsed.</p>

          <h2 id="use">7. Acceptable Use</h2>
          <p>You agree NOT to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose or in violation of any applicable laws or regulations.</li>
            <li>Reverse engineer, decompile, or disassemble any part of the Service.</li>
            <li>Use scrapers, bots, or automated tools to access the Service except as expressly permitted by our public APIs (if any).</li>
            <li>Attempt to gain unauthorized access to other users&apos; accounts or our infrastructure.</li>
            <li>Interfere with or disrupt the Service, including DDoS attacks, vulnerability scanning without permission, or sending malware.</li>
            <li>Misrepresent your identity or impersonate any person or entity.</li>
            <li>Use the Service to design infrastructure that itself violates the law or facilitates illegal activity.</li>
            <li>Resell, sublicense, or commercially redistribute access to the Service without our written consent.</li>
            <li>Generate or upload content that is illegal, infringing, defamatory, obscene, harassing, or hateful.</li>
          </ul>
          <p>We reserve the right to investigate violations and to suspend or terminate accounts at our sole discretion.</p>

          <h2 id="content">8. Your Content</h2>
          <p>You retain all ownership of architecture diagrams, exports, project names, and other content you create on the Service (your "<strong>User Content</strong>").</p>
          <p>You grant us a limited, worldwide, royalty-free license to host, store, transmit, process, and display your User Content solely to operate and improve the Service for you. We do not train AI models on your User Content. We do not sell your User Content to third parties.</p>
          <p>You represent that your User Content does not violate any third-party rights and that you have authority to grant the license above.</p>

          <h2 id="ip">9. Intellectual Property</h2>
          <p>All rights, title, and interest in the Service&apos;s software, design, look and feel, templates, our blog content, branding, and trademarks are owned by us or our licensors. Nothing in these Terms transfers ownership of our Intellectual Property to you.</p>
          <p>"Cloud Canvas Designer" and our logos are our trademarks. "Microsoft", "Azure", "Terraform", "Bicep", "ARM", "Razorpay", "Supabase", and other third-party marks are property of their respective owners. We are not affiliated with, endorsed by, or sponsored by Microsoft Corporation, HashiCorp Inc., Razorpay, or Supabase.</p>

          <h2 id="third-party">10. Third-Party Services</h2>
          <p>The Service integrates with the following third-party providers, each governed by its own terms and privacy policy:</p>
          <ul>
            <li><strong>Razorpay</strong> — payment processing (<a href="https://razorpay.com/terms/" target="_blank" rel="noopener noreferrer">terms</a>, <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer">privacy</a>)</li>
            <li><strong>Supabase</strong> — authentication and database hosting</li>
            <li><strong>Cloudflare</strong> — content delivery, DDoS protection, hosting</li>
            <li><strong>Google Analytics</strong> — anonymous usage analytics</li>
            <li><strong>Microsoft Azure Retail Prices API</strong> — public pricing data (no Azure account or credentials required from you)</li>
          </ul>
          <p>We are not responsible for the practices or content of third-party services.</p>

          <h2 id="disclaimer">11. Disclaimer of Warranties</h2>
          <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE.</p>
          <p>We do not warrant that the Service will be uninterrupted, secure, error-free, or that it will meet your specific requirements. <strong>Cost estimates, WAF scores, IaC exports, and any recommendations are advisory only and must be independently verified before production use.</strong></p>

          <h2 id="liability">12. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:</p>
          <ul>
            <li>We will not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, revenue, data, or goodwill.</li>
            <li>Our total cumulative liability for any claim arising out of or relating to the Service is limited to the greater of (a) the amount you paid us in the 12 months preceding the claim, or (b) INR 5,000.</li>
            <li>These limitations apply even if we have been advised of the possibility of such damages, and they apply to all causes of action, including breach of contract, tort, statute, and equity.</li>
          </ul>

          <h2 id="indemnity">13. Indemnification</h2>
          <p>You agree to indemnify, defend, and hold harmless Arunim&apos;s IT Café and its affiliates from any third-party claims, losses, damages, liabilities, costs, and expenses (including reasonable legal fees) arising out of (a) your User Content, (b) your use of the Service in violation of these Terms, (c) your violation of any applicable law, or (d) your infringement of any third-party right.</p>

          <h2 id="termination">14. Termination</h2>
          <p>You may terminate your account at any time from your account settings or by emailing us. We may suspend or terminate your account if (a) you violate these Terms, (b) we are required to by law, or (c) for any reason at our discretion with reasonable notice in the case of free accounts.</p>
          <p>Upon termination, your access ends, but your data is retained for 30 days during which you can request export. After 30 days, we permanently delete your data except as required for legal compliance or backups (max 90 days).</p>

          <h2 id="changes">15. Changes to These Terms</h2>
          <p>We may update these Terms. We will post the new version at <a href="/terms">cloudcanvas.co/terms</a> with an updated &quot;Last updated&quot; date. Material changes will be communicated by email to active subscribers at least 14 days before they take effect. Continued use of the Service after the effective date constitutes acceptance.</p>

          <h2 id="law">16. Governing Law & Disputes</h2>
          <p>These Terms are governed by the laws of India, without regard to conflict-of-law principles. Any dispute arising out of or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the courts located in <strong>New Delhi, India</strong>.</p>
          <p>Before filing any formal claim, you agree to first contact us at <a href="mailto:arunimpandey2903@hotmail.com">arunimpandey2903@hotmail.com</a> and to attempt informal resolution in good faith for at least 30 days.</p>

          <h2 id="contact">17. Contact</h2>
          <p>If you have questions about these Terms, contact us:</p>
          <ul>
            <li>Email: <a href="mailto:arunimpandey2903@hotmail.com">arunimpandey2903@hotmail.com</a></li>
            <li>Web: <a href="https://cloudcanvas.co">https://cloudcanvas.co</a></li>
          </ul>

        </article>
      </div>

      <LegalFooter />
    </div>
  );
};

export default TermsPage;
