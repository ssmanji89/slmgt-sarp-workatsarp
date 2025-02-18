// Increase Jest timeout for all tests
jest.setTimeout(30000);

// Mock DOM APIs
Object.defineProperty(window, 'location', {
  writable: true,
  value: new URL('http://localhost')
});

// Mock navigator
Object.defineProperty(window, 'navigator', {
  writable: true,
  value: {
    onLine: true
  }
});

// Mock setInterval
const originalSetInterval = window.setInterval;
window.setInterval = jest.fn((callback, delay) => {
  if (delay === 5000) {
    // For online status check
    callback();
    return 1;
  }
  return originalSetInterval(callback, delay);
});

// Mock service worker globals
global.skipWaiting = jest.fn();
global.clients = {
  claim: jest.fn()
};

// Mock caches API
global.caches = {
  open: jest.fn(() => Promise.resolve({
    keys: () => Promise.resolve([
      new Request('/'),
      new Request('/about'),
      new Request('/css/styles.css')
    ]),
    match: jest.fn(),
    put: jest.fn()
  })),
  match: jest.fn()
};
