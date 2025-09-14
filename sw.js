const CACHE_NAME = 'pwa-calc-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/sw.js',
  // add CSS/JS files if external. If index contains them inline, they don't need caching.
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Cache-first strategy for app shell
  const url = new URL(event.request.url);
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if(cached) return cached;
      return fetch(event.request).then(resp => {
        // optionally cache fetched resources for next time
        return caches.open(CACHE_NAME).then(cache => {
          // ignore opaque responses and cross-origin non-GETs as needed
          try{ cache.put(event.request, resp.clone()); }catch(e){}
          return resp;
        })
      }).catch(()=>{
        // fallback when offline and resource not cached
        if(event.request.destination === 'document') return caches.match('/index.html');
      })
    })
  );
});
