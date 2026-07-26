/**
 * foropencode docs — offline cache.
 *
 * Strategy:
 *   - Navigations (HTML)            : network-first, falls back to the cached page or cached homepage
 *   - Static assets under /_next/   : stale-while-revalidate
 *   - Article images under /img/    : stale-while-revalidate
 *   - search-index.json             : network-only (always fresh)
 *
 * Cache key is versioned. On activate, we drop old caches.
 */

const CACHE_VERSION = 'v3-2026-07-26';
const CACHE_HTML = `foropencode-html-${CACHE_VERSION}`;
const CACHE_STATIC = `foropencode-static-${CACHE_VERSION}`;
const CACHE_IMG = `foropencode-img-${CACHE_VERSION}`;

const KEEP = new Set([CACHE_HTML, CACHE_STATIC, CACHE_IMG]);

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => !KEEP.has(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never cache the search index — it must be fresh
  if (url.pathname === '/search-index.json') return;

  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(networkFirst(req, CACHE_HTML));
    return;
  }

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(staleWhileRevalidate(req, CACHE_STATIC));
    return;
  }

  if (url.pathname.startsWith('/img/') || url.pathname.startsWith('/fonts/')) {
    event.respondWith(staleWhileRevalidate(req, CACHE_IMG));
    return;
  }
});

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req);
    if (hit) return hit;
    // Last-resort offline fallback: cached index
    const index = await cache.match('/');
    if (index) return index;
    throw err;
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const fetchPromise = fetch(req)
    .then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return hit || (await fetchPromise) || Response.error();
}
