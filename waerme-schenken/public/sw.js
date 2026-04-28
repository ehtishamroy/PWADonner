// Service worker for PWA installability
// Only caches immutable static assets — HTML always comes from the network

const CACHE_NAME = 'waerme-schenken-v2';

// Nothing to pre-cache — static assets are cached on first fetch
self.addEventListener('install', () => {
    self.skipWaiting();
});

// Activate: purge ALL old caches (including v1)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

// Network-first for static assets only; everything else goes straight to network
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Only handle GET
    if (request.method !== 'GET') return;

    // Skip cross-origin requests (fonts, analytics, external APIs)
    if (!request.url.startsWith(self.location.origin)) return;

    // Skip navigation requests (HTML pages) — let the browser fetch them natively
    if (request.mode === 'navigate') return;

    // Skip API routes — always fresh
    if (request.url.includes('/api/')) return;

    // Only intercept immutable Next.js static assets
    if (!request.url.includes('/_next/static/')) return;

    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            })
            .catch(() =>
                caches.match(request).then((cached) => {
                    // Guard: never return undefined to respondWith
                    return cached || new Response('', { status: 503, statusText: 'Offline' });
                })
            )
    );
});
