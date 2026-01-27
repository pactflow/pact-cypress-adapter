// ***********************************************
// Custom commands for Pact Cypress Adapter
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Sets up a Pact contract with common configuration for the todo API
 * This demonstrates how to create reusable commands to reduce duplication in tests
 *
 * @param {Object} options - Configuration options
 * @param {string} options.consumer - Consumer name (default: 'ui-consumer')
 * @param {string} options.provider - Provider name (default: 'todo-api')
 * @param {string[]} options.headerBlocklist - Headers to block from Pact files (default: ['ignore-me'])
 *
 * @example
 * cy.setupTodoApiPact()
 * cy.setupTodoApiPact({ consumer: 'my-app', provider: 'my-api' })
 */
Cypress.Commands.add('setupTodoApiPact', (options = {}) => {
  const {
    consumer = 'ui-consumer',
    provider = 'todo-api',
    headerBlocklist = ['ignore-me'],
  } = options

  cy.setupPact(consumer, provider)
  cy.setupPactHeaderBlocklist(headerBlocklist)
})
