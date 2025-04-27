
const CACHE_NAME = 'interval-timer-cache-v2';
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
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// On fetch, intercept requests to handle favicon redirection and caching
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle favicon redirection for root path requests
  const redirectPath = faviconRedirectMap[url.pathname];
  if (redirectPath) {
    const redirectUrl = new URL(redirectPath, url.origin);
    console.log(`Service Worker: Redirecting favicon request from ${url.pathname} to ${redirectPath}`);
    event.respondWith(
      fetch(redirectUrl)
        .then(response => {
          // Cache the response for future requests
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          console.log(`Service Worker: Failed to fetch redirected favicon ${redirectPath}, trying cache`);
          return caches.match(redirectUrl);
        })
    );
    return;
  }
  
  // Special handling for favicon and manifest files
  if (url.pathname.includes('favicon') || 
      url.pathname.includes('apple-touch-icon') ||
      url.pathname.includes('android-chrome') ||
      url.pathname.includes('site.webmanifest')) {
    console.log(`Service Worker: Handling asset request for ${url.pathname}`);
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            console.log(`Service Worker: Serving ${url.pathname} from cache`);
            return response;
          }
          
          console.log(`Service Worker: Fetching ${url.pathname} from network`);
          return fetch(event.request)
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
              console.log(`Service Worker: Failed to fetch ${url.pathname}: `, error);
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
