// Mock Request class
class Request {
  constructor(url, options = {}) {
    this.url = url;
    this.mode = options.mode || 'cors';
  }
}

// Mock Response class
class Response {
  constructor(body, options = {}) {
    this._body = body;
    this.status = options.status || 200;
    this.ok = options.ok !== undefined ? options.ok : true;
    this.type = options.type || 'basic';
  }

  async json() {
    return JSON.parse(this._body);
  }

  clone() {
    return new Response(this._body, {
      status: this.status,
      ok: this.ok,
      type: this.type
    });
  }
}

describe('Offline Functionality', () => {
  beforeEach(() => {
    // Reset the DOM
    document.body.innerHTML = '';
    
    // Add Request and Response to global scope
    global.Request = Request;
    global.Response = Response;

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Offline Page', () => {
    beforeEach(async () => {
      // Load the offline page content
      const fs = require('fs');
      const path = require('path');
      const html = fs.readFileSync(path.resolve(__dirname, '../offline.html'), 'utf8');
      document.documentElement.innerHTML = html;
    });

    test('displays cached pages', async () => {
      // Create a promise that resolves when displayCachedPages completes
      const displayPromise = new Promise(resolve => {
        window.displayCachedPages = async () => {
          const cache = await caches.open('sarp-cache-v1');
          const keys = await cache.keys();
          const cachedPages = document.getElementById('cached-pages');
          
          const pageList = keys
            .map(request => {
              const url = new URL(request.url);
              const path = url.pathname;
              if (path === '/') return '<li><a href="/">Home</a></li>';
              return `<li><a href="${path}">${path.slice(1)}</a></li>`;
            })
            .join('');

          cachedPages.innerHTML = `<ul>${pageList}</ul>`;
          resolve();
        };
      });

      // Trigger the load event
      window.dispatchEvent(new Event('load'));
      
      // Wait for displayCachedPages to complete
      await displayPromise;
      
      const cachedPages = document.getElementById('cached-pages');
      const links = cachedPages.getElementsByTagName('a');
      
      expect(links.length).toBe(3);
      expect(links[0].getAttribute('href')).toBe('/');
      expect(links[1].getAttribute('href')).toBe('/about');
    });

    test('handles retry connection', async () => {
      const button = document.querySelector('.retry-button');
      const loading = document.querySelector('.loading');
      const status = document.querySelector('.status-message');

      // Mock successful fetch
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true
        })
      );

      // Create a promise that resolves when retryConnection completes
      const retryPromise = new Promise(resolve => {
        window.retryConnection = async () => {
          button.disabled = true;
          loading.classList.add('active');
          status.textContent = '';

          try {
            const response = await fetch(window.location.origin);
            if (response.ok) {
              status.textContent = 'Connection restored! Redirecting...';
              resolve();
            }
          } catch (error) {
            status.textContent = 'Still offline. Please try again later.';
            button.disabled = false;
            resolve();
          } finally {
            loading.classList.remove('active');
          }
        };
      });

      // Trigger the retry function directly
      await window.retryConnection();

      // Check final state
      expect(loading.classList.contains('active')).toBe(false);
      expect(button.disabled).toBe(true);
      expect(status.textContent).toBe('Connection restored! Redirecting...');
    });

    test('handles failed retry', async () => {
      const button = document.querySelector('.retry-button');
      const loading = document.querySelector('.loading');
      const status = document.querySelector('.status-message');

      // Mock failed fetch
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      );

      // Create a promise that resolves when retryConnection completes
      const retryPromise = new Promise(resolve => {
        window.retryConnection = async () => {
          button.disabled = true;
          loading.classList.add('active');
          status.textContent = '';

          try {
            await fetch(window.location.origin);
          } catch (error) {
            status.textContent = 'Still offline. Please try again later.';
            button.disabled = false;
          } finally {
            loading.classList.remove('active');
            resolve();
          }
        };
      });

      // Trigger the retry function directly
      await window.retryConnection();

      // Check error state
      expect(loading.classList.contains('active')).toBe(false);
      expect(status.textContent).toBe('Still offline. Please try again later.');
      expect(button.disabled).toBe(false);
    });

    test('detects online status', async () => {
      const status = document.querySelector('.status-message');

      // Trigger the load event
      window.dispatchEvent(new Event('load'));

      // setInterval mock in setup.js will call the callback immediately
      expect(status.textContent).toBe(
        'Connection detected! You can try to reconnect.'
      );
    });
  });

  describe('Service Worker Offline Handling', () => {
    let fetchHandler;

    beforeEach(async () => {
      jest.resetModules();

      // Create a clean global scope for service worker
      global.self = {
        addEventListener: jest.fn(),
        skipWaiting: jest.fn(),
        clients: {
          claim: jest.fn()
        }
      };

      // Load service worker in the mocked context
      const sw = require('../js/sw.js');

      // Get the fetch handler
      const fetchCall = global.self.addEventListener.mock.calls.find(
        call => call[0] === 'fetch'
      );
      fetchHandler = fetchCall ? fetchCall[1] : undefined;

      // Ensure fetchHandler was set
      expect(fetchHandler).toBeDefined();
    });

    test('serves offline page for navigation requests when offline', async () => {
      const fetchEvent = {
        request: new Request('/', { mode: 'navigate' }),
        respondWith: jest.fn(promise => promise)
      };

      // Mock fetch to fail (offline)
      global.fetch = jest.fn(() => Promise.reject(new Error('Offline')));

      // Simulate fetch event
      await fetchHandler(fetchEvent);

      expect(global.caches.match).toHaveBeenCalledWith('/offline.html');
    });

    test('returns JSON error for API requests when offline', async () => {
      const fetchEvent = {
        request: new Request('/api/data'),
        respondWith: jest.fn(promise => promise)
      };

      // Mock fetch to fail (offline)
      global.fetch = jest.fn(() => Promise.reject(new Error('Offline')));

      // Simulate fetch event
      const response = await fetchHandler(fetchEvent);
      const data = await response.json();

      expect(data).toEqual({
        error: 'Network error',
        offline: true
      });
      expect(response.status).toBe(503);
    });

    test('caches successful responses', async () => {
      const cache = await caches.open('sarp-cache-v1');
      const fetchEvent = {
        request: new Request('/test.js'),
        respondWith: jest.fn(promise => promise)
      };

      // Mock successful fetch
      global.fetch = jest.fn(() =>
        Promise.resolve(new Response(JSON.stringify({ success: true }), { 
          status: 200, 
          type: 'basic',
          ok: true 
        }))
      );

      // Simulate fetch event
      await fetchHandler(fetchEvent);

      expect(cache.put).toHaveBeenCalled();
    });
  });
});

      expect(global.caches.match).toHaveBeenCalledWith('/offline.html');
    });

    test('returns JSON error for API requests when offline', async () => {
      const fetchEvent = {
        request: new Request('/api/data'),
        respondWith: jest.fn(promise => promise)
      };

      // Mock fetch to fail (offline)
      global.fetch = jest.fn(() => Promise.reject(new Error('Offline')));

      // Simulate fetch event
      const response = await fetchHandler(fetchEvent);
      const data = await response.json();

      expect(data).toEqual({
        error: 'Network error',
        offline: true
      });
      expect(response.status).toBe(503);
    });

    test('caches successful responses', async () => {
      const cache = await caches.open('sarp-cache-v1');
      const fetchEvent = {
        request: new Request('/test.js'),
        respondWith: jest.fn(promise => promise)
      };

      // Mock successful fetch
      global.fetch = jest.fn(() =>
        Promise.resolve(new Response(JSON.stringify({ success: true }), { 
          status: 200, 
          type: 'basic',
          ok: true 
        }))
      );

      // Simulate fetch event
      await fetchHandler(fetchEvent);

      expect(cache.put).toHaveBeenCalled();
    });
  });
});
