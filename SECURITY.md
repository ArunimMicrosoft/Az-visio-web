# Security Posture — Cloud Canvas Designer

This document captures the enterprise security posture for the production deployment of `cloudcanvas.co`. It covers the controls that are in place, what is enforced in code vs configured manually, and what to verify on a rolling basis.

## Threat Model (high-level)

| Adversary | Goal | Primary defense |
|---|---|---|
| Script kiddie | Vandalism, defacement | WAF + rate limit + HSTS |
| Credential stuffer | Account takeover | Bot Fight Mode + Conditional rate limit + Supabase rate limits |
| Payment fraudster | Free upgrade / refund abuse | HMAC verification + idempotency + amount caps |
| DDoS botnet | Knock site offline | Cloudflare DDoS (always on) |
| Insider / supply chain | Backdoor through dep | Dependabot + CodeQL + secret scanning |
| Data scraper | Bulk-pull user data | Supabase RLS + per-IP rate limit |

## Layer 1 — Network Edge (Cloudflare)

### What's automatic (free tier)
- DDoS L3/L4/L7 protection (always-on, no config needed)
- Anycast network — 300+ PoPs absorb traffic
- TLS 1.3 with modern cipher suites
- HTTP/3 / QUIC
- IPv6

### What must be configured manually in Cloudflare dashboard

1. **SSL / TLS → Overview → encryption mode = Full (strict)**
   Prevents downgrade attacks. Origin already serves valid cert.

2. **SSL / TLS → Edge Certificates**
   - Always Use HTTPS: **On**
   - HTTP Strict Transport Security (HSTS): **Enable**
     - Max-Age: 12 months
     - Apply HSTS policy to subdomains: **Yes**
     - Preload: **Yes**
     - No-Sniff Header: **On**
   - Minimum TLS Version: **TLS 1.2**
   - Opportunistic Encryption: **On**
   - TLS 1.3: **On**
   - Automatic HTTPS Rewrites: **On**

3. **Security → WAF → Managed Rules**
   - Enable **Cloudflare Managed Ruleset** (free, OWASP CRS)
   - Set sensitivity: **Medium** (start) → **High** after monitoring

4. **Security → Bots → Bot Fight Mode**
   - Toggle **Bot Fight Mode**: **On**
   - Blocks known bad bots automatically

5. **Security → Settings**
   - Security Level: **Medium**
   - Challenge Passage: **30 minutes**
   - Browser Integrity Check: **On**
   - Privacy Pass support: **On**

6. **Security → Settings → Custom Rules** (free tier allows 5)
   Add these rules:

   | Name | Expression | Action |
   |---|---|---|
   | Block legacy TLS | `ssl.protocol in {"TLSv1" "TLSv1.1"}` | Block |
   | Block known-bad UAs | `http.user_agent contains "sqlmap" or http.user_agent contains "nikto" or http.user_agent contains "masscan"` | Block |
   | Challenge non-standard methods on API | `http.request.uri.path contains "/api/" and not http.request.method in {"GET" "POST" "OPTIONS"}` | Block |
   | Block direct .pages.dev exposure | `http.host eq "cloudcanvas.pages.dev"` | Block (forces traffic through cloudcanvas.co) |
   | Block /api/* from non-allowlisted referers | `http.request.uri.path contains "/api/razorpay" and http.referer ne "" and not http.referer matches "^https://(www\\.)?cloudcanvas\\.co"` | Managed Challenge |

7. **Security → Settings → Rate Limiting Rules** (10K free events/month)
   - Rule: `(http.request.uri.path contains "/api/razorpay-verify-payment")` — 10 req/min/IP — **Block** for 5 min
   - Rule: `(http.request.uri.path contains "/api/razorpay-create-order")` — 5 req/min/IP — **Managed Challenge**

8. **Network → DNSSEC: Enable**
   Prevents DNS hijacking. One-click setup.

9. **DNS → Records**
   - All records have **proxy status = Proxied (orange cloud)** so traffic is filtered by Cloudflare
   - Remove old/unused records (the old Azure CNAME if not already)
   - Add CAA records to lock SSL issuance to Let's Encrypt / Cloudflare only:
     ```
     CAA  cloudcanvas.co  0 issue "letsencrypt.org"
     CAA  cloudcanvas.co  0 issue "pki.goog"
     CAA  cloudcanvas.co  0 issuewild ";"
     CAA  cloudcanvas.co  0 iodef "mailto:arunimpandey2903@hotmail.com"
     ```

10. **Account → Manage Account → Members**
    - **2FA enabled** on the owner account (mandatory)
    - No additional members unless absolutely needed
    - Use API tokens (scoped) instead of Global API Key

## Layer 2 — Application HTTP

Headers configured in `public/_headers` (already deployed):

| Header | Value | Purpose |
|---|---|---|
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` | Force HTTPS 2 yrs, preload-eligible |
| Content-Security-Policy | strict allowlist | Block XSS, data exfil |
| X-Frame-Options | `DENY` | Clickjacking |
| X-Content-Type-Options | `nosniff` | MIME confusion |
| Referrer-Policy | `strict-origin-when-cross-origin` | Limit referer leakage |
| Permissions-Policy | minimal | Disable mic/cam/geo/etc |
| Cross-Origin-Opener-Policy | `same-origin-allow-popups` | Spectre/XS-leaks |
| Cross-Origin-Resource-Policy | `same-site` | Cross-origin read block |
| Server | `cloudcanvas` (decoy) | Hide infrastructure |

Verify after every deploy:
```
curl -sIk https://cloudcanvas.co | grep -iE "strict|content-security|x-frame"
```
Or use https://securityheaders.com → target grade **A+**

## Layer 3 — API (Pages Functions)

Implemented in `functions/_shared/security.js` + per-endpoint logic:

- **Origin allowlist** — only `cloudcanvas.co`, `www.cloudcanvas.co`, `cloudcanvas.pages.dev`, localhost
- **Per-IP rate limit** — 30 req/min/IP per worker isolate (defense in depth on top of Cloudflare rules)
- **Strict Content-Type** + 8 KB body cap
- **Input validation**:
  - `amount` must be integer between 100 paise and 10,00,000 paise
  - `planName` must be allowlisted (`Starter`, `Professional`, `Enterprise`)
  - `customerEmail` matches RFC-ish regex
  - `paymentId` matches `pay_[a-zA-Z0-9]{10,30}`
  - `orderId` matches `order_[a-zA-Z0-9]{10,30}`
  - `signature` matches `[a-f0-9]{64}`
- **HMAC verification** — constant-time compare (prevents timing attacks)
- **Server-side error message stripping** — clients only get generic codes; full detail in `console.error`

## Layer 4 — Identity & Data (Supabase)

Verify in the Supabase dashboard:

### Authentication settings
- **Site URL** = `https://cloudcanvas.co`
- **Email confirmation required** = **On**
- **Secure password change** = **On**
- **Captcha protection** = enable hCaptcha (Supabase Cloud paid plan or free tier ≤ certain RPM)
- **Anonymous sign-ins** = **Off**
- **Allow new sign-ups** = **On** (or off if invite-only)

### Rate limits (Auth → Rate Limits)
- Token refreshes: 30 / 5 min / IP
- Sign-ins: 5 / 5 min / IP
- Sign-ups: 5 / 60 min / IP
- Password reset: 3 / 60 min / email

### RLS audit (Database → Policies)
- Every table: **RLS Enabled** toggle = **On**
- No table has `FOR SELECT TO public USING (true)` without filters
- `profiles` policies use `auth.uid() = id` or admin email subquery
- `diagrams` policies require `auth.uid() = user_id`
- `audit_logs` is admin-only read

### Service role key
- Lives ONLY in server-side Pages Functions secrets (currently unused in Cloudflare since we ported away from `AdminGetUsers`/`AdminFixRLS`)
- **Never** in browser code
- Rotate quarterly

### Storage RLS
- Same as table RLS — every bucket has explicit policies, no public buckets unless intentional

## Layer 5 — Payments (Razorpay)

- **Razorpay Key Secret** stored as **encrypted env var** in Cloudflare Pages (Settings → Variables and Secrets → mark as Secret)
- Never logged, never sent to client
- HMAC verification on every payment in `/api/razorpay-verify-payment`
- Amount range validation (100 paise to 10,00,000 paise)
- Plan allowlist
- Idempotency: Razorpay's order_id acts as natural idempotency key
- Webhook endpoint: not currently used; if added, must verify webhook signature

### Razorpay dashboard hardening
- Login MFA enforced
- Webhook signing secret set (when webhooks added)
- Authorized domains (if available in your plan): `cloudcanvas.co`, `www.cloudcanvas.co`
- IP allowlist on the dashboard if available

## Layer 6 — Supply chain (GitHub)

### Repo settings → Branch protection (main)
- **Require pull request before merging** = **On**
- **Require approvals** = 1 minimum
- **Dismiss stale approvals on new commit** = **On**
- **Require status checks** = include `CodeQL` (after first run)
- **Require conversation resolution** = **On**
- **Do not allow bypassing** the above settings = **On** (no even-admin push to main)

### Repo settings → Security
- **Dependency graph** = **On**
- **Dependabot alerts** = **On**
- **Dependabot security updates** = **On**
- **Dependabot version updates** = **On** (driven by `.github/dependabot.yml`)
- **Secret scanning** = **On**
- **Push protection** = **On** (blocks pushes that contain secrets)
- **CodeQL** = enabled via workflow `.github/workflows/codeql.yml`

### Repo settings → Actions → General
- **Allow GitHub Actions to create / approve PRs** = **Off** (Dependabot PRs need explicit human review)
- **Workflow permissions** = **Read repository contents and packages permissions** (least-priv default)
- Required `permissions:` blocks in every workflow file

### Account security
- 2FA enabled on the GitHub account
- Personal Access Tokens: rotated quarterly, fine-grained where possible
- No SSH keys with `no-touch-required` for hardware tokens

## Layer 7 — Domain & DNS

### Registrar (where cloudcanvas.co was registered)
- **2FA enabled** on the registrar account
- **Registrar lock** (Transfer Prohibited) = **On**
- Email contact = a forwarding alias, not a personal inbox (reduces phishing surface)
- WHOIS privacy = **On**

### Cloudflare DNS
- DNSSEC = **Enabled** (configured at registrar to match)
- CAA records (above) to lock issuers
- All records proxied (orange cloud) except those that legitimately need DNS-only (none in this app)

## Operational Practices

- **Quarterly access review** — Cloudflare members, Supabase admins, GitHub collaborators, Razorpay dashboard users
- **Quarterly secret rotation** — Supabase service role key, Razorpay test keys, GitHub PATs
- **Monthly dependency review** — merge Dependabot PRs after CI green
- **Monthly RLS audit** — confirm no policy regressions in Supabase
- **Annual penetration test** — manual review against OWASP Top 10
- **Logging retention** — Cloudflare Analytics: 30 days free; Supabase audit logs: indefinite
- **Incident response** — documented contact, rollback plan (revert DNS to Azure SWA available)

## How to verify the posture is healthy

Run these checks monthly:

```bash
# Headers grade
curl -sI https://cloudcanvas.co | grep -iE "strict-transport|content-security|x-frame|x-content-type"

# SSL grade (browse to)
https://www.ssllabs.com/ssltest/analyze.html?d=cloudcanvas.co
# Target: A+

# Security headers grade
https://securityheaders.com/?q=cloudcanvas.co
# Target: A+

# DNS posture
https://dnsspy.io/scan/cloudcanvas.co
# Target: A grade, DNSSEC valid

# Open ports (should be 80, 443 only via Cloudflare proxy)
https://www.shodan.io/host/cloudcanvas.co
```

## Reporting a vulnerability

If you discover a vulnerability, email `arunimpandey2903@hotmail.com` with:
- Description of the issue
- Reproduction steps
- Affected endpoints / browsers / versions
- Suggested remediation (optional)

We commit to acknowledging within 48 hours and to a fix or mitigation timeline within 7 days for high-severity issues.

## Out of scope

- Vulnerabilities in third-party CDNs (Razorpay, Google Analytics) — report to those vendors
- Social engineering of staff / users
- Physical attacks
- DoS attempts exceeding Cloudflare's mitigation capacity (escalate via Cloudflare support)
