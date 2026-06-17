// Drac SW — Network First
// Toujours la dernière version depuis le réseau
// Cache = fallback offline uniquement
const CACHE = 'drac-offline-v1'
const OFFLINE_ASSETS = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', e => {
  self.skipWaiting() // Activer immédiatement sans attendre
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(OFFLINE_ASSETS))
  )
})

self.addEventListener('activate', e => {
  // Supprimer TOUS les anciens caches au démarrage
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim()) // Prendre le contrôle immédiatement
  )
})

self.addEventListener('fetch', e => {
  // NETWORK FIRST : toujours essayer le réseau d'abord
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Mettre à jour le cache avec la version fraîche
        if (res && res.status === 200 && e.request.method === 'GET') {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => {
        // Réseau indisponible → fallback cache (mode offline)
        return caches.match(e.request)
          .then(cached => cached || caches.match('/index.html'))
      })
  )
})

// Forcer la mise à jour sur tous les clients ouverts
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting()
})
