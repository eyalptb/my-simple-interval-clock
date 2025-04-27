
const CACHE_NAME = 'interval-timer-cache-v4';
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

// Create a mapping for handling favicon requests from any path
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
        // Use fetch() for each URL instead of addAll to handle failures gracefully
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
  // Don't cache chrome-extension resources
  if (request.url.startsWith('chrome-extension://') || 
      request.url.includes('extension://')) {
    return;
  }
  
  // Only cache same-origin or explicitly allowed resources
  const requestUrl = new URL(request.url);
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
  // Skip non-GET requests and chrome-extension:// requests
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension://') || 
      event.request.url.includes('extension://')) {
    return;
  }

  // Handle all favicon requests regardless of path
  const url = new URL(event.request.url);
  const pathEnd = url.pathname.split('/').pop();
  
  // Handle favicons from any path
  // Check if we're requesting a favicon by its filename, regardless of path
  const isFaviconFile = [
    'favicon.ico', 
    'favicon-16x16.png', 
    'favicon-32x32.png', 
    'apple-touch-icon.png', 
    'android-chrome-192x192.png', 
    'android-chrome-512x512.png'
  ].includes(pathEnd);
  
  if (isFaviconFile) {
    // Redirect to the correct favicon path
    const redirectPath = `/assets/favicon/${pathEnd}`;
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
