
const CACHE_NAME = 'interval-timer-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png'
];

// On install, cache the static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return Promise.all(
          urlsToCache.map(url => {
            // Attempt to fetch each resource
            return fetch(url)
              .then(response => {
                // If the response was good, clone it and store it in the cache
                if (response.status === 200) {
                  cache.put(url, response.clone());
                  return Promise.resolve();
                }
                return Promise.reject(`Failed to fetch ${url}`);
              })
              .catch(error => {
                console.error(`Failed to cache resource: ${url}`, error);
                // Continue even if an individual resource fails
                return Promise.resolve();
              });
          })
        );
      })
  );
});

// On fetch, use the cache but update in the background
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
