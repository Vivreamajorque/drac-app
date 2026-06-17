// Drac SW — Network First + Auto-update
// Cache version : 1781718004 — change à chaque déploiement
const CACHE = 'drac-1781718004'

self.addEventListener('install', e => {
  self.skipWaiting() // Activation immédiate sans attendre
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim()) // Prendre le contrôle immédiatement
  )
})

self.addEventListener('fetch', e => {
  // Network First : toujours le réseau, cache = fallback offline uniquement
  e.respondWith(
    fetch(e.request.clone())
      .then(res => {
        if (res.ok && e.request.method === 'GET') {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request).then(c => c || caches.match('/index.html')))
  )
})
