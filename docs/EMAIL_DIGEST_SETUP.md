# Weekly Digest Email — One-Time Setup

Everything is deployed. To actually deliver emails, four short steps.

## 1. Add the email_preferences column to Supabase

Open Supabase → SQL Editor → paste and run `docs/ADD_EMAIL_PREFERENCES.sql`.

It's idempotent (safe to run twice) and adds a JSONB column that stores per-user email preferences. New signups also set `email_preferences = { weekly_digest: true }` explicitly in the signup flow (`src/utils/supabase.js`).

If the column already existed but some old profiles have `email_preferences = NULL`, run `docs/BACKFILL_OPTIN.sql` (commented out by default — uncomment the UPDATE block to execute).

Also run `docs/ADD_EMAIL_BROADCASTS.sql` once to create the `email_broadcasts` and `email_sends` tables that back the admin broadcast UI and the per-send delivery log. Idempotent.

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

| Name | Required | Notes |
|---|---|---|
| `CRON_SECRET` | yes | Encrypted. Same string as the GH Actions secret below. |
| `UNSUBSCRIBE_SECRET` | yes | Encrypted. Falls back to `CRON_SECRET` if unset. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Encrypted. Supabase → Settings → API. |
| `VITE_SUPABASE_URL` | yes | Already set for other features. |
| `VITE_SUPABASE_ANON_KEY` | yes | Already set. Used by the admin JWT verification call. |
| `EMAIL_FROM` | yes | e.g. `hello@cloudcanvas.co`. Must be a verified Resend domain. |
| `EMAIL_FROM_NAME` | yes | Display name, e.g. `Cloud Canvas Designer`. |
| `RESEND_API_KEY` | yes | Required. Resend is the only supported provider. |
| `ADMIN_EMAILS` | optional | CSV, extends the default admin allowlist used by `/api/test-email` and `/api/admin-broadcast`. |

Note: Resend is now the sole provider. The previous MailChannels fallback was removed because free MailChannels traffic from Cloudflare Pages is no longer accepted. If `RESEND_API_KEY` is unset, the weekly digest and broadcast endpoints return `502` instead of silently succeeding with zero deliveries.

## 4. GitHub Actions secret

GitHub → your repo → **Settings → Secrets and variables → Actions → New repository secret**. Add:

| Name | Value |
|---|---|
| `CRON_SECRET` | Same value as in step 3 |

## Sender DNS (SPF / DKIM)

Sign up at https://resend.com (free tier: 100 emails/day). Add `cloudcanvas.co` as a verified domain. Resend gives you three DNS records (SPF, DKIM, MX) — add them in Cloudflare DNS for the domain. Until the Resend domain is verified, every send returns a 403 from Resend and is logged as `failed` in `email_sends`.

## Test it

### Health check (no auth)
```
GET https://cloudcanvas.co/api/cron/weekly-digest
```
Returns `{ "ok": true, "configured": { ... } }`. Every `configured.*` flag should be `true`.

### Admin probe — single real email
```
GET https://cloudcanvas.co/api/test-email?to=<admin-email>
Authorization: Bearer <supabase_access_token>
```
Fires one real email through Resend and writes a row to `public.email_sends` with `kind='test'`. The admin dashboard "Email Broadcast" tab has a `Send test to me` button that calls this endpoint.

### Dry-run digest (no actual emails sent)
```
POST https://cloudcanvas.co/api/cron/weekly-digest
Authorization: Bearer <CRON_SECRET>
Content-Type: application/json

{ "dryRun": true }
```

### Single-user digest
```
POST https://cloudcanvas.co/api/cron/weekly-digest
Authorization: Bearer <CRON_SECRET>
Content-Type: application/json

{ "email": "your.own@email.com" }
```

### Trigger GH Actions manually
GitHub → Actions → Weekly Digest Email → **Run workflow** → set `dryRun: true` first to verify wiring.

## Schedule

The cron runs every Monday at 03:30 UTC (09:00 IST). To change, edit the cron expression in `.github/workflows/weekly-digest.yml`.

## Unsubscribe flow

Every digest and broadcast email has an unsubscribe link:
```
https://cloudcanvas.co/api/email-unsubscribe?token=<HMAC-signed>
```

One click sets `profiles.email_preferences.weekly_digest = false` for that user. Tokens are signed with `UNSUBSCRIBE_SECRET` and are valid for 60 days from generation.

## Troubleshooting — no emails arriving

1. **Check `email_sends`**. In Supabase: `SELECT sent_at, to_email, kind, status, provider_response_code, error FROM email_sends ORDER BY sent_at DESC LIMIT 20;`. If rows exist with `status='failed'`, the `error` column tells you why (typically unverified domain, missing API key, invalid recipient).
2. **No rows at all?** The send never fired. Check Cloudflare Pages logs for the weekly-digest or admin-broadcast function. Common causes:
   - `RESEND_API_KEY` is missing → endpoint returns `502` with `{ error: "resend_api_key_missing" }`.
   - `SUPABASE_SERVICE_ROLE_KEY` is missing or wrong → `Supabase 401`.
   - `CRON_SECRET` mismatch between GH Actions and Cloudflare → GH Actions run fails with HTTP 401.
3. **Everything says `sent` but inbox is empty** → SPF/DKIM DNS not propagated yet (up to 24h) or the sender domain was never verified in Resend.
4. **GitHub Actions is green but 0 users receive anything** → re-check with `/api/test-email?to=<self>`. The cron now returns HTTP 502 when every real send failed, so this specific "silent green" failure mode is gone, but older runs may have cached expectations.

## Where things live (code map)

- `functions/api/cron/weekly-digest.js` — the cron endpoint.
- `functions/api/test-email.js` — admin probe (single-recipient real send).
- `functions/api/admin-broadcast.js` — admin broadcast dispatcher (async via `ctx.waitUntil`).
- `functions/_shared/emailDelivery.js` — Resend send + `logEmailSend` to `public.email_sends`.
- `functions/_shared/adminAuth.js` — admin JWT gate used by the two admin endpoints.
- `functions/_shared/broadcastTemplate.js` — slim markdown → email HTML for broadcasts.
- `src/components/AdminEmailBroadcast.jsx` — admin dashboard composer UI.
- `src/utils/emailBroadcast.js` — client-side audience counts, broadcast create+dispatch.
