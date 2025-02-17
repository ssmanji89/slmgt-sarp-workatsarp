// Import Jest DOM matchers
import '@testing-library/jest-dom';

// Mock window properties and methods used in our application
Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock performance timing API
window.performance = {
  timing: {
    navigationStart: Date.now(),
    loadEventEnd: Date.now() + 1000
  }
};

// Mock service worker registration
global.navigator.serviceWorker = {
  register: jest.fn().mockResolvedValue({
    scope: '/'
  })
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock fetch API if not already mocked in individual tests
global.fetch = global.fetch || jest.fn();

// Mock console methods to prevent noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};
