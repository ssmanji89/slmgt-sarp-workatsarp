const CACHE_NAME = 'sarp-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/styles.css',
  '/js/app.js',
  '/images/hero.jpg'
];

// Navigation routes that should serve index.html
const NAVIGATION_ROUTES = [
  '/',
  '/index.html'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch Event Strategy: Cache First, Network Fallback with Offline Page
self.addEventListener('fetch', event => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Cache hit
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response
            caches.open(CACHE_NAME)
              .then(cache => {
                // Only cache successful responses
                if (response.ok) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            // For API requests, return a JSON error
            if (event.request.url.includes('/api/')) {
              return new Response(
                JSON.stringify({ error: 'Network error', offline: true }),
                { 
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            }
            // For other resources, try to return a cached version
            return caches.match(event.request);
          });
      })
  );
});

// Handle Background Sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-analytics') {
    event.waitUntil(
      // Implement background sync for analytics data
      syncAnalyticsData()
    );
  }
});

// Background Sync Implementation
async function syncAnalyticsData() {
  try {
    const analyticsQueue = await getAnalyticsQueue();
    if (analyticsQueue.length === 0) return;

    await fetch('/api/analytics/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analyticsQueue)
    });

    await clearAnalyticsQueue();
  } catch (error) {
    console.error('Analytics sync failed:', error);
    throw error; // This will cause the sync to retry
  }
}

// Helper functions for analytics queue
async function getAnalyticsQueue() {
  // Implementation would depend on how you're storing the queue
  // This is just a placeholder
  return [];
}

async function clearAnalyticsQueue() {
  // Implementation would depend on how you're storing the queue
  // This is just a placeholder
}
