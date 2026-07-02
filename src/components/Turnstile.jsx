// Cloudflare Turnstile widget — invisible/managed CAPTCHA for /login and /signup.
// Docs: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
//
// The widget calls `onVerify(token)` when the user is verified. That token
// MUST be sent to the server (functions/api/verify-captcha.js) and validated
// there before granting access — client-only checks are trivially bypassed.

import React, { useEffect, useRef } from 'react';

// Public site keys (safe to hardcode / go in VITE_ env).
// Falls back to Cloudflare's official DEV key ("1x000...AA") which ALWAYS
// passes verification — used only when the real key isn't set (local dev).
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

export default function Turnstile({ onVerify, onExpire, onError, theme = 'light', size = 'normal' }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    // Wait for the Turnstile script (loaded async in index.html) to be ready
    const waitForTurnstile = (retries = 40) => {
      if (cancelled) return;
      if (window.turnstile && containerRef.current) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme,
          size,
          callback: (token) => { if (!cancelled) onVerify?.(token); },
          'expired-callback': () => { if (!cancelled) onExpire?.(); },
          'error-callback': () => { if (!cancelled) onError?.(); },
        });
      } else if (retries > 0) {
        setTimeout(() => waitForTurnstile(retries - 1), 100);
      } else if (!cancelled) {
        console.warn('[Turnstile] widget script did not load — CAPTCHA disabled');
        onError?.();
      }
    };
    waitForTurnstile();

    return () => {
      cancelled = true;
      try {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
        }
      } catch { /* ignore */ }
    };
  }, [theme, size]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className="turnstile-widget" />;
}
