
const CACHE_NAME = 'chaotic-notes-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Assuming TSX files are served and handled correctly by the browser with esm.sh/importmaps
  // In a typical build setup, these would be transpiled JS files.
  '/index.tsx', 
  '/App.tsx',
  '/components/TransformedTextView.tsx',
  '/utils/transformations.ts',
  // Static assets from index.html (CDNs might be cached by browser HTTP cache, but good to list critical ones)
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap',
  // PWA icons & favicon (ensure these paths match your file structure in /public)
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching core assets');
        // Attempt to cache all, but be mindful of cross-origin requests for CDNs.
        // For production, more robust error handling for addAll might be needed.
        const cachePromises = urlsToCache.map(urlToCache => {
          return cache.add(urlToCache).catch(err => {
            console.warn(`Failed to cache ${urlToCache}: ${err}`);
          });
        });
        return Promise.all(cachePromises);
      })
      .catch(err => {
        console.error("Cache open/addAll failed during install:", err);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Ensure new service worker takes control immediately
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // For navigation requests (HTML), try Network first, then Cache.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Check if we received a valid response to cache
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          } else if (!response || response.status !== 200) {
             // Network failed or returned non-200, try cache
             return caches.match(request).then(cachedResponse => {
               return cachedResponse || caches.match('/'); // Fallback to root if specific page not cached
             });
          }
          return response;
        })
        .catch(() => {
          // Network request failed entirely, serve from cache
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || caches.match('/'); // Fallback to root
          });
        })
    );
    return;
  }

  // For other requests (assets), use Cache first, then Network strategy.
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; // Serve from cache
        }

        // Not in cache, fetch from network
        return fetch(request).then(
          (networkResponse) => {
            // Check if we received a valid response to cache
            // Only cache same-origin or explicitly listed cross-origin resources that are successful
            if (networkResponse && networkResponse.status === 200 && 
                (request.url.startsWith(self.location.origin) || urlsToCache.includes(request.url))) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
            }
            return networkResponse;
          }
        ).catch(error => {
          console.error('Fetching asset failed:', request.url, error);
          // Optionally, provide a fallback for specific asset types if needed
          // For this app, if an asset fails and isn't cached, it will likely be missing.
        });
      })
  );
});
