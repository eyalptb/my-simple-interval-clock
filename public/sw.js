
const CACHE_NAME = 'interval-timer-cache-v7';
const urlsToCache = [
  '/',
  '/index.html',
  './assets/favicon/favicon.ico',
  './assets/favicon/favicon-16x16.png',
  './assets/favicon/favicon-32x32.png',
  './assets/favicon/apple-touch-icon.png',
  './assets/favicon/android-chrome-192x192.png',
  './assets/favicon/android-chrome-512x512.png',
  './site.webmanifest'
];

// On install, cache the static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service worker install error:', error);
      })
  );
});

// Helper function to check if a URL has an extension of common web files
function hasWebFileExtension(url) {
  const extensions = ['.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.woff', '.woff2', '.ttf', '.otf'];
  return extensions.some(ext => url.endsWith(ext));
}

// On fetch, try the cache first, then network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and browser extension requests
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension:') || 
      event.request.url.includes('extension://')) {
    return;
  }

  const url = new URL(event.request.url);
  
  // Standard cache-first strategy for all resources
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            // Only cache valid responses from the same origin
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response to store in cache
            const responseToCache = response.clone();
            
            // Only cache if it's from our origin and has a web file extension
            if (url.origin === self.location.origin && hasWebFileExtension(url.pathname)) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return response;
          })
          .catch(() => {
            // Return a fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            // Otherwise, just propagate the error
            return new Response('Network error occurred', { 
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(`Service Worker: Deleting old cache ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});
