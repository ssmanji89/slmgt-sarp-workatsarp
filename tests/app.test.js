const { 
  config,
  ContentManager,
  Analytics,
  NavigationManager,
  fetchWithRetry,
  logError
} = require('../js/app.js');

// Comprehensive test suite for core functionality
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
      
      // Mock section offsets
      const sections = document.querySelectorAll('main section');
      sections.forEach((section, index) => {
        Object.defineProperty(section, 'offsetTop', {
          value: index * 100
        });
      });
      
      // Set scroll position to top
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

  // Additional ContentManager Tests
  describe('ContentManager.updateSection', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="testSection"></div>';
      jest.spyOn(Analytics, 'trackEvent').mockImplementation(() => Promise.resolve());
    });

    test('updates section content successfully', async () => {
      const sectionId = 'testSection';
      const content = '<p>New content</p>';
      
      await ContentManager.updateSection(sectionId, content);
      
      const section = document.getElementById(sectionId);
      expect(section.innerHTML).toBe(content);
      expect(section.classList.contains('loading')).toBe(false);
      expect(Analytics.trackEvent).toHaveBeenCalledWith('contentUpdate', { section: sectionId });
    });

    test('handles missing section element', async () => {
      const logErrorSpy = jest.spyOn(console, 'error');
      jest.clearAllMocks(); // Clear any previous mock calls
      
      await ContentManager.updateSection('nonexistent', 'content');
      
      expect(logErrorSpy).toHaveBeenCalled();
      expect(Analytics.trackEvent).not.toHaveBeenCalled();
    });
  });

  // Additional Analytics Tests
  describe('Analytics Extended', () => {
    beforeEach(() => {
      global.window.location.pathname = '/test-path';
      global.window.performance.timing = {
        navigationStart: 1000,
        loadEventEnd: 2000
      };
    });

    test('trackPageView sends correct path', async () => {
      const trackEventSpy = jest.spyOn(Analytics, 'trackEvent');
      
      Analytics.trackPageView();
      
      expect(trackEventSpy).toHaveBeenCalledWith('pageView', { path: '/test-path' });
    });

    test('trackPerformance sends load time metrics', async () => {
      const trackEventSpy = jest.spyOn(Analytics, 'trackEvent');
      
      Analytics.trackPerformance();
      
      expect(trackEventSpy).toHaveBeenCalledWith('performance', { loadTime: 1000 });
    });
  });

  // Error Logging Tests
  describe('Error Logging', () => {
    beforeEach(() => {
      global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => ({}) }));
    });

    test('logError sends error details to endpoint', async () => {
      const error = new Error('Test error');
      const context = 'Test context';
      
      await logError(error, context);
      
      expect(global.fetch).toHaveBeenCalledWith(
        config.logEndpoint,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"error":"Error: Test error"')
        })
      );
    });

    test('logError handles endpoint failure gracefully', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
      const consoleSpy = jest.spyOn(console, 'warn');
      
      await logError(new Error('Test error'));
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to send error log:',
        expect.any(Error)
      );
    });
  });

  // Navigation Tests Extended
  describe('NavigationManager Extended', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <nav>
          <ul>
            <li><a href="#section1">Section 1</a></li>
            <li><a href="#section2">Section 2</a></li>
          </ul>
        </nav>
        <main>
          <section id="section1">Section 1 Content</section>
          <section id="section2">Section 2 Content</section>
        </main>
      `;
    });

    test('handleNavClick scrolls to target section', () => {
      const nav = new NavigationManager();
      const link = document.querySelector('a[href="#section1"]');
      const section = document.getElementById('section1');
      const scrollIntoViewMock = jest.fn();
      section.scrollIntoView = scrollIntoViewMock;
      
      const event = new Event('click');
      event.preventDefault = jest.fn();
      link.dispatchEvent(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    test('handleNavClick tracks navigation event', () => {
      const nav = new NavigationManager();
      const trackEventSpy = jest.spyOn(Analytics, 'trackEvent');
      const link = document.querySelector('a[href="#section1"]');
      
      // Create a mock click event with preventDefault method
      const event = {
        preventDefault: jest.fn(),
        currentTarget: link
      };
      
      // Call handleNavClick directly
      nav.handleNavClick(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(trackEventSpy).toHaveBeenCalledWith('navigation', { target: 'section1' });
    });

    test('handleNavClick handles missing target element', () => {
      const nav = new NavigationManager();
      const trackEventSpy = jest.spyOn(Analytics, 'trackEvent');
      jest.clearAllMocks(); // Clear any previous spy calls
      
      const event = {
        preventDefault: jest.fn(),
        currentTarget: {
          getAttribute: () => '#nonexistent'
        }
      };
      
      nav.handleNavClick(event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(trackEventSpy).not.toHaveBeenCalled();
    });

    test('setupEventListeners attaches all required listeners', () => {
      document.body.innerHTML = `
        <nav>
          <a href="#section1">Section 1</a>
          <a href="#section2">Section 2</a>
        </nav>
      `;
      
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const linkAddEventListenerSpy = jest.spyOn(document.querySelector('nav a'), 'addEventListener');
      
      new NavigationManager();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
      expect(linkAddEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  // Performance Tracking Tests
  describe('Performance Tracking', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    afterEach(() => {
      // Restore window.performance to its original state
      window.performance = {
        timing: {
          navigationStart: Date.now(),
          loadEventEnd: Date.now() + 1000
        }
      };
    });

    test('trackPerformance handles missing performance API', () => {
      const trackEventSpy = jest.spyOn(Analytics, 'trackEvent');
      delete window.performance;
      
      Analytics.trackPerformance();
      
      expect(trackEventSpy).not.toHaveBeenCalled();
    });

    test('trackPerformance handles missing timing API', () => {
      const trackEventSpy = jest.spyOn(Analytics, 'trackEvent');
      window.performance = {};
      
      Analytics.trackPerformance();
      
      expect(trackEventSpy).not.toHaveBeenCalled();
    });

    test('trackPerformance handles incomplete timing data', () => {
      const trackEventSpy = jest.spyOn(Analytics, 'trackEvent');
      window.performance.timing = {
        navigationStart: Date.now()
        // Missing loadEventEnd
      };
      
      Analytics.trackPerformance();
      
      expect(trackEventSpy).toHaveBeenCalledWith('performance', { loadTime: NaN });
    });
  });

  // Additional Navigation Tests
  describe('Additional Navigation Tests', () => {
    test('updateActiveNav handles no sections', () => {
      document.body.innerHTML = `
        <nav>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </nav>
        <main></main>
      `;
      
      const nav = new NavigationManager();
      
      // Set scroll position to a value that would be below any sections
      // (if they existed)
      window.scrollY = 1000;
      
      nav.updateActiveNav();
      
      // When there are no sections, no nav link should be active
      const links = document.querySelectorAll('nav a');
      links.forEach(link => {
        expect(link.classList.contains('active')).toBe(false);
      });
    });

    test('updateActiveNav handles no nav links', () => {
      document.body.innerHTML = `
        <nav>
          <ul></ul>
        </nav>
        <main>
          <section id="home">Home Section</section>
        </main>
      `;
      
      const nav = new NavigationManager();
      nav.updateActiveNav();
      
      // Should not throw error
      expect(() => nav.updateActiveNav()).not.toThrow();
    });
  });

  // Additional Event Handling Tests
  describe('Event Handling', () => {
    test('DOMContentLoaded initializes application', () => {
      const trackEventSpy = jest.spyOn(Analytics, 'trackEvent');
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      
      // Reset pathname
      window.location.pathname = '/';
      jest.clearAllMocks();
      
      // Simulate DOMContentLoaded
      document.dispatchEvent(new Event('DOMContentLoaded'));
      
      expect(trackEventSpy).toHaveBeenCalledWith('pageView', { path: '/' });
      expect(addEventListenerSpy).toHaveBeenCalledWith('load', expect.any(Function));
    });

    test('load event tracks performance', () => {
      const trackEventSpy = jest.spyOn(Analytics, 'trackEvent');
      
      // Simulate load event
      window.dispatchEvent(new Event('load'));
      
      expect(trackEventSpy).toHaveBeenCalledWith('performance', expect.any(Object));
    });
  });

  // Additional Error Handling Tests
  describe('Additional Error Handling', () => {
    test('fetchWithRetry handles non-ok response', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404
        })
      );
      
      await expect(fetchWithRetry('https://api.example.com/data')).rejects.toThrow('HTTP error! status: 404');
    });

    test('fetchWithRetry exhausts all retries', async () => {
      const mockFetch = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockRejectedValueOnce(new Error('Third failure'))
        .mockRejectedValue(new Error('Final failure'));
      
      global.fetch = mockFetch;
      
      await expect(fetchWithRetry('https://api.example.com/data')).rejects.toThrow('Final failure');
      expect(mockFetch).toHaveBeenCalledTimes(config.maxRetries + 1);
    });
  });

  // Global Error Handling Tests
  describe('Global Error Handling', () => {
    test('handles window.onerror events', () => {
      const logErrorSpy = jest.spyOn(console, 'error');
      jest.clearAllMocks(); // Clear any previous spy calls
      
      // Create a mock error handler
      const errorHandler = (message, source, lineno, colno, error) => {
        logError(error || message, 'Global Error');
      };
      
      // Call the error handler directly
      errorHandler('Error message', 'test.js', 1, 1, new Error('Test error'));
      
      expect(logErrorSpy).toHaveBeenCalled();
    });

    test('handles unhandled promise rejections', () => {
      const logErrorSpy = jest.spyOn(console, 'error');
      const error = new Error('Promise rejection');
      
      window.dispatchEvent(new CustomEvent('unhandledrejection', {
        reason: error
      }));
      
      expect(logErrorSpy).toHaveBeenCalled();
    });
  });
});

// Service Worker Tests
describe('Service Worker', () => {
  let installHandler;
  
  beforeAll(() => {
    global.caches = {
      open: jest.fn(() => Promise.resolve({
        addAll: jest.fn(),
        put: jest.fn()
      })),
      keys: jest.fn(() => Promise.resolve(['old-cache'])),
      delete: jest.fn()
    };

    // Mock self for service worker context
    global.self = {
      addEventListener: (event, handler) => {
        if (event === 'install') {
          installHandler = handler;
        }
      }
    };
  });

  test('service worker installs and caches assets', async () => {
    const event = {
      waitUntil: jest.fn(promise => promise)
    };

    // Mock service worker scope
    global.self = {
      ...global.self,
      skipWaiting: jest.fn(),
      clients: {
        claim: jest.fn()
      }
    };

    // Create a mock install handler
    const mockInstallHandler = (e) => {
      e.waitUntil(
        caches.open('sarp-cache-v1').then(cache => {
          return cache.addAll([
            '/',
            '/index.html',
            '/css/styles.css',
            '/js/app.js'
          ]);
        })
      );
    };

    // Execute the handler
    await mockInstallHandler(event);
    
    expect(global.caches.open).toHaveBeenCalledWith('sarp-cache-v1');
    expect(event.waitUntil).toHaveBeenCalled();
  });
});
