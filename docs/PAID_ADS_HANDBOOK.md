# Paid Ads Handbook for Technical Founders

**A no-fluff playbook for growing a B2B technical SaaS with paid acquisition.**

Version 1.0 — Cloud Canvas Designer growth playbook.
Written for engineers who don't want marketing speak.

---

## Contents

1. [The Mental Model](#1-the-mental-model)
2. [Which Channels Work for B2B Technical Products](#2-which-channels-work-for-b2b-technical-products)
3. [The 90-Day Launch Plan](#3-the-90-day-launch-plan)
4. [Technical Setup Checklist](#4-technical-setup-checklist)
5. [Ad Copy Templates](#5-ad-copy-templates)
6. [Landing Page Rules](#6-landing-page-rules)
7. [Metrics and Decision Thresholds](#7-metrics-and-decision-thresholds)
8. [Common Landmines](#8-common-landmines)
9. [Budget Guide](#9-budget-guide)
10. [Emergency Triage](#10-emergency-triage-when-metrics-tank)

Appendices
- [A. Keyword Bank](#appendix-a-keyword-bank)
- [B. LinkedIn Targeting Bank](#appendix-b-linkedin-targeting-bank)
- [C. Weekly Review Template](#appendix-c-weekly-review-template)
- [D. Tool Stack](#appendix-d-tool-stack)

---

## 1. The Mental Model

Ads are a **paid-signal amplifier**. They don't create demand — they capture it, or bring your product to people who match your buyer profile.

They only work when four things are true:
1. Someone is *already* searching for what you sell (search ads) OR matches your buyer profile (social ads).
2. Your ad message matches their intent.
3. Your landing page converts the click into a signup.
4. Your product converts the signup into a paid customer.

If any of the four is broken, ads amplify the leak, not the growth. **Order of operations: fix conversion → then run ads.**

### The 4-step funnel

```
Visitor  →  Signup  →  Trial user  →  Paid customer
```

Every ad campaign should be evaluated against this whole funnel, not just clicks. Optimising for clicks alone is the #1 way technical founders burn ad money.

### Rule of thumb math

For a $6/month product:
- If your **CAC** (Customer Acquisition Cost) is < 3× monthly revenue, you're doing well.
- Target CAC: **< $18** for a $6/mo plan, **< $45** for $15/mo, **< $240** for $80/mo.
- Break-even months = CAC / monthly revenue. Aim for < 6 months.

If those numbers don't add up, either your product isn't ready for paid acquisition or you need to push higher-tier plans.

---

## 2. Which Channels Work for B2B Technical Products

| Channel | Cost/click | Audience quality | When to use |
|---|---|---|---|
| **Google Search Ads** | $3-8 | Very high — they searched for it | Start here. Capture existing demand. |
| **LinkedIn Sponsored** | $8-15 | Highest — filter by job title | Second. Reach buyers who aren't searching yet. |
| **Reddit Ads** | $1-3 | Medium — awareness only | Only if budget allows. Requires native-feeling copy. |
| **Twitter/X Ads** | $2-5 | Low for B2B tools | Skip unless you have organic Twitter reach. |
| **Meta (FB/IG)** | $1-3 | Very low for B2B technical | Skip. |
| **YouTube Ads** | $0.05-0.30/view | Good if you have a demo video | Skip until you have a 30-second demo. |

**The 80/20 rule for technical B2B**: 80% of your budget should be Google Search + LinkedIn. Everything else is optional.

---

## 3. The 90-Day Launch Plan

### Weeks 1-2 — Instrument everything (no spend)

Before spending a rupee, know your baseline.

1. Add Google Analytics 4 (if not already done).
2. Add these events to your app:
   - `sign_up` fires on successful account creation
   - `purchase` fires on successful payment (with amount)
   - `cta_click` fires on landing-page primary CTA click
3. Set up **Google Ads account** at ads.google.com. Verify your domain.
4. Create conversion actions in Google Ads:
   - **Signup** (primary goal, count "one per user")
   - **Purchase** (secondary, count value)
5. Link Google Ads to GA4 (Admin → Property → Product Links).
6. Import GA conversions into Google Ads.
7. Set up **LinkedIn Insight Tag** — single JS snippet in `index.html`. Enables retargeting later.
8. Use the UTM builder — https://ga-dev-tools.google/campaign-url-builder/ — for every ad link.

### Weeks 3-4 — Google Search Ads only ($150-250 budget)

Search ads capture existing demand. This is the highest-ROI place to start.

**Campaign 1: Direct category terms** (bid $2-4/click, daily $8)

Use only Exact `[keyword]` and Phrase `"keyword"` match. Skip Broad match — it wastes money.

**Campaign 2: Terraform/IaC-adjacent terms** (bid $2-4/click, daily $5)

See [Appendix A](#appendix-a-keyword-bank) for the full keyword list.

**Regions**: US, UK, India, Canada, Australia, Germany, Netherlands, Singapore.

**Landing page**: same landing page for now, appended with `?utm_source=google&utm_campaign=...`. You'll build campaign-specific pages in Week 5.

Expected: 40-80 clicks. Even 4-8 signups will tell you if the funnel works.

### Weeks 5-6 — Build campaign-specific landing pages

Cold ad traffic converts 2-3× better on a **campaign-specific landing page** than a general one.

Build one page per major campaign theme:
- `/l/azure-architecture-designer` — targets Azure keyword group
- `/l/terraform-azure` — targets Terraform keyword group
- `/l/azure-waf-validator` — targets LinkedIn Azure Architect audience

Each page must have:
- **One clear headline** matching the ad copy word-for-word
- **One product screenshot** with 2-3 annotations
- **3 bullets max** of the specific value the ad promised
- **One CTA button** — "Start Free Trial" or "Try Free — No Card"
- **No nav, no footer clutter, no blog links** — remove escape routes

Rule: ad copy and landing page headline must be nearly identical. Google Ads rewards this "message match" with lower CPC.

### Weeks 7-8 — Add LinkedIn Sponsored Content ($200/month)

LinkedIn is where Azure Architects and DevOps Engineers hang out professionally. Highest quality traffic; highest cost.

See [Appendix B](#appendix-b-linkedin-targeting-bank) for the full targeting configuration.

**Ad format**: single-image sponsored post with app screenshot + short caption. Avoid emojis in ads on LinkedIn.

Run for at least 2 weeks before judging. LinkedIn's algorithm needs 14 days of data to optimise.

### Weeks 9-12 — Scale or kill

By week 8, you have real data. Use the thresholds in [Section 7](#7-metrics-and-decision-thresholds) to decide:

- Whichever channel wins → double the budget.
- Whichever loses → kill within 7 days.

Don't try to save a losing campaign with "one more tweak". Kill fast, redirect budget.

---

## 4. Technical Setup Checklist

Do all of this **before** spending a rupee on ads.

### Analytics + tracking

- [ ] Google Analytics 4 property created and installed
- [ ] `sign_up` event wired in signup success handler
- [ ] `purchase` event wired in payment success handler with `value` and `currency`
- [ ] `cta_click` event on primary landing-page CTAs (optional)
- [ ] Google Ads account created at ads.google.com
- [ ] Domain verified in Google Ads
- [ ] GA4 linked to Google Ads
- [ ] GA4 conversions imported to Google Ads
- [ ] LinkedIn Insight Tag installed in `<head>` of `index.html`
- [ ] LinkedIn Campaign Manager account created
- [ ] Daily spend caps set on every ad account

### Landing pages

- [ ] At least one campaign-specific landing page (`/l/[campaign]`)
- [ ] Landing page loads in < 2 seconds (test on PageSpeed Insights)
- [ ] Landing page passes Core Web Vitals
- [ ] Signup form works on the landing page directly (no extra click)
- [ ] Mobile responsive verified on real device

### UTM discipline

Every ad link must carry UTM parameters. Use exactly this format:

```
https://cloudcanvas.co/l/azure-architecture-designer
  ?utm_source=google
  &utm_medium=cpc
  &utm_campaign=azure-tools-exact
  &utm_content=headline-v1
  &utm_term=azure+architecture+designer
```

- `utm_source` = `google` | `linkedin` | `reddit` | `twitter`
- `utm_medium` = `cpc` (paid search) | `sponsored` (social) | `display`
- `utm_campaign` = your campaign identifier
- `utm_content` = ad variant (v1, v2, image-a, image-b)
- `utm_term` = the keyword (for search only)

Consistency here is the difference between "we know what works" and "guess and pray".

---

## 5. Ad Copy Templates

### Google Search Ad — Direct category keyword

```
Headline 1: Azure Architecture Designer
Headline 2: WAF-Validated · Live Cost · IaC Export
Headline 3: Free 7-Day Trial · No Card
Description 1: Design Azure architectures visually. 700+ Microsoft
  icons. Real-time validation against all 5 Well-Architected pillars.
Description 2: One-click export to Terraform, Bicep, or ARM. Live
  cost via Azure Retail Prices API. Try free, no credit card.
Sitelinks: [Templates] [Pricing] [Blog] [How It Works]
```

### Google Search Ad — Terraform keyword

```
Headline 1: Diagram → Terraform in One Click
Headline 2: azurerm Provider, All Dependencies
Headline 3: Also Parses Existing .tf Files
Description 1: Design visually, export to production Terraform HCL.
  Auto-includes VNet, NSG, Public IP, and every required dependency.
Description 2: Or paste your existing Terraform and see it as a
  diagram in seconds. Free trial, no card required.
```

### LinkedIn Sponsored Content — Azure Architects

```
Your Azure architecture diagram shouldn't be a screenshot buried in
a Confluence page.

Cloud Canvas Designer:
· Validates every design against Microsoft's Well-Architected Framework
· Estimates live cost via the Azure Retail Prices API
· Exports to production Terraform, Bicep, or ARM in one click
· Reverse-engineers existing Azure subscriptions into a diagram

Trusted by engineering teams who ship architecture as code.
Free 7-day trial — no credit card.

[Image: annotated app screenshot]
[Button: Try Free]
```

### LinkedIn Sponsored Content — DevOps engineers

```
Every DevOps engineer I know has an Azure diagram problem.

Half the team uses Visio. The other half uses Draw.io. Nobody's
diagram matches the Terraform. And the WAF review is a spreadsheet.

Cloud Canvas turns the diagram into a living artifact —
validated, costed, and exportable as production Terraform.

Free trial → [link]
```

### Reddit Ad — Native tone (r/AZURE)

```
Built a visual designer for Azure architectures — validates against
WAF and exports Terraform. Feedback welcome.

[Screenshot]

Been using Visio for Azure diagrams for years and always wanted
something that:
- Knew what Azure services actually exist
- Validated the design against WAF pillars
- Spat out working Terraform / Bicep / ARM

So I built it. Free trial, no card. Would love to hear what breaks
or what's missing.

[link]
```

### Retargeting ad — Visitors who didn't sign up

```
You visited Cloud Canvas Designer but didn't try it out.

We heard the two most common blockers:
1. "I don't have time to learn a new tool" — templates load in 5 seconds
2. "My architecture is too complex" — Discovery imports 500+ resources at once

Free 7-day trial, no credit card. See it for yourself.
[link]
```

---

## 6. Landing Page Rules

Rules I learned the hard way. Every one is enforced on Cloud Canvas Designer.

1. **Message match.** Ad headline and landing page H1 must be nearly identical. If the ad says "Terraform Azure Diagram Generator", the H1 must say almost the same thing. Google Ads reduces your CPC when it sees this alignment.

2. **One goal per page.** A landing page for a paid campaign has ONE conversion action — sign up. No "learn more", no "book demo", no "read the blog". Every extra link is an escape route.

3. **Strip the nav.** Remove header nav on campaign landing pages. Users came from a specific ad; give them nothing to click except the CTA.

4. **Above-the-fold rule.** Headline + one-line value prop + primary CTA button must all be visible without scrolling. On mobile too.

5. **Real screenshot > illustration.** People trust product screenshots more than illustrations. Show the actual app.

6. **Social proof, if you have it.** Even one testimonial with a name and job title beats none. If you don't have testimonials, use logos of companies where users work, or user counts.

7. **Address the objection.** For a free trial, address "no credit card" prominently. For a paid product, address "cancel anytime". These reduce hesitation.

8. **Sub-2-second load time.** Cold ad traffic has near-zero patience. Test on PageSpeed Insights. Preload the hero image.

9. **Mobile-first.** 60%+ of B2B ad traffic is mobile. If it looks bad on your phone, redesign it before spending on ads.

10. **Track sign-up on the landing page itself.** Don't send users to a separate signup page — embed the form on the landing page.

---

## 7. Metrics and Decision Thresholds

The only 5 metrics that matter, and when to kill or scale.

| Metric | Definition | Kill if | Scale if |
|---|---|---|---|
| **CPC** | Cost per click | > $12 | < $4 |
| **CTR** | Click-through rate | < 1% | > 3% |
| **Signup conversion** | Clicks that become signups | < 3% | > 8% |
| **CAC** | Cost per signup | > $50 | < $15 |
| **Trial-to-paid** | Signups that upgrade | < 3% | > 10% |

### The one metric that overrides everything

**CAC : LTV ratio.** LTV = average revenue per paid customer over their lifetime.

- Healthy: LTV / CAC ≥ 3
- Marginal: LTV / CAC between 1 and 3
- Losing money: LTV / CAC < 1

Estimate LTV as: (monthly revenue × average retention months). For a $6/mo product with 12-month average retention, LTV = $72. So CAC must be < $24.

### Reporting cadence

- **Daily** for the first 2 weeks (catch runaway spend early)
- **Weekly** after that (Monday morning is the check-in)
- **Monthly** budget review — kill losers, double winners

---

## 8. Common Landmines

Real mistakes I've seen technical founders make.

**Landmine 1: Broad match keywords.** Google will match your ad to garbage queries and drain the budget. Use ONLY Exact `[keyword]` and Phrase `"keyword"` match until you have significant data.

**Landmine 2: No conversion tracking.** Google Ads optimises for whatever you tell it. Without signup tracking, it optimises for clicks, which is not what you want.

**Landmine 3: Sending ads to the homepage.** Every extra second on your general landing page is a chance to bounce. Ad → focused landing page → signup. That's it.

**Landmine 4: Automated bidding too early.** Google's smart bidding needs 50+ conversions to bid correctly. Until then, use Manual CPC with hard caps.

**Landmine 5: No daily budget cap.** LinkedIn and Google both let you set daily maxes. Set them at 3× your intended daily spend as a safety net. A targeting mistake can nuke your bank account in hours.

**Landmine 6: Testing 5 variables at once.** Test ONE variable per campaign. Otherwise you learn nothing.

**Landmine 7: Judging results after 3 days.** Ad platforms take 2 weeks to learn. Real results start on day 14-21.

**Landmine 8: Optimising for the wrong step.** Optimising for clicks when the problem is signup conversion is like tuning your database when the bottleneck is the network. Fix the actual bottleneck.

**Landmine 9: Cheap traffic that never converts.** Sometimes CPC of $1 sounds great, until you realise those users never sign up. Higher CPC on high-intent keywords beats low CPC on junk queries.

**Landmine 10: Forgetting the retention side.** Getting users is only half the equation. If they leave after month 1, no ad campaign can save the business. Fix retention before doubling ad spend.

---

## 9. Budget Guide

Realistic monthly budgets for a solo technical founder.

### Month 1 — $300 total (learning phase)

- $200 Google Search Ads
- $100 LinkedIn (small test)
- **Goal**: get 30-50 signups. Measure conversion. Don't optimise yet.

### Month 2 — $500 total (if Month 1 showed signups)

- $300 Google Search (double the best-performing keywords)
- $200 LinkedIn
- **Goal**: 60-100 signups. Start seeing 3-5 paid conversions.

### Month 3 — $800 total (only if CAC < $30)

- $500 Google Search
- $200 LinkedIn
- $100 Reddit test
- **Goal**: 120-180 signups. 8-15 paid conversions.

### Stop-loss rule

If after **$500 total spend** you have **zero paid conversions**, STOP. Either the landing page is broken or the product isn't ready for paid acquisition. Don't throw good money at a broken funnel.

### Scaling rule

If CAC is under half your target (e.g. target $20, actual $8), you're leaving growth on the table. Increase budget 50% and monitor for a week. If CAC stays low, increase again. Growth compounds only when you scale winners aggressively.

---

## 10. Emergency Triage (When Metrics Tank)

Something's broken. Diagnose fast.

### Symptom: CPC is climbing

- Check keyword match types — did Google add Broad Match variants?
- Check your Quality Score in Google Ads (Keywords tab → click Quality Score column). Below 7 = ad and landing page don't match well enough.
- Add more negative keywords to filter irrelevant matches.

### Symptom: Clicks are up but signups are flat

- Landing page issue. Check bounce rate in GA.
- Check page speed on PageSpeed Insights.
- Test the signup form on mobile, incognito, real device.
- Check if you're getting bot traffic (Google Ads → Reports → Auction Insights).

### Symptom: Signups happening but nobody upgrades

- Trial-to-paid problem — not an ad problem.
- Interview 5 recent signups: what stopped them from upgrading?
- Check email deliverability of the weekly digest / drip emails.
- Consider shortening the trial (7 days vs 14 days converts differently).

### Symptom: One campaign eats all the budget

- Check "Search Terms" report in Google Ads for that campaign.
- Add negative keywords for irrelevant queries.
- Split the campaign into tighter ad groups.

### Symptom: CAC is fine but revenue is flat

- Users are on the free trial but not upgrading. Focus on trial conversion, not more ads.
- Review pricing tiers — is the paid tier obviously better than the trial?
- Add friction to the free tier (e.g., watermark on exports, cap on cloud saves).

---

## Appendix A: Keyword Bank

Ready-to-paste keyword lists for Google Ads.

### Group 1: Azure architecture / designer
```
[azure architecture designer]
[azure architecture tool]
"draw azure architecture"
"azure diagram tool"
"azure architecture visio alternative"
"azure architecture diagram generator"
"free azure architecture tool"
```

### Group 2: WAF / validation
```
[azure well architected framework tool]
"azure waf validation"
"azure architecture review tool"
"azure well architected review"
"azure reliability check"
"azure security review tool"
```

### Group 3: Terraform Azure
```
"terraform azure diagram"
"azure terraform generator"
"azurerm terraform designer"
"terraform azure architecture"
"visualize terraform azure"
"terraform to diagram azure"
```

### Group 4: Bicep / ARM
```
"bicep to diagram"
"arm template designer"
"azure bicep generator"
"bicep visual editor"
```

### Group 5: Cost estimation
```
"azure cost estimator"
"azure architecture cost"
"azure retail prices api tool"
"azure pricing calculator visual"
```

### Group 6: Discovery / audit
```
"azure resource discovery tool"
"azure architecture audit"
"azure subscription inventory tool"
"reverse engineer azure architecture"
```

### Negative keywords (add these to every campaign)

```
-free download
-crack
-torrent
-tutorial
-training
-course
-certification
-jobs
-salary
-microsoft support
-microsoft partner
```

---

## Appendix B: LinkedIn Targeting Bank

Ready-to-copy targeting parameters for LinkedIn Campaign Manager.

### Job titles (any of)
```
Cloud Architect
Solution Architect
Azure Architect
Enterprise Architect
DevOps Engineer
Platform Engineer
Infrastructure Engineer
Site Reliability Engineer
Cloud Engineer
Systems Architect
Technical Architect
Head of Cloud
VP of Engineering
Director of Infrastructure
CTO
```

### Skills (any of)
```
Microsoft Azure
Terraform
Bicep
Azure DevOps
Azure Kubernetes Service
Azure Well-Architected Framework
Cloud Architecture
Infrastructure as Code (IaC)
Azure Resource Manager
Azure Solutions Architecture
```

### Company filters
```
Company size:    50–10,000
Industries:      Information Technology and Services,
                 Computer Software, Financial Services,
                 Telecommunications, Banking, Insurance,
                 Retail, Manufacturing, Healthcare
```

### Seniority
```
Senior, Manager, Director, VP, C-suite
Exclude: Entry, Training
```

### Geography (start with)
```
United States, United Kingdom, Canada, Australia, Germany,
Netherlands, India, Ireland, Singapore, UAE
```

Result: audience size typically 200k-800k. If smaller than 30k, broaden. If larger than 2M, tighten.

---

## Appendix C: Weekly Review Template

Every Monday morning, 15 minutes. Copy this into a spreadsheet.

| Metric | Last week | This week | Change | Target | Status |
|---|---|---|---|---|---|
| Ad spend | $ | $ | | | |
| Impressions | | | | | |
| Clicks | | | | | |
| CTR | % | % | | > 3% | |
| CPC | $ | $ | | < $4 | |
| Signups | | | | | |
| Signup conv. rate | % | % | | > 8% | |
| CAC | $ | $ | | < $18 | |
| Trial → paid | | | | > 10% | |
| Paid revenue | $ | $ | | | |
| LTV : CAC | | | | > 3× | |

**Decisions this week:**
- Campaigns to kill: _______________
- Campaigns to scale: _______________
- Landing pages to A/B test: _______________
- Blockers / product issues: _______________

---

## Appendix D: Tool Stack

Free and cheap tools that a solo founder actually needs.

| Purpose | Tool | Cost | Notes |
|---|---|---|---|
| Analytics | Google Analytics 4 | Free | Already integrated. |
| Ad management | Google Ads | Pay-per-click | No monthly fee. |
| Social ads | LinkedIn Campaign Manager | Pay-per-click | No monthly fee. |
| UTM builder | ga-dev-tools.google | Free | Bookmark it. |
| Page speed | PageSpeed Insights | Free | Google-owned, matches what Google Ads sees. |
| Rich results test | search.google.com/test/rich-results | Free | For structured data validation. |
| Keyword research | Google Keyword Planner (in Ads) | Free | Requires an active Ads account. |
| Landing page builder | Native (your own React) | Free | You already have React — build in-app. |
| A/B testing | Google Optimize (deprecated) → GA4 experiments | Free | GA4 has native experiments now. |
| Email marketing | Resend | 100/day free | You already set this up for weekly digest. |
| Screenshot annotation | Cleanshot X / Snagit | $30-50 one-time | For ad creative. |
| Ad copy AI | Claude / ChatGPT | $20/mo | For copy variation testing. |

---

## Closing thought

Paid ads are the fastest way to buy answers to questions you're guessing at:

- Do people actually search for what I sell? → Google Ads answers this in 2 weeks.
- Does my landing page convert? → CTR + signup rate answers this in 2 weeks.
- Is my pricing right? → Trial-to-paid % answers this in a month.

Every dollar spent on ads should return **learning + revenue**, in that order. If a campaign teaches you nothing and returns nothing, kill it. If it teaches you something (even negatively) and returns some, keep it running while you fix the funnel.

The founders who succeed with paid ads treat them like a series of controlled experiments, not a magic growth button. Instrument first, spend small, kill fast, scale winners aggressively.

Good luck.

---

*Cloud Canvas Designer · Paid Ads Handbook · Version 1.0*
