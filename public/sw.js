
const CACHE_NAME = 'interval-timer-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/assets/favicon/favicon.ico',
  '/src/assets/favicon/favicon-16x16.png',
  '/src/assets/favicon/favicon-32x32.png',
  '/src/assets/favicon/apple-touch-icon.png',
  '/src/assets/favicon/android-chrome-192x192.png',
  '/src/assets/favicon/android-chrome-512x512.png'
];

// On install, cache the static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Don't use addAll as it fails if any single request fails
        return Promise.all(
          urlsToCache.map(url => {
            // Use fetch with no-cors for cross-origin resources
            return fetch(url, { mode: 'no-cors' })
              .then(response => {
                // Put the response in cache regardless of status code when using no-cors
                cache.put(url, response.clone());
                return Promise.resolve();
              })
              .catch(error => {
                console.warn(`Could not cache ${url}: ${error}`);
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
      .catch(() => {
        // Return a fallback response or just continue with the fetch
        return fetch(event.request);
      })
  );
});
