// Configuration
const config = {
  logEndpoint: 'https://example.com/api/log-error',
  maxRetries: 3,
  contentEndpoint: 'https://api.workatsarp.com/content',
  analyticsEndpoint: 'https://api.workatsarp.com/analytics'
};

// Content Management
class ContentManager {
  static async fetchContent(section) {
    try {
      const content = await fetchWithRetry(
        `${config.contentEndpoint}/${section}`,
        { headers: { 'Accept': 'application/json' } }
      );
      return content;
    } catch (error) {
      logError(error, `Content fetch for ${section}`);
      return null;
    }
  }

  static async updateSection(sectionId, content) {
    try {
      const section = document.getElementById(sectionId);
      if (!section) throw new Error(`Section ${sectionId} not found`);
      
      // Show loading state
      section.classList.add('loading');
      
      // Update content
      section.innerHTML = content;
      
      // Remove loading state
      section.classList.remove('loading');
      
      // Track successful update
      Analytics.trackEvent('contentUpdate', { section: sectionId });
    } catch (error) {
      logError(error, `Content update for ${sectionId}`);
    }
  }
}

// Analytics
class Analytics {
  static async trackEvent(eventName, data = {}) {
    try {
      await fetchWithRetry(config.analyticsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          data,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      logError(error, `Analytics tracking for ${eventName}`);
    }
  }

  static trackPageView() {
    const path = window.location.pathname;
    this.trackEvent('pageView', { path });
  }

  static trackPerformance() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      this.trackEvent('performance', { loadTime });
    }
  }
}

// Navigation Manager
class NavigationManager {
  constructor() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Smooth scroll for navigation links
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
      link.addEventListener('click', this.handleNavClick.bind(this));
    });

    // Update active nav item on scroll
    window.addEventListener('scroll', this.updateActiveNav.bind(this));
  }

  handleNavClick(event) {
    event.preventDefault();
    const targetId = event.currentTarget.getAttribute('href').slice(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
      Analytics.trackEvent('navigation', { target: targetId });
    }
  }

  updateActiveNav() {
    const sections = document.querySelectorAll('main section');
    const navLinks = document.querySelectorAll('nav ul li a');
    
    let activeIndex = 0;
    const scrollPosition = window.scrollY + 60;

    sections.forEach((section, index) => {
      if (scrollPosition >= section.offsetTop) {
        activeIndex = index;
      }
    });

    navLinks.forEach(link => link.classList.remove('active'));
    if (navLinks[activeIndex]) {
      navLinks[activeIndex].classList.add('active');
    }
  }
}

// Error Handling
async function fetchWithRetry(url, options, retries = config.maxRetries) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Fetch failed, retrying... (${retries} attempts left)`, error);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

async function logError(error, context = '') {
  console.error(`Error in ${context}:`, error);
  
  try {
    await fetchWithRetry(config.logEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.toString(),
        context,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    });
  } catch (logError) {
    console.warn('Failed to send error log:', logError);
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize navigation
  const nav = new NavigationManager();
  
  // Track page view
  Analytics.trackPageView();
  
  // Track performance metrics
  window.addEventListener('load', () => {
    Analytics.trackPerformance();
  });
  
  // Global error handler
  window.onerror = (message, source, lineno, colno, error) => {
    logError(error || message, 'Global Error');
  };
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', event => {
    logError(event.reason, 'Unhandled Promise Rejection');
  });
});
