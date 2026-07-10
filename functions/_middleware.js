// Cloudflare Pages middleware — runs on EVERY request before any route is served.
//
// Responsibilities (in order):
//   1. Canonical redirect  — force *.pages.dev and www. to cloudcanvas.co
//   2. Geo controls        — hard-block countries on the deny-list; log rest
//   3. IP rate limiting    — per-endpoint sliding-window limits for /api/*
//   4. Attach diagnostic headers to responses so admins can debug
//
// Enterprise-grade defence baseline. Complements (does NOT replace) Cloudflare
// dashboard rules — for site-wide protection also add WAF + Rate Limiting Rules
// in the Cloudflare dashboard.

const CANONICAL_HOST = 'cloudcanvas.co';

// ── Geo policy ───────────────────────────────────────────────────────────
// Country codes come from Cloudflare's `request.cf.country` (ISO-3166-1 alpha-2).
// Empty deny list = allow everyone. Empty allow list = allow everyone except deny.
//
// Sanctions-heavy defaults. Adjust to your business need.
const GEO_DENY = new Set([
  // OFAC / high-risk (edit to match your compliance stance)
  'KP', // North Korea
  'IR', // Iran
  'SY', // Syria
  'CU', // Cuba
]);
// If populated, ONLY these are allowed (soft mode: leave empty for global access)
const GEO_ALLOW = new Set([]);

// ── Rate limit rules ─────────────────────────────────────────────────────
// Per-IP sliding window. Match longest-prefix first.
// { path: URL path prefix, window: seconds, max: requests }
const RATE_LIMITS = [
  { path: '/api/verify-captcha',      window: 60,  max: 20  },   // 20/min per IP
  { path: '/api/razorpay-create-order', window: 60,  max: 10  }, // 10/min
  { path: '/api/razorpay-verify-payment', window: 60,  max: 20 },
  { path: '/api/',                    window: 60,  max: 60  },   // fallback for other API routes
];
// Global emergency valve — any single IP hitting this in 60s is silenced
const HARD_CEILING = { window: 60, max: 300 };

// ── In-memory sliding-window store ───────────────────────────────────────
// Cloudflare Workers reuse instances briefly, so this store lives long enough
// to catch burst abuse from a single client. For strict cross-worker consistency
// a Durable Object or KV binding is needed — that requires user-side setup.
const HITS = new Map();   // key: `${ip}::${bucket}`  → array of timestamps (ms)

function tick(ip, bucket, windowSec, maxHits) {
  const key = `${ip}::${bucket}`;
  const now = Date.now();
  const cutoff = now - windowSec * 1000;
  let stamps = HITS.get(key) || [];
  // drop old
  stamps = stamps.filter(t => t > cutoff);
  stamps.push(now);
  HITS.set(key, stamps);
  // Periodic cleanup — cap map growth
  if (HITS.size > 5000) {
    for (const [k, v] of HITS) {
      if (v.length === 0 || v[v.length - 1] < cutoff) HITS.delete(k);
    }
  }
  return {
    count: stamps.length,
    limited: stamps.length > maxHits,
    resetAt: stamps[0] + windowSec * 1000,
  };
}

function pickRateLimit(pathname) {
  for (const rule of RATE_LIMITS) {
    if (pathname.startsWith(rule.path)) return rule;
  }
  return null;
}

// ── Response helpers ─────────────────────────────────────────────────────
function reject(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

function attachDiagnostics(res, info) {
  const h = new Headers(res.headers);
  if (info.country) h.set('X-CCD-Country', info.country);
  if (info.rateLimit) {
    h.set('X-RateLimit-Limit',     String(info.rateLimit.max));
    h.set('X-RateLimit-Remaining', String(Math.max(0, info.rateLimit.max - info.rateLimit.count)));
    h.set('X-RateLimit-Reset',     String(Math.floor(info.rateLimit.resetAt / 1000)));
  }
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}

// ── Main handler ─────────────────────────────────────────────────────────
export const onRequest = async (context) => {
  const { request } = context;
  const url  = new URL(request.url);
  const host = url.hostname.toLowerCase();

  // ── 1. Canonical redirect ─────────────────────────────────────────────
  if (host.endsWith('.pages.dev')) {
    const target = `https://${CANONICAL_HOST}${url.pathname}${url.search}${url.hash}`;
    return new Response(null, {
      status: 301,
      headers: {
        Location: target,
        'Cache-Control': 'public, max-age=3600',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }
  if (host === `www.${CANONICAL_HOST}`) {
    const target = `https://${CANONICAL_HOST}${url.pathname}${url.search}${url.hash}`;
    return new Response(null, {
      status: 301,
      headers: { Location: target, 'Cache-Control': 'public, max-age=3600' },
    });
  }

  // ── 2. Geo controls (only enforce on /api/* to avoid blocking static assets) ─
  //     Cloudflare provides country + region on `request.cf`.
  const country = request.cf?.country
                || request.headers.get('cf-ipcountry')
                || 'XX';
  const isApi = url.pathname.startsWith('/api/');

  if (isApi) {
    if (GEO_ALLOW.size > 0 && !GEO_ALLOW.has(country)) {
      return reject(451, {
        error: 'geo-not-permitted',
        message: 'This service is not available in your region.',
        country,
      }, { 'X-CCD-Country': country });
    }
    if (GEO_DENY.has(country)) {
      return reject(451, {
        error: 'geo-blocked',
        message: 'Access from your region is blocked for compliance reasons.',
        country,
      }, { 'X-CCD-Country': country });
    }
  }

  // ── 3. Rate limiting (per-IP) ────────────────────────────────────────────
  let rateInfo = null;
  if (isApi) {
    const ip = request.headers.get('CF-Connecting-IP')
             || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
             || 'unknown';

    // Hard ceiling — same IP hitting API too many times in 60s
    const ceiling = tick(ip, 'hard-ceiling', HARD_CEILING.window, HARD_CEILING.max);
    if (ceiling.limited) {
      return reject(429, {
        error: 'rate-limited',
        message: 'Too many requests. Please slow down.',
        retryAfterSec: Math.max(1, Math.ceil((ceiling.resetAt - Date.now()) / 1000)),
      }, {
        'Retry-After': String(Math.max(1, Math.ceil((ceiling.resetAt - Date.now()) / 1000))),
        'X-CCD-Country': country,
      });
    }

    // Per-endpoint bucket
    const rule = pickRateLimit(url.pathname);
    if (rule) {
      const bucketKey = `bucket:${rule.path}`;
      const stat = tick(ip, bucketKey, rule.window, rule.max);
      rateInfo = { max: rule.max, count: stat.count, resetAt: stat.resetAt };
      if (stat.limited) {
        return reject(429, {
          error: 'rate-limited',
          endpoint: rule.path,
          message: `Too many requests to ${rule.path}. Please wait a moment.`,
          retryAfterSec: Math.max(1, Math.ceil((stat.resetAt - Date.now()) / 1000)),
        }, {
          'Retry-After':       String(Math.max(1, Math.ceil((stat.resetAt - Date.now()) / 1000))),
          'X-RateLimit-Limit': String(rule.max),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.floor(stat.resetAt / 1000)),
          'X-CCD-Country':     country,
        });
      }
    }
  }

  // ── 4. Continue and attach diagnostic headers ───────────────────────────
  const res = await context.next();
  return attachDiagnostics(res, { country, rateLimit: rateInfo });
};
