
const CACHE_NAME = 'interval-timer-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/opengraph-image.png',
  '/site.webmanifest'
];

// On install, cache the static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return Promise.allSettled(
          urlsToCache.map(url => 
            fetch(url, { cache: 'reload' })
              .then(response => {
                if (response.ok) {
                  return cache.put(url, response);
                }
                console.warn(`Couldn't cache ${url}: ${response.status} ${response.statusText}`);
                return Promise.resolve();
              })
              .catch(error => {
                console.warn(`Failed to fetch ${url} for caching: ${error}`);
                return Promise.resolve();
              })
          )
        );
      })
  );
});

// On fetch, try network first, then fall back to cache
self.addEventListener('fetch', (event) => {
  // For favicon requests, try cache first
  if (event.request.url.includes('favicon') || 
      event.request.url.includes('apple-touch-icon') ||
      event.request.url.includes('android-chrome') ||
      event.request.url.includes('site.webmanifest')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request)
            .then(fetchResponse => {
              // Cache the fetched response
              if (fetchResponse && fetchResponse.status === 200) {
                const clonedResponse = fetchResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, clonedResponse);
                });
              }
              return fetchResponse;
            })
            .catch(error => {
              console.log('Failed to fetch favicon: ', error);
              return new Response('Not found', { status: 404 });
            });
        })
    );
    return;
  }
  
  // Standard network-first strategy for other resources
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response since it can only be used once
        const responseToCache = response.clone();
        
        // Check if valid response
        if (response.status === 200) {
          // Add response to cache
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        
        return response;
      })
      .catch(() => {
        // If network fails, try from cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If not in cache, return a default offline response
            return new Response('Network error occurred', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
