# Deploying Cloud Canvas Designer to Cloudflare Pages (Free)

This guide walks you from "I have the repo on GitHub" to "cloudcanvas.co serves from Cloudflare" in about 20 minutes.

## What you get on the free tier

- Unlimited static bandwidth (vs Azure SWA Free 100 GB/month)
- 100,000 Pages Functions requests per day
- Unlimited custom domains with auto-managed SSL
- 500 build minutes per month
- Cloudflare global CDN + DDoS protection
- Auto-deploys from GitHub on every push to `main`

## What's in the repo now

Files added for Cloudflare:
- `public/_redirects` — SPA fallback so React Router works on direct URLs
- `public/_headers` — security headers + CSP (replaces `staticwebapp.config.json`)
- `functions/api/razorpay-create-order.js` — Pages Function (replaces Azure Function)
- `functions/api/razorpay-verify-payment.js` — Pages Function (replaces Azure Function)
- `wrangler.toml` — local dev + compatibility flags
- `.dev.vars.example` — template for local secrets (copy to `.dev.vars`, never commit)

The old `staticwebapp.config.json` and `/api/*` Azure Functions stay in the repo so you can keep both hosts active during the switch.

## Step 1 — Create the Cloudflare Pages project

1. Sign in at `https://dash.cloudflare.com` (free account).
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Authorize Cloudflare on GitHub. Select repo `ArunimMicrosoft/Az-visio-web`.
4. **Set up builds and deployments:**
   - Project name: `cloudcanvas`
   - Production branch: `main`
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `build`
   - Root directory: (leave blank)
5. **Environment variables (Production)** — click "Add variable" for each:

| Name | Value | Notes |
|---|---|---|
| `NODE_VERSION` | `20` | required to match local |
| `VITE_SUPABASE_URL` | `https://quknseohpwzlbbisgfpi.supabase.co` | (or your value from `.env`) |
| `VITE_SUPABASE_ANON_KEY` | *(your anon key)* | safe to be public |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_SRRAUP26wGg3OF` | public key id |
| `VITE_ADMIN_EMAILS` | `arunimpandey2903@hotmail.com,demo@arunimitcaffe.com` | comma-separated |
| `RAZORPAY_KEY_ID` | same as `VITE_RAZORPAY_KEY_ID` | server-side use |
| `RAZORPAY_KEY_SECRET` | *(your secret)* | **mark as encrypted** |

6. Click **Save and Deploy**. Wait ~2 minutes for the first build.

## Step 2 — Verify the deploy works

After the build finishes:

1. Cloudflare gives you a URL like `https://cloudcanvas.pages.dev` — open it.
2. Hit `/` (landing), `/blog`, `/login`, `/app` (after signup). Confirm pages load.
3. Try the Razorpay flow on a paid plan. The function endpoints should respond.
4. Open browser DevTools → Network tab → confirm `/api/razorpay-create-order` returns 200.

If the API calls 404, double-check the `functions/` folder was deployed (check **Deployments → latest → Functions** in the Cloudflare dashboard).

## Step 3 — Point cloudcanvas.co at Cloudflare Pages

Your domain `cloudcanvas.co` already uses Cloudflare nameservers, so this is just one DNS edit.

1. In Cloudflare dashboard → **Websites** → `cloudcanvas.co` → **DNS** → **Records**.
2. **Delete or note** the existing CNAME pointing to Azure (`purple-pebble-081ef0400.4.azurestaticapps.net`).
3. Back in **Workers & Pages** → `cloudcanvas` project → **Custom domains** → **Set up a custom domain**.
4. Enter `cloudcanvas.co`. Cloudflare auto-creates the CNAME for you.
5. Repeat for `www.cloudcanvas.co`.
6. SSL provisions automatically in 1-5 minutes.

## Step 4 — Update Supabase Site URL

Supabase password-reset and email-confirmation links use the **Site URL** from Supabase project settings.

1. Open `https://supabase.com/dashboard` → your project → **Authentication** → **URL Configuration**.
2. **Site URL:** `https://cloudcanvas.co`
3. **Redirect URLs (allow list)** — add:
   - `https://cloudcanvas.co/*`
   - `https://www.cloudcanvas.co/*`
   - `https://cloudcanvas.pages.dev/*` (Pages preview)
   - `http://localhost:5173/*` (local dev — keep)
4. Save.

## Step 5 — Update Razorpay webhook (if you use one)

If Razorpay calls back to your server, update the webhook URL in the Razorpay dashboard from the Azure URL to `https://cloudcanvas.co/api/...`.

(Currently the app doesn't use Razorpay webhooks for the consumer flow, so you can skip this unless you added one.)

## Step 6 — Decommission Azure Static Web Apps (optional)

Only after the Cloudflare site is verified working under `cloudcanvas.co` for a few days:

1. In Azure portal, delete the SWA resource.
2. Delete the SWA from `.github/workflows/` if you want to stop the failing deploys.
3. Keep the `/api/*` Azure Functions code in the repo — costs nothing, and makes rollback easy if needed.

## Local development with Pages Functions

```
# Copy template, paste real test keys
copy .dev.vars.example .dev.vars

# Build the SPA + run wrangler with Pages Functions
npm run build
npm run cf:dev

# Visit http://localhost:8788 — same site, same /api/* routes
```

## Manual deploy (alternative to GitHub auto-deploy)

```
npm run build
npx wrangler login
npm run cf:deploy
```

## Troubleshooting

**API returns 500 with "credentials not configured"**
The `RAZORPAY_KEY_SECRET` env var isn't set, or you set it in the wrong environment (Preview vs Production). Check **Settings → Environment variables** in the Pages project.

**Pages route returns blank page / 404 on refresh**
Make sure `public/_redirects` was published — open `https://cloudcanvas.co/_redirects` in a browser and you should see the file content.

**CSP blocking a resource**
Edit `public/_headers`, redeploy. CSP changes don't require a code change — `_headers` is read fresh each request.

**Build fails on Cloudflare but works locally**
- Check `NODE_VERSION=20` is set
- Cloudflare uses npm by default — your `package-lock.json` must be in the repo

**Custom domain shows "Not configured" forever**
Cloudflare can take up to 24 hours when domain has previous DNS history. Usually it's under 10 minutes. Check **Custom domains** for diagnostic messages.

## Cost expectation

For your current traffic (low hundreds of users/day), Cloudflare Pages free tier will cover everything. The 100K daily Functions request limit is far above what you'd hit unless your traffic 100x's.

If you do hit limits, Pages Pro is $20/month with 10x the limits — still cheaper than Azure SWA Standard at ~$10/month + extras.

## Rollback plan

Both hosts can run side-by-side. If anything breaks on Cloudflare:

1. Revert the DNS CNAME for `cloudcanvas.co` to point back at the Azure SWA URL.
2. The site is live again on Azure in 1-5 minutes.
3. Investigate Cloudflare issue, fix, re-cut DNS.

No code change needed for rollback — the Azure code and the Cloudflare code coexist in the repo.
