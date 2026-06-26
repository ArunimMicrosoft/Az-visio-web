// Shared security middleware for Cloudflare Pages Functions
// Provides: rate limiting (in-memory per worker isolate), origin validation,
// body size caps, and minimal CORS handling.

const ALLOWED_ORIGINS = new Set([
  'https://cloudcanvas.co',
  'https://www.cloudcanvas.co',
  'https://cloudcanvas.pages.dev',
  'http://localhost:5173', // local dev
  'http://localhost:8788', // wrangler pages dev
]);

const MAX_BODY_BYTES = 8 * 1024; // 8 KB — way more than we need for our payloads

// Per-isolate ring buffer for naive rate limit fallback when KV not available.
// (Cloudflare workers can be replicated, so use Durable Object or KV for prod-grade.)
const _windowMs = 60_000;
const _maxReqs = 30; // 30 req / min / IP per isolate
const _hits = new Map(); // ip -> [timestamps]

export function isAllowedOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true; // same-origin / curl / server-to-server
  return ALLOWED_ORIGINS.has(origin);
}

export function corsHeaders(request) {
  const origin = request.headers.get('Origin');
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://cloudcanvas.co';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '600',
    'Vary': 'Origin',
  };
}

export function rateLimit(request) {
  const ip =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    'unknown';
  const now = Date.now();
  const list = (_hits.get(ip) || []).filter((t) => now - t < _windowMs);
  if (list.length >= _maxReqs) return { allowed: false, retryAfter: _windowMs / 1000 };
  list.push(now);
  _hits.set(ip, list);
  return { allowed: true };
}

export function jsonResponse(status, body, request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
      ...corsHeaders(request),
    },
  });
}

export async function readJsonBody(request) {
  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Content-Type must be application/json');
  }
  const buf = await request.arrayBuffer();
  if (buf.byteLength > MAX_BODY_BYTES) {
    throw new Error('Request body too large');
  }
  try {
    return JSON.parse(new TextDecoder().decode(buf));
  } catch {
    throw new Error('Invalid JSON in request body');
  }
}

export function preflight(request) {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders(request),
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
