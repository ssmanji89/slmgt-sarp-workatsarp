// Basic test suite for core functionality
describe('Core Application Tests', () => {
  // ContentManager Tests
  describe('ContentManager', () => {
    test('fetchContent handles successful API response', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: 'test content' })
        })
      );

      const content = await ContentManager.fetchContent('about');
      expect(content).toEqual({ data: 'test content' });
    });

    test('fetchContent handles API errors', async () => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('API Error'))
      );

      const content = await ContentManager.fetchContent('about');
      expect(content).toBeNull();
    });
  });

  // Analytics Tests
  describe('Analytics', () => {
    test('trackEvent sends correct data', async () => {
      const mockFetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      );
      global.fetch = mockFetch;

      await Analytics.trackEvent('pageView', { path: '/home' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"event":"pageView"')
        })
      );
    });
  });

  // NavigationManager Tests
  describe('NavigationManager', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <nav>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </nav>
        <main>
          <section id="home">Home Section</section>
          <section id="about">About Section</section>
        </main>
      `;
    });

    test('updateActiveNav sets active class correctly', () => {
      const nav = new NavigationManager();
      window.scrollY = 0;
      nav.updateActiveNav();
      
      const homeLink = document.querySelector('a[href="#home"]');
      expect(homeLink.classList.contains('active')).toBe(true);
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    test('fetchWithRetry attempts multiple retries', async () => {
      const mockFetch = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: 'success' })
        });
      
      global.fetch = mockFetch;

      const result = await fetchWithRetry('https://api.example.com/data');
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ data: 'success' });
    });
  });
});

// Service Worker Tests
describe('Service Worker', () => {
  beforeAll(() => {
    global.caches = {
      open: jest.fn(() => Promise.resolve({
        addAll: jest.fn(),
        put: jest.fn()
      })),
      keys: jest.fn(() => Promise.resolve(['old-cache'])),
      delete: jest.fn()
    };
  });

  test('service worker installs and caches assets', async () => {
    const event = {
      waitUntil: jest.fn(promise => promise)
    };

    await self.addEventListener('install', event);
    
    expect(global.caches.open).toHaveBeenCalledWith('sarp-cache-v1');
    expect(event.waitUntil).toHaveBeenCalled();
  });
});
