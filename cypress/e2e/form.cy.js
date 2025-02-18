describe('Form Submission and Error Handling Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForNetworkIdle()
  })

  const fillForm = () => {
    cy.get('form').within(() => {
      cy.get('input[name="name"]').type('Test User')
      cy.get('input[name="email"]').type('test@example.com')
      cy.get('textarea[name="message"]').type('Test Message')
    })
  }

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      cy.get('form').submit()
      cy.get('[data-testid="name-error"]').should('be.visible')
      cy.get('[data-testid="email-error"]').should('be.visible')
      cy.get('[data-testid="message-error"]').should('be.visible')
    })

    it('should validate email format', () => {
      cy.get('input[name="email"]').type('invalid-email')
      cy.get('form').submit()
      cy.get('[data-testid="email-error"]')
        .should('be.visible')
        .and('contain', 'Please enter a valid email address')
    })
  })

  describe('Form Submission', () => {
    it('should submit form successfully', () => {
      cy.intercept('POST', '/api/contact', {
        statusCode: 200,
        body: { message: 'Success' }
      }).as('formSubmit')

      fillForm()
      cy.get('form').submit()

      cy.wait('@formSubmit')
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain', 'Message sent successfully')
    })

    it('should handle submission errors gracefully', () => {
      cy.intercept('POST', '/api/contact', {
        statusCode: 500,
        body: { error: 'Server Error' }
      }).as('formSubmit')

      fillForm()
      cy.get('form').submit()

      cy.wait('@formSubmit')
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'An error occurred')
      cy.get('[data-testid="retry-button"]').should('be.visible')
    })
  })

  describe('Error Recovery', () => {
    it('should retry failed submissions', () => {
      // First attempt fails
      cy.intercept('POST', '/api/contact', {
        statusCode: 500
      }).as('failedSubmit')

      fillForm()
      cy.get('form').submit()
      cy.wait('@failedSubmit')

      // Second attempt succeeds
      cy.intercept('POST', '/api/contact', {
        statusCode: 200,
        body: { message: 'Success' }
      }).as('retrySubmit')

      cy.get('[data-testid="retry-button"]').click()
      cy.wait('@retrySubmit')
      cy.get('[data-testid="success-message"]').should('be.visible')
    })

    it('should preserve form data after failed submission', () => {
      cy.intercept('POST', '/api/contact', {
        statusCode: 500
      }).as('formSubmit')

      fillForm()
      cy.get('form').submit()
      cy.wait('@formSubmit')

      // Verify form data is preserved
      cy.get('input[name="name"]').should('have.value', 'Test User')
      cy.get('input[name="email"]').should('have.value', 'test@example.com')
      cy.get('textarea[name="message"]').should('have.value', 'Test Message')
    })
  })
})
