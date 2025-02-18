const CACHE_NAME = 'sarp-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/css/styles.css',
  '/js/app.js',
  '/sw.js'
];

// Cache names
const STATIC_CACHE = 'static-v1';
const OFFLINE_CACHE = 'offline-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const OFFLINE_URL = '/offline.html';

// Cache lists
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/sw.js'
];

const OFFLINE_ASSETS = [
  '/offline.html',
  '/css/styles.css'
];

// Queue for storing form submissions during offline mode
const FORM_QUEUE_NAME = 'form-queue';
let formQueue = [];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(OFFLINE_CACHE).then(cache => {
        console.log('Caching offline assets');
        return cache.addAll(OFFLINE_ASSETS);
      })
    ]).catch(error => {
      console.error('Cache installation failed:', error);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', event => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (![STATIC_CACHE, OFFLINE_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients
      return clients.claim();
    })
  );
});

// Fetch Event Strategy
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests
  if (event.request.url.includes('/api/')) {
    handleApiRequest(event);
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL).then(response => {
          return response || caches.match('/');
        });
      })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  if (STATIC_ASSETS.some(asset => event.request.url.endsWith(asset))) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
    return;
  }

  // Handle other requests with network-first strategy
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses in dynamic cache
        if (response.ok) {
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(response => {
          return response || caches.match(OFFLINE_URL);
        });
      })
  );
});

// Handle API requests
function handleApiRequest(event) {
  if (!navigator.onLine) {
    // If offline, store the request in the queue
    if (event.request.method === 'POST') {
      event.respondWith(
        event.request.clone().json().then(formData => {
          formQueue.push(formData);
          return new Response(
            JSON.stringify({ 
              status: 'queued',
              message: 'Your message will be sent when you\'re back online'
            }),
            { 
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
      );
      return;
    }
  }

  // If online, try to send the request
  event.respondWith(
    fetch(event.request.clone())
      .catch(() => {
        return new Response(
          JSON.stringify({
            error: 'Network error',
            offline: true
          }),
          { 
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
  );
}

// Background Sync
self.addEventListener('sync', event => {
  if (event.tag === 'form-sync') {
    event.waitUntil(syncFormData());
  }
});

// Sync form data
async function syncFormData() {
  if (formQueue.length === 0) return;

  const failedSubmissions = [];

  for (const formData of formQueue) {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        failedSubmissions.push(formData);
      }
    } catch (error) {
      failedSubmissions.push(formData);
    }
  }

  // Update the queue with only failed submissions
  formQueue = failedSubmissions;

  // If there are still failed submissions, throw error to retry sync
  if (failedSubmissions.length > 0) {
    throw new Error('Some form submissions failed to sync');
  }
}

// Message handling
self.addEventListener('message', event => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
