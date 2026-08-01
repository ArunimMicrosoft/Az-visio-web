# Weekly Digest Email — One-Time Setup

Everything is deployed. To actually deliver emails, four short steps.

## 1. Add the email_preferences column to Supabase

Open Supabase → SQL Editor → paste and run `docs/ADD_EMAIL_PREFERENCES.sql`.

It's idempotent (safe to run twice) and adds a JSONB column that stores per-user email preferences.

## 2. Generate two secrets

Run this locally to generate random 32-byte hex secrets:

```bash
# CRON_SECRET
openssl rand -hex 32
# UNSUBSCRIBE_SECRET (different value!)
openssl rand -hex 32
```

Or use any random string generator. Keep them somewhere safe.

## 3. Cloudflare Pages env vars

Cloudflare Dashboard → Workers & Pages → your Pages project → **Settings → Environment variables** → **Production**. Add:

| Name | Value | Notes |
|---|---|---|
| `CRON_SECRET` | (secret 1 from above) | Encrypted |
| `UNSUBSCRIBE_SECRET` | (secret 2 from above) | Encrypted |
| `SUPABASE_SERVICE_ROLE_KEY` | (your Supabase service role key) | Encrypted. Found under Supabase → Settings → API |
| `EMAIL_FROM` | `hello@cloudcanvas.co` | Sender address — must be on a domain you own |
| `EMAIL_FROM_NAME` | `Cloud Canvas Designer` | Display name |
| `RESEND_API_KEY` | (optional) | If set, Resend is used instead of MailChannels |

Note: `VITE_SUPABASE_URL` should already be set from earlier.

## 4. GitHub Actions secret

GitHub → your repo → **Settings → Secrets and variables → Actions → New repository secret**. Add:

| Name | Value |
|---|---|
| `CRON_SECRET` | Same value as in step 3 |

## Sender DNS (SPF / DKIM)

For emails to land in inboxes (not spam), the sender domain needs proper DNS. Two options:

### If using Resend (recommended)
- Sign up at https://resend.com (free tier: 100 emails/day).
- Add `cloudcanvas.co` as a verified domain.
- Resend gives you 3 DNS records to add (SPF, DKIM, MX). Add them via your Cloudflare DNS.

### If using MailChannels (fallback, no signup)
Add these DNS records at your DNS provider (Cloudflare DNS for `cloudcanvas.co`):

```
TXT  cloudcanvas.co                v=spf1 a mx include:relay.mailchannels.net ~all
TXT  _mailchannels.cloudcanvas.co  v=mc1 cfid=<your-cloudflare-pages-project>.pages.dev
```

Replace `<your-cloudflare-pages-project>` with your actual Pages project subdomain.

## Test it

### Health check
```
GET https://cloudcanvas.co/api/cron/weekly-digest
```
Returns `{ "ok": true, "configured": { ... } }`. Every `configured.*` flag should be `true`.

### Dry-run (no actual emails sent)
```
POST https://cloudcanvas.co/api/cron/weekly-digest
Authorization: Bearer <CRON_SECRET>
Content-Type: application/json

{ "dryRun": true }
```

### Single-user test
```
POST https://cloudcanvas.co/api/cron/weekly-digest
Authorization: Bearer <CRON_SECRET>
Content-Type: application/json

{ "email": "your.own@email.com" }
```
Check your inbox after ~10 seconds.

### Trigger from GitHub Actions manually
GitHub → Actions → Weekly Digest Email → **Run workflow** → set `dryRun: true` first to verify wiring.

## Schedule

The cron runs every Monday at 03:30 UTC (09:00 IST). To change, edit the cron expression in `.github/workflows/weekly-digest.yml`.

## Unsubscribe flow

Every digest email has an unsubscribe link:
```
https://cloudcanvas.co/api/email-unsubscribe?token=<HMAC-signed>
```

One click sets `profiles.email_preferences.weekly_digest = false` for that user. Tokens are signed with `UNSUBSCRIBE_SECRET` and are valid for 60 days from generation.

## Troubleshooting

- **Health check shows `configured: false` for something** → env var missing on Cloudflare Pages. Add it.
- **`Supabase 401`** → `SUPABASE_SERVICE_ROLE_KEY` is wrong or missing.
- **`sent: 0, failed: N`** with `RESEND_API_KEY` set → your Resend domain isn't verified yet.
- **Emails land in spam** → DNS records aren't propagated yet (up to 24h) or SPF/DKIM misconfigured.
- **GitHub Actions fails 401** → `CRON_SECRET` in GH Actions does not match the one on Cloudflare Pages.
