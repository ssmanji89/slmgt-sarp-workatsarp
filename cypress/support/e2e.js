// Import Testing Library Cypress commands
import '@testing-library/cypress/add-commands'

// Custom command to check if service worker is active
Cypress.Commands.add('isServiceWorkerActive', () => {
  cy.window().its('navigator.serviceWorker.controller').should('exist')
})

// Custom command to simulate offline mode
Cypress.Commands.add('goOffline', () => {
  cy.window().trigger('offline')
})

// Custom command to simulate online mode
Cypress.Commands.add('goOnline', () => {
  cy.window().trigger('online')
})

// Custom command to wait for network idle
Cypress.Commands.add('waitForNetworkIdle', (timeout = 3000) => {
  cy.wait(timeout)
})

// Custom command to check cache storage
Cypress.Commands.add('checkCacheStorage', (expectedCacheName) => {
  cy.window().then((win) => {
    win.caches.has(expectedCacheName).then((hasCache) => {
      expect(hasCache).to.be.true
    })
  })
})

// Handle uncaught exceptions
Cypress.on('uncaught:exception', () => {
  // Returning false prevents Cypress from failing the test
  return false
})
