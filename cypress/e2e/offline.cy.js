describe('Offline Functionality Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForNetworkIdle()
  })

  it('should register service worker successfully', () => {
    cy.isServiceWorkerActive()
  })

  it('should cache critical assets', () => {
    cy.checkCacheStorage('v1-static-assets')
  })

  it('should load offline page when offline', () => {
    cy.goOffline()
    cy.visit('/nonexistent-page', { failOnStatusCode: false })
    cy.url().should('include', 'offline.html')
    cy.get('[data-testid="offline-message"]').should('be.visible')
    cy.get('[data-testid="retry-button"]').should('be.visible')
  })

  it('should sync form data when back online', () => {
    // Fill out form
    cy.get('form').within(() => {
      cy.get('input[name="name"]').type('Test User')
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('textarea[name="message"]').type('Test Message')
    })

    cy.goOffline()
    cy.get('form').submit()

    // Verify data is queued for sync
    cy.window().its('localStorage.pendingFormData').should('exist')

    cy.goOnline()
    cy.waitForNetworkIdle()

    // Verify sync occurred
    cy.window().its('localStorage.pendingFormData').should('not.exist')
  })

  it('should handle reconnection attempts', () => {
    cy.goOffline()
    cy.get('[data-testid="offline-indicator"]').should('be.visible')
    cy.get('[data-testid="retry-button"]').click()
    cy.goOnline()
    cy.get('[data-testid="offline-indicator"]').should('not.exist')
  })
})
