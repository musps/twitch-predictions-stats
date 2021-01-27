/// <reference types="cypress" />

context('Home', () => {
  beforeEach(() => {
    console.log('ok')
    cy.visit('/')
  })

  it('Path should be /', () => {
    cy.url().should('include', '/')
    cy.title().should('eq', 'Twitch Predictions Stats')
  })

  it('Path should be /', () => {
    cy.getAllByRole('channel-card').should('have.length', 24)
  })
})
