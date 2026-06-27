// Cloudflare Pages middleware — runs on EVERY request before any route is served.
// Forces visitors to the canonical domain so cloudcanvas.pages.dev is no longer
// publicly browsable.
//
// Why this is needed:
//   Cloudflare WAF / Custom Rules attached to the `cloudcanvas.co` zone cannot
//   inspect traffic that hits `*.pages.dev` directly, because pages.dev belongs
//   to Cloudflare's own zone, not yours. Middleware in functions/ runs server-side
//   on Pages itself, so it does see every hostname.

const CANONICAL_HOST = 'cloudcanvas.co';

export const onRequest = async (context) => {
  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase();

  // Any *.pages.dev hostname → 301 to canonical domain, preserving path/query/hash
  if (host.endsWith('.pages.dev')) {
    const target = `https://${CANONICAL_HOST}${url.pathname}${url.search}${url.hash}`;
    return new Response(null, {
      status: 301,
      headers: {
        Location: target,
        'Cache-Control': 'public, max-age=3600',
        // Tell Google / Bing to drop pages.dev from their index
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  // Force www → root (optional canonical preference)
  if (host === `www.${CANONICAL_HOST}`) {
    const target = `https://${CANONICAL_HOST}${url.pathname}${url.search}${url.hash}`;
    return new Response(null, {
      status: 301,
      headers: { Location: target, 'Cache-Control': 'public, max-age=3600' },
    });
  }

  // Otherwise continue to normal Pages routing
  return context.next();
};
