const CACHE = 'wodic-v1';
const FILES = [
  '/', '/index.html', '/styles.css', '/app.js', '/manifest.json'
];

self.addEventListener('install', evt =>{
  evt.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES)).then(()=> self.skipWaiting())
  );
});

self.addEventListener('activate', evt =>{
  evt.waitUntil(clients.claim());
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => { if(k !== CACHE) return caches.delete(k);})))
  );
});

self.addEventListener('fetch', evt =>{
  if(evt.request.method !== 'GET') return;
  evt.respondWith(
    caches.match(evt.request).then(cached => cached || fetch(evt.request).then(resp =>{
      // cache new GET requests for offline use
      return caches.open(CACHE).then(cache =>{
        try{ cache.put(evt.request, resp.clone()); }catch(e){}
        return resp;
      });
    }).catch(()=> caches.match('/')))
  );
});

self.addEventListener('message', e =>{
  if(e.data && e.data.action === 'skipWaiting') self.skipWaiting();
});
