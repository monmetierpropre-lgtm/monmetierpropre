/// <reference lib="webworker" />

const CACHE_VERSION_KEY = 'app_version';
const STATIC_CACHE = 'mon-metier-static-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', async (event) => {
  if (event.data?.type === 'CHECK_VERSION') {
    const stored = localStorage.getItem(CACHE_VERSION_KEY);
    const current = event.data.version;
    if (stored && stored !== current) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      localStorage.setItem(CACHE_VERSION_KEY, current);
      const clients = await self.clients.matchAll();
      clients.forEach((client) => client.postMessage({ type: 'RELOAD' }));
    } else if (!stored) {
      localStorage.setItem(CACHE_VERSION_KEY, current);
    }
  }

  if (event.data?.type === 'FORCE_UPDATE') {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
    const clients = await self.clients.matchAll();
    clients.forEach((client) => client.postMessage({ type: 'RELOAD' }));
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      try {
        const response = await fetch(event.request);
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          const cache = await caches.open(STATIC_CACHE);
          cache.put(event.request, response.clone());
        }
        return response;
      } catch {
        return cached || new Response('Hors ligne', { status: 503 });
      }
    })()
  );
});
