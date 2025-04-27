
const CACHE_NAME = 'interval-timer-cache-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/favicon/favicon.ico',
  '/assets/favicon/favicon-16x16.png',
  '/assets/favicon/favicon-32x32.png',
  '/assets/favicon/apple-touch-icon.png',
  '/assets/favicon/android-chrome-192x192.png',
  '/assets/favicon/android-chrome-512x512.png',
  '/opengraph-image.png',
  '/site.webmanifest'
];

// Create a mapping for handling favicon requests from root path
const faviconRedirectMap = {
  '/favicon.ico': '/assets/favicon/favicon.ico',
  '/favicon-16x16.png': '/assets/favicon/favicon-16x16.png',
  '/favicon-32x32.png': '/assets/favicon/favicon-32x32.png',
  '/apple-touch-icon.png': '/assets/favicon/apple-touch-icon.png',
  '/android-chrome-192x192.png': '/assets/favicon/android-chrome-192x192.png',
  '/android-chrome-512x512.png': '/assets/favicon/android-chrome-512x512.png'
};

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
  );
});

// On fetch, intercept requests to handle favicon redirection and caching
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension:// requests
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension://') || 
      event.request.url.includes('extension://')) {
    return;
  }

  const url = new URL(event.request.url);
  
  // Handle favicon redirection for root path requests
  const redirectPath = faviconRedirectMap[url.pathname];
  if (redirectPath) {
    event.respondWith(
      caches.match(redirectPath)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          const redirectUrl = new URL(redirectPath, self.location.origin);
          return fetch(redirectUrl)
            .then(response => {
              if (!response || response.status !== 200) {
                return response;
              }
              
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(redirectPath, responseToCache);
                });
                
              return response;
            });
        })
    );
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
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Clone the response to store in cache
            const responseToCache = response.clone();
            
            // Only cache same-origin requests to avoid CORS issues
            if (url.origin === self.location.origin) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return response;
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
