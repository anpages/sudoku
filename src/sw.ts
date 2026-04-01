import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: { url: string; revision: string | null }[] }

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Daily puzzle: stale-while-revalidate (show cached puzzle instantly, refresh in bg)
registerRoute(
  ({ url }) => url.pathname === '/api/puzzle/daily',
  new StaleWhileRevalidate({
    cacheName: 'daily-puzzle',
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 })],
  }),
)

// Rankings: network-first with 5s timeout, fall back to cache
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/rankings/'),
  new NetworkFirst({
    cacheName: 'rankings',
    networkTimeoutSeconds: 5,
    plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 5 })],
  }),
)

// All other /api/* routes: network only (never cache game state or auth)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkOnly(),
)

// Static assets: cache first
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  }),
)

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
