// Live FX rate fetcher — pulls current USD-based rates from a free public API,
// caches them in localStorage (12h TTL), and gracefully falls back to bundled
// rates if the network call fails.

const CACHE_KEY = 'ccd_fx_rates_v1';
const TTL_MS    = 12 * 60 * 60 * 1000;   // 12 hours

// Static fallback (updated 2026-07 approximate market rates).
// Rate = amount of {currency} per 1 USD.
const FALLBACK_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 155.4,
  AUD: 1.51,
  CAD: 1.36,
  CHF: 0.90,
  CNY: 7.24,
  INR: 83.5,
  BRL: 5.20,
  ZAR: 18.6,
  KRW: 1360,
  SGD: 1.35,
  HKD: 7.82,
  MXN: 17.8,
  SEK: 10.5,
  NOK: 10.6,
  NZD: 1.65,
  TRY: 32.5,
  RUB: 90.0,
};

let liveRates = { ...FALLBACK_RATES };
let listeners = [];

function loadFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.ts || !parsed?.rates) return null;
    if (Date.now() - parsed.ts > TTL_MS) return null;   // expired
    return parsed;
  } catch { return null; }
}

function saveToCache(rates) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), rates }));
  } catch { /* ignore */ }
}

/**
 * Fetch the current rates from a free public API (no key required).
 * open.er-api.com returns { result: 'success', rates: { INR: 83.5, ... } }
 */
export async function refreshRates() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json?.result !== 'success' || !json?.rates) throw new Error('bad response');
    // Merge — keep our known codes + anything extra from API
    liveRates = { ...FALLBACK_RATES, ...json.rates };
    saveToCache(liveRates);
    listeners.forEach(fn => { try { fn(liveRates); } catch { /* ignore */ } });
    return liveRates;
  } catch (err) {
    console.warn('[currencyRates] using fallback rates — ' + err.message);
    return liveRates;
  }
}

/**
 * Get the current rate for a currency code (relative to USD).
 * Always returns a number — falls back to 1.0 for unknown codes.
 */
export function getRate(currencyCode) {
  const code = String(currencyCode || 'USD').toUpperCase();
  return liveRates[code] ?? FALLBACK_RATES[code] ?? 1.0;
}

/** Convert an amount from USD → target currency using current live rate. */
export function convertFromUSD(amountUsd, targetCurrency) {
  const amt = Number(amountUsd) || 0;
  return amt * getRate(targetCurrency);
}

/** Subscribe to rate refresh events */
export function onRatesUpdated(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(x => x !== fn); };
}

// ── Bootstrap: use cache immediately if fresh, otherwise fetch in background
const cached = loadFromCache();
if (cached) {
  liveRates = { ...FALLBACK_RATES, ...cached.rates };
} else if (typeof window !== 'undefined') {
  // fire-and-forget; UI will re-render when listeners update
  refreshRates();
}
