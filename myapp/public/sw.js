const CACHE_NAME = "wodic-voice-calculator-v2"
const urlsToCache = [
  "/",
  "/manifest.json",
  "/wodic-logo.jpg",
  "/_next/static/css/app/layout.css",
  "/_next/static/css/app/page.css",
  "/_next/static/chunks/webpack.js",
  "/_next/static/chunks/main.js",
  "/_next/static/chunks/pages/_app.js",
  "/_next/static/chunks/pages/_error.js",
  "/placeholder.svg",
]

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching app shell")
        return cache.addAll(urlsToCache)
      })
      .catch((error) => {
        console.log("[SW] Cache install failed:", error)
      }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Handle API routes differently - always try network first, then fallback
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            // Cache successful API responses
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Return a basic error response for API calls when offline
            return new Response(
              JSON.stringify({
                result: "0",
                explanation: "Offline - please try again when connected",
              }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              },
            )
          })
        }),
    )
    return
  }

  // Handle other requests with cache-first strategy
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          console.log("[SW] Serving from cache:", event.request.url)
          return response
        }

        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
      })
      .catch(() => {
        if (event.request.destination === "document") {
          return caches.match("/")
        }
      }),
  )
})
