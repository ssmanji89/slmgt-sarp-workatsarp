const CACHE_NAME = 'sarp-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/images/hero.jpg'
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

// Fetch Event Strategy: Cache First, Network Fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it can only be used once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it can only be used once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            // You might want to return a custom offline page here
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
