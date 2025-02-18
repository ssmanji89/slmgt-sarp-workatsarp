describe('Navigation Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForNetworkIdle()
  })

  it('should load the homepage successfully', () => {
    cy.get('body').should('be.visible')
    cy.title().should('not.be.empty')
    cy.get('nav').should('exist')
  })

  it('should have smooth scrolling navigation', () => {
    cy.get('nav a[href^="#"]').each(($link) => {
      const targetId = $link.attr('href').substring(1)
      cy.wrap($link).click()
      cy.get(`#${targetId}`).should('be.visible')
      cy.window().its('scrollY').should('not.equal', 0)
    })
  })

  it('should highlight active navigation section', () => {
    cy.get('nav a').first().as('firstLink')
    cy.get('@firstLink').click()
    cy.get('@firstLink').should('have.class', 'active')
  })

  it('should have working mobile navigation', () => {
    // Test mobile viewport
    cy.viewport('iphone-x')
    
    // Test mobile menu
    cy.get('[data-testid="mobile-menu-button"]')
      .should('be.visible')
      .click()
    
    cy.get('nav')
      .should('be.visible')
      .within(() => {
        cy.get('a').first().click()
      })
    
    // Verify navigation worked
    cy.url().should('include', '#')
  })
})
