
const CACHE_NAME = 'interval-timer-cache-v9';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/manifest.json'
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
  
  // For favicon requests, bypass cache and go straight to network
  if (url.pathname === '/favicon.ico' || 
      url.pathname === '/favicon-16x16.png' || 
      url.pathname === '/favicon-32x32.png' || 
      url.pathname === '/apple-touch-icon.png' ||
      url.pathname === '/android-chrome-192x192.png' ||
      url.pathname === '/android-chrome-512x512.png' ||
      url.pathname === '/manifest.json') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Standard cache-first strategy for all other resources
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
