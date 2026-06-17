const CACHE = "drac-1781718619"
self.addEventListener("install", e => { self.skipWaiting() })
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()))
})
self.addEventListener("fetch", e => {
  e.respondWith(fetch(e.request.clone()).then(res => {
    if (res.ok && e.request.method === "GET") caches.open(CACHE).then(c => c.put(e.request, res.clone()))
    return res
  }).catch(() => caches.match(e.request).then(c => c || caches.match("/index.html"))))
})
