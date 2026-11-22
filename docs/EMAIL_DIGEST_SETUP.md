# Email — One-Time Setup

The admin dashboard is the single source of truth for every scheduled email, broadcast, and probe. Once the setup below is done the owner never has to deploy to change subject lines, body copy, cadence, or the enabled flag — all of that is edited in **Admin → Scheduled Emails**.

## 1. Run the SQL migrations in Supabase

Open Supabase → SQL Editor → paste and run each file once. All three are idempotent.

1. `docs/ADD_EMAIL_PREFERENCES.sql` — adds the `email_preferences` JSONB column to `profiles` so users can opt out of individual email kinds. New signups default to `weekly_digest: true`.
2. `docs/ADD_EMAIL_BROADCASTS.sql` — creates `email_broadcasts` and `email_sends` tables with admin-only RLS. These power the Email Broadcast tab and the per-send delivery log.
3. `docs/ADD_EMAIL_SCHEDULES.sql` — **new**. Creates `email_schedules` with admin-only RLS and seeds the `weekly_digest` row with the current markdown template.

If the column already existed but some old profiles have `email_preferences = NULL`, run `docs/BACKFILL_OPTIN.sql` (commented out by default — uncomment the UPDATE block to execute).

## 2. Generate two secrets

```bash
# CRON_SECRET
openssl rand -hex 32
# UNSUBSCRIBE_SECRET (different value!)
openssl rand -hex 32
```

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
| `ADMIN_EMAILS` | optional | CSV, extends the default admin allowlist used by every admin endpoint. |

If `RESEND_API_KEY` is unset the send endpoints return `502` instead of silently succeeding with zero deliveries.

## 4. GitHub Actions secret

GitHub → repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Name | Value |
|---|---|
| `CRON_SECRET` | Same value as in step 3 |

## 5. Sender DNS (SPF / DKIM)

Sign up at https://resend.com (free tier: 100 emails/day). Add `cloudcanvas.co` as a verified domain. Resend gives you three DNS records (SPF, DKIM, MX) — add them in Cloudflare DNS for the domain. Until the domain is verified, every send is logged as `failed` in `email_sends`.

## Editing the weekly digest (no deploy)

1. Sign in as an admin.
2. Open **Admin Dashboard → ⏰ Scheduled Emails**.
3. Click **✏️ Edit** on the `weekly_digest` row.
4. Change the subject, body (markdown + `{{var}}` tokens), cadence, and enabled flag. The side panel shows a live preview and lists every variable you can use.
5. Save. The next hourly tick will pick up the new template.

The hourly cron (`.github/workflows/weekly-digest.yml`, now hitting `/api/cron/scheduled-emails`) reads every enabled row from `email_schedules`, checks each one's cadence, and dispatches the due ones. Disabling a row in the UI stops sends immediately — no deploy.

## Test end-to-end

### Health check (no auth)
```
GET https://cloudcanvas.co/api/cron/scheduled-emails
```
Every `configured.*` flag should return `true`.

### Admin probe — single real email
From the Admin Dashboard → Email Broadcast → **Send test to me**, or:
```
GET https://cloudcanvas.co/api/test-email?to=<admin-email>
Authorization: Bearer <supabase_access_token>
```

### Dry-run everything
```
POST https://cloudcanvas.co/api/cron/scheduled-emails
Authorization: Bearer <CRON_SECRET>
Content-Type: application/json

{ "dryRun": true, "ignoreDue": true }
```

### Run just the weekly digest (operator-side)
From the Admin Dashboard → Scheduled Emails → **🚀 Run now** on the `weekly_digest` row. Watch `email_sends` fill up and check the admin inbox.

### Legacy URL still works during rollout
```
POST https://cloudcanvas.co/api/cron/weekly-digest
Authorization: Bearer <CRON_SECRET>
```
This now forwards into the same code path as `/api/cron/scheduled-emails?kind=weekly_digest`. The old GitHub Actions cron URL does not break during the rollout window.

## Unsubscribe flow

Every digest and broadcast has an unsubscribe link:
```
https://cloudcanvas.co/api/email-unsubscribe?token=<HMAC-signed>
```
One click sets `profiles.email_preferences.weekly_digest = false` for that user. Tokens are signed with `UNSUBSCRIBE_SECRET` and are valid for 60 days from generation.

## Troubleshooting — no emails arriving

1. **Check `email_sends`.** In Supabase: `SELECT sent_at, to_email, kind, status, provider_response_code, error FROM email_sends ORDER BY sent_at DESC LIMIT 20;`. If rows exist with `status='failed'`, the `error` column tells you why (typically unverified domain, missing API key, invalid recipient).
2. **No rows at all?** The send never fired. Check Cloudflare Pages logs for the scheduled-emails function. Common causes:
   - `RESEND_API_KEY` is missing → endpoint returns `502` with `{ error: "resend_api_key_missing" }`.
   - `SUPABASE_SERVICE_ROLE_KEY` is missing → `Supabase 401`.
   - `CRON_SECRET` mismatch between GH Actions and Cloudflare → GH Actions run fails with HTTP 401.
3. **Everything says `sent` but inbox is empty** → SPF/DKIM DNS not propagated yet (up to 24h) or the sender domain was never verified in Resend.
4. **Schedule row stuck at `last_run_status: empty_audience`** → the audience query returned no users. For `weekly_digest` that's `is_active = true AND login_count >= 1 AND email_preferences allows weekly_digest`. Check that at least one profile matches.

## Where things live (code map)

- `functions/api/cron/scheduled-emails.js` — hourly cron entry point. Iterates `email_schedules`, dispatches due rows.
- `functions/api/cron/weekly-digest.js` — legacy wrapper that forwards to the generic handler scoped to `kind='weekly_digest'`.
- `functions/api/admin-run-schedule.js` — admin "Run now" button endpoint.
- `functions/api/admin-broadcast.js` — admin broadcast dispatcher.
- `functions/api/test-email.js` — admin probe (single-recipient real send).
- `functions/_shared/cadence.js` — pure `isDue` / `nextRun` helpers.
- `functions/_shared/templateRender.js` — pure `renderTemplate` + variable context builder.
- `functions/_shared/emailDelivery.js` — Resend send + `logEmailSend` to `email_sends`.
- `functions/_shared/adminAuth.js` — admin JWT gate used by every admin endpoint.
- `functions/_shared/broadcastTemplate.js` — slim markdown → email HTML.
- `src/components/AdminEmailSchedules.jsx` — admin UI for editing, previewing, running schedules.
- `src/components/AdminEmailBroadcast.jsx` — admin composer for one-off broadcasts.
- `src/utils/emailSchedules.js` — client helpers (list, update, run now).
- `src/utils/emailBroadcast.js` — client helpers (count audience, create, dispatch, test).
