const fs = {
  readFileSync: jest.fn((path, encoding) => {
    if (path.endsWith('offline.html')) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Offline Page</title>
          </head>
          <body>
            <div class="offline-container">
              <div class="offline-icon">📡</div>
              <h1 class="offline-message">You're currently offline</h1>
              <button class="retry-button">Try to Reconnect</button>
              <div class="loading">Checking connection...</div>
              <div class="status-message"></div>
              <div class="cached-content">
                <h2>Available Offline Content</h2>
                <div id="cached-pages"></div>
              </div>
            </div>
          </body>
        </html>
      `;
    }
    throw new Error(`File not found: ${path}`);
  })
};

module.exports = fs;
