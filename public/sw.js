
const CACHE_NAME = 'interval-timer-cache-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/favicon/favicon.ico',
  '/assets/favicon/favicon-16x16.png',
  '/assets/favicon/favicon-32x32.png',
  '/assets/favicon/apple-touch-icon.png',
  '/assets/favicon/android-chrome-192x192.png',
  '/assets/favicon/android-chrome-512x512.png',
  '/site.webmanifest'
];

// Create a mapping for handling favicon requests
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
        // Cache each URL individually to handle failures gracefully
        const cachePromises = urlsToCache.map(url => 
          fetch(url)
            .then(response => {
              if (!response || response.status !== 200) {
                console.log(`Failed to cache: ${url}`);
                return;
              }
              return cache.put(url, response);
            })
            .catch(error => {
              console.log(`Error caching ${url}: ${error}`);
            })
        );
        
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Helper function to safely cache a response
const safelyCacheResponse = (request, response) => {
  // Only cache same-origin resources
  const requestUrl = new URL(request.url);
  
  // Don't cache chrome-extension resources or other extension resources
  if (requestUrl.protocol === 'chrome-extension:' || 
      requestUrl.href.includes('extension://') ||
      requestUrl.protocol !== 'https:' && requestUrl.protocol !== 'http:') {
    return;
  }
  
  // Only cache if it's from our origin
  if (requestUrl.origin === self.location.origin) {
    caches.open(CACHE_NAME).then(cache => {
      cache.put(request, response.clone());
    }).catch(error => {
      console.log(`Error caching ${request.url}: ${error}`);
    });
  }
};

// On fetch, intercept requests to handle favicon redirection and caching
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and extension-related requests
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension://') || 
      event.request.url.includes('extension://')) {
    return;
  }

  const url = new URL(event.request.url);
  
  // Check if the request is for a favicon that needs to be redirected
  const redirectPath = faviconRedirectMap[url.pathname];
  if (redirectPath) {
    event.respondWith(
      caches.match(redirectPath)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // If not in cache, try to fetch it
          return fetch(redirectPath)
            .then(response => {
              if (!response || response.status !== 200) {
                console.log(`Failed to fetch favicon: ${redirectPath}`);
                return response;
              }
              
              // Clone the response to store in cache
              const responseToCache = response.clone();
              safelyCacheResponse(new Request(redirectPath), responseToCache);
              return response;
            })
            .catch(error => {
              console.log(`Error fetching favicon ${redirectPath}: ${error}`);
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
            safelyCacheResponse(event.request, responseToCache);
            return response;
          })
          .catch(error => {
            console.log(`Fetch error: ${error}`);
            // Fall back to offline page or just return the error
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
