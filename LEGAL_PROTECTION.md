# How Cloud Canvas Designer Protects Its Terms of Service and Privacy Policy

A document is only as strong as its enforcement. This file explains the technical, operational, and legal controls that back up every commitment in `/terms` and `/privacy`. If we say something in our policies, this is how we actually deliver it.

| Layer | Goal | Where it lives |
|---|---|---|
| 1. **Acceptance & evidence** | Prove the user agreed | Signup flow, DB columns, audit logs |
| 2. **Access control** | Enforce account boundaries | Supabase RLS, JWTs, Conditional Access |
| 3. **Data minimization** | Only collect what's needed | Schema, code, third-party scopes |
| 4. **Encryption** | Protect data in transit and at rest | TLS, AWS KMS, password hashing |
| 5. **Payments isolation** | Never see card data | Razorpay tokenization |
| 6. **Audit & traceability** | Prove what happened, when | Audit log table, Cloudflare logs |
| 7. **Anti-abuse** | Stop bad actors | Rate limits, WAF, account lockout |
| 8. **Subject rights** | Honor access / delete / export | Documented workflows |
| 9. **Incident response** | Detect, notify, remediate | Monitoring, 72-hour breach SLA |
| 10. **Legal hygiene** | Keep the terms enforceable | Versioning, communications, governing law |

---

## Layer 1 — Acceptance & Evidence

**What the Terms say:** &quot;By creating an account, you agree to our Terms and Privacy Policy.&quot;

**How it's enforced:**
- The Signup page contains explicit acceptance text linking to live `/terms` and `/privacy` URLs (not `href=&quot;#&quot;` placeholders).
- The user cannot submit the form without seeing this text (it sits directly above the Sign Up button).
- On successful signup, `auditLogs` table records: `event='SIGNUP'`, timestamp, IP (via Cloudflare `CF-Connecting-IP`), device fingerprint, terms version. This is our cryptographic-strength evidence if ever challenged.
- A user who deletes cookies and signs up again creates a fresh row — we never overwrite prior acceptance records.
- Terms and Privacy pages display the &quot;Last updated&quot; date prominently. When the date changes materially, we email active subscribers 14 days in advance and require re-acceptance for changes that expand obligations.

**Code references:**
- `src/pages/SignupPage.jsx` — the acceptance UI
- `src/utils/supabase.js` — `audit_logs` insert during `supabaseSignUp()`
- `docs/ADD_TRACKING_COLUMNS.sql` — schema for audit columns

---

## Layer 2 — Access Control

**What the Terms say:** &quot;One person per account. You are responsible for keeping your password confidential.&quot;
**What Privacy says:** &quot;Users can only read their own data.&quot;

**How it's enforced:**
- **Authentication** — Supabase Auth issues a signed JWT on login. The token claims include `sub` (user ID), `role`, `aud`. Every backend request validates the JWT.
- **Authorization** — Postgres Row-Level Security on every table:
  - `profiles` — `USING (auth.uid() = id)` so a user can only read their own profile.
  - `diagrams` — `USING (auth.uid() = user_id)`.
  - `audit_logs` — read access restricted to admin emails.
  - `share_links` — public-readable but only for the specific share token, never the underlying diagram metadata.
- **Admin-only routes** — `<ProtectedRoute adminOnly={true}>` wraps `/admin`. Admin status is determined by email in the centralized allowlist (`src/utils/adminConfig.js`), not by a client-set flag.
- **Session storage** — `localStorage` with a unique storage key prevents cross-tenant token leaks across apps on the same browser.
- **Password handling** — never logged, never echoed. Supabase Auth uses bcrypt with salt.

**The proof:** Even if a malicious user obtains another user&apos;s JWT or anon key, RLS at the database layer blocks the unauthorized read. Defense in depth — the API and the database both refuse.

---

## Layer 3 — Data Minimization

**What Privacy says:** &quot;We do not collect: Azure credentials, card numbers, biometric data, sensitive personal data.&quot;

**How it's enforced:**
- **No Azure SDK integration** — the application never asks for or accepts Azure subscription credentials, service principals, or tenant IDs. The only Azure-side call is to the public Retail Prices API which requires no authentication.
- **No card collection UI** — payment forms are rendered by Razorpay&apos;s embedded iframe; our HTML/JS never sees the card field DOM.
- **Schema-level enforcement** — the `profiles` table has only: `id`, `email`, `name`, `role`, `subscription_tier`, `trial_*`, counters, `is_active`, timestamps. There is no column for SSN, government ID, DOB, etc. — making it physically impossible to store sensitive PII.
- **Google Analytics** is configured with IP anonymization, no ad personalization, and no demographic reports.
- **Diagram content** is treated as opaque blobs. We don&apos;t parse, classify, or run AI on diagram contents.

---

## Layer 4 — Encryption

**What Privacy says:** &quot;TLS 1.2+ everywhere, HSTS preloaded, AWS KMS at rest, bcrypt passwords.&quot;

**How it's enforced:**
- **In transit:**
  - Cloudflare proxies all traffic with TLS 1.2 minimum (TLS 1.3 preferred).
  - `public/_headers` sets `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.
  - All client-side fetches use `https://` schemes; the CSP `upgrade-insecure-requests` directive forces it.
- **At rest:**
  - Supabase Postgres data is encrypted by AWS KMS at the storage layer.
  - Backups inherit the same encryption.
- **Password hashing:**
  - bcrypt with cost factor 10 (Supabase default; adjustable).
  - Passwords are never written to application logs, audit records, or error traces.
- **Secrets:**
  - Server-only secrets (Razorpay key secret, Supabase service role) are stored as Cloudflare Pages Encrypted Variables.
  - Public values (Supabase URL, anon key, Razorpay key ID) are fine to ship in the bundle by design.

---

## Layer 5 — Payments Isolation

**What the Terms say:** &quot;Payments are processed by Razorpay. We do not see or store your card or bank details.&quot;

**How it's enforced:**
- The payment flow opens Razorpay&apos;s **hosted iframe** (`checkout.razorpay.com/v1/checkout.js`). Card input fields exist only inside their iframe, isolated from our DOM by the browser&apos;s same-origin policy.
- Our backend only receives:
  - `razorpay_payment_id` (a token, not the card)
  - `razorpay_order_id` (server-generated reference)
  - `razorpay_signature` (HMAC proof)
- The signature is verified with **constant-time HMAC-SHA256 comparison** to prevent timing-based key recovery. See `functions/api/razorpay-verify-payment.js`.
- **Scope reduction:** because we never touch primary account numbers (PANs), our PCI-DSS scope is dramatically reduced. We are a &quot;SAQ A&quot; merchant — the least-onerous PCI category — by design.
- Razorpay holds the actual PCI burden. They are PCI-DSS Level 1 certified.

---

## Layer 6 — Audit & Traceability

**What Privacy says:** &quot;Every login, signup, plan change, and admin action is logged.&quot;

**How it's enforced:**
- `audit_logs` table records every security-relevant event:
  - `SIGNUP`, `LOGIN`, `LOGIN_FAILED`, `LOGOUT`, `PASSWORD_RESET`
  - `PLAN_UPGRADE`, `PLAN_DOWNGRADE`, `PAYMENT_SUCCESS`, `PAYMENT_FAILED`
  - `ADMIN_BAN_USER`, `ADMIN_REVOKE_PLAN`, `ADMIN_SAVE_NOTE`
  - `EXPORT_PNG`, `EXPORT_PDF`, `EXPORT_TERRAFORM`, etc.
- Each row carries: `user_id`, `email`, `event`, `details JSONB`, `ip`, `user_agent`, `device_info`, `created_at`.
- IP comes from `1.1.1.1/cdn-cgi/trace` (Cloudflare reverse-trace) with a fallback to `api.ipify.org`. This survives proxy chains.
- Cloudflare retains 30 days of edge logs which complement application logs.
- Retention: 1 year of full detail, then anonymized for analytics.

If a user later disputes a transaction, claims their account was hacked, or files a privacy complaint, we can produce a forensic timeline backed by this table.

---

## Layer 7 — Anti-Abuse

**What the Terms say:** &quot;You agree not to: reverse engineer, scrape, attack our infrastructure, impersonate others...&quot;

**How it's enforced:**
- **Cloudflare WAF** — Managed Rules ruleset blocks OWASP Top 10 patterns: SQLi, XSS, RFI, LFI, command injection. Configured in the Cloudflare dashboard.
- **Bot Fight Mode** — Cloudflare auto-challenges known bot UAs.
- **Custom WAF rules** block:
  - User agents containing `sqlmap`, `nikto`, `masscan`, etc.
  - Requests bypassing the canonical domain by hitting `cloudcanvas.pages.dev` directly.
  - Non-`POST`/`OPTIONS` methods on `/api/*`.
- **Rate limits:**
  - Per-IP, per-endpoint inside Pages Functions (`functions/_shared/security.js`).
  - Supabase Auth: 5 sign-ins / 5 min / IP, 5 sign-ups / 60 min / IP, 3 password resets / 60 min / email.
  - Cloudflare Rate Limiting Rules on `/api/razorpay-*` (10K events/month free).
- **Account lockout** in `AuthContext` — N consecutive failed logins flag the account, force a captcha or admin unlock.
- **Input validation** — every API endpoint validates with strict regex (e.g., `paymentId` must match `^pay_[a-zA-Z0-9]{10,30}$`, amount is a bounded integer, plan name is in an allowlist).

---

## Layer 8 — Subject Rights (Access / Erasure / Export)

**What Privacy says:** &quot;You have the right to access, rectify, erase, and port your data. We respond within 30 days.&quot;

**How it's enforced operationally:**
- **Access request** — `arunimpandey2903@hotmail.com` is the documented intake email. Within 7 business days we generate a JSON dump from Supabase covering: `profiles` row, all `diagrams` rows, `audit_logs` rows tagged with the user&apos;s ID, and any `share_links`.
- **Erasure (Right to be forgotten)** — three-step process:
  1. Soft-delete: set `is_active=false`, `email=hash(email)+@deleted.local`, anonymize `name`.
  2. After 30 days (export grace period), hard-delete the row and cascade to `diagrams`.
  3. Audit log entries are retained but with `user_id` replaced by a one-way hash so admin forensics remains possible without identifying the person.
- **Portability** — users can export their diagrams as JSON from the UI directly; a full account export is delivered by email on request.
- **Rectification** — display name, email (with re-verification), and password are user-editable in account settings.
- **Withdrawal of consent for analytics** — users can disable Google Analytics via browser DNT / consent banners (planned), and we honor `Do Not Track: 1`.

---

## Layer 9 — Incident Response

**What Privacy says:** &quot;If a breach affects you, we will notify within 72 hours of becoming aware.&quot;

**How it's enforced:**
- **Detection sources:**
  - Cloudflare Sentinel-equivalent logs (failed challenges, attack patterns).
  - Supabase Database Logs (suspicious bulk queries).
  - Defender for Cloud-equivalent: GitHub secret scanning, Dependabot, CodeQL scans on every push.
- **Triage SLA:**
  - Sev-1 (active exploitation, data exfiltration): contain within 1 hour.
  - Sev-2 (vulnerability with no active exploitation): patch within 24 hours.
  - Sev-3 (theoretical / low risk): patch within 30 days.
- **Notification:**
  - GDPR / DPDP Act-compliant 72-hour notification window for any breach involving personal data.
  - Notification sent via email to all affected users with: incident summary, data affected, mitigations, recommendations.
- **Documentation:** post-incident writeup published privately and shared with affected users.

---

## Layer 10 — Legal Hygiene

**What the Terms say:** &quot;We may update these Terms… material changes communicated 14 days before they take effect… governed by India law, courts of New Delhi.&quot;

**How it's enforced:**
- **Versioning** — every meaningful Terms/Privacy update bumps the &quot;Last updated&quot; date in the JSX. Old versions are kept in git history with the commit hash serving as an immutable timestamped reference.
- **Communication** — Supabase email broadcast to subscribers 14 days before any material change; a banner on the app warns logged-in users on first login post-change.
- **Forum selection** — disputes go to courts in New Delhi (the operator&apos;s base of operations). This is both a legal anchor and a practical filter — anyone filing a frivolous foreign suit faces a forum-non-conveniens obstacle.
- **Liability cap** — explicit max liability at the greater of 12 months of fees or INR 5,000. Without this, downstream consequential damages could exceed the entire revenue of the product.
- **Indemnity** — users who misuse the Service or upload infringing content carry the legal cost, not us.

---

## What we DO NOT do (commitments)

These restrictions are enforced by absence in the codebase. There is nothing to misuse because nothing is built.

- No AI training on user content. There is no pipeline writing diagram JSON into a model training corpus.
- No data sale to brokers. There is no integration with any data broker API or pixel.
- No retargeting / advertising. Our analytics is Google Analytics in &quot;privacy-friendly&quot; mode with no remarketing tags.
- No silent metadata harvesting. Every column collected is documented in the Privacy Policy data table.
- No dark patterns for cancellation. Subscriptions can be cancelled from the account page in two clicks.

---

## Continuous compliance

Quarterly:
- Re-audit RLS policies on every Supabase table.
- Rotate Razorpay key secret and Supabase service role key.
- Review audit logs for unusual admin activity.
- Confirm Dependabot PRs merged and zero high-severity vulnerabilities open.

Annually:
- External pen-test against the Service.
- Tabletop incident response drill.
- Refresh Terms and Privacy with current regulatory reality (DPDP Act rules, GDPR amendments, etc.).

---

## How to report a violation or concern

| Concern | Where to send |
|---|---|
| Privacy / data subject request | `arunimpandey2903@hotmail.com` (subject line: "Privacy request") |
| Security vulnerability | `arunimpandey2903@hotmail.com` (subject line: "Security disclosure") |
| Abuse / illegal content on the Service | `arunimpandey2903@hotmail.com` (subject line: "Abuse") |
| General legal | `arunimpandey2903@hotmail.com` |

Acknowledgement within 48 hours, substantive response within 7 days (or per regulatory SLA for formal complaints).
