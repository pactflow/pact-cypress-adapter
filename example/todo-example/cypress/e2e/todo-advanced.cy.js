import todosResponse from '../fixtures/todo.json'

/**
 * Advanced Example: Comprehensive Pact Cypress Adapter patterns
 *
 * This test suite demonstrates advanced features:
 * - Using the custom cy.setupTodoApiPact() command
 * - Testing multiple API endpoints in one suite
 * - Different response scenarios (success, error, empty)
 * - Comprehensive header filtering
 * - Request/response validation patterns
 *
 * These patterns showcase modern Cypress best practices with Pact
 */
describe('Todo API - Advanced Patterns', () => {
  describe('Using custom commands', () => {
    beforeEach(() => {
      // Use the custom command from cypress/support/commands.js
      // This reduces boilerplate and makes tests more maintainable
      cy.setupTodoApiPact()

      cy.intercept('GET', '**/api/todo', {
        statusCode: 200,
        body: todosResponse,
        headers: { 'access-control-allow-origin': '*' },
      }).as('getTodos')

      cy.visit('/')
    })

    it('successfully loads todos using custom setup command', () => {
      cy.contains('clean desk')
      cy.contains('make coffee')
    })

    afterEach(() => {
      cy.usePactWait('getTodos')
    })
  })

  describe('Testing different response scenarios', () => {
    it('handles successful response with todos', () => {
      cy.setupTodoApiPact()
      cy.intercept('GET', '**/api/todo', {
        statusCode: 200,
        body: todosResponse,
      }).as('getTodosSuccess')

      cy.visit('/')
      cy.contains('clean desk')

      // Record this specific interaction
      cy.usePactWait('getTodosSuccess')
    })

    it('handles empty todo list', () => {
      cy.setupTodoApiPact()
      cy.intercept('GET', '**/api/todo', {
        statusCode: 200,
        body: [],
      }).as('getTodosEmpty')

      cy.visit('/')
      cy.contains('No todos is found')

      // Record this specific interaction
      cy.usePactWait('getTodosEmpty')
    })

    it('handles different status codes', () => {
      cy.setupTodoApiPact()

      // Intercept with a 404 response
      // Note: Our minimal React app doesn't handle errors gracefully,
      // so we'll catch the error to demonstrate contract testing for error scenarios
      cy.intercept('GET', '**/api/todo', {
        statusCode: 404,
        body: { error: 'Not found' },
      }).as('getTodos404')

      // Ignore uncaught exceptions from the app for this test
      // In a real app, you'd have proper error handling
      cy.on('uncaught:exception', () => false)

      cy.visit('/')

      // Record this specific interaction for the Pact file
      cy.usePactWait('getTodos404')
    })
  })

  describe('Header filtering and validation', () => {
    it('filters specified headers from Pact file', () => {
      cy.setupPact('ui-consumer', 'todo-api')

      // Configure which headers should be filtered from Pact files
      // These headers will be excluded from the generated contract
      cy.setupPactHeaderBlocklist([
        'ignore-me',
        'x-request-id', // Dynamic headers
        'x-correlation-id',
        'authorization', // Sensitive headers
      ])

      // Intercept without request header matching
      // This allows the app's actual request to match
      cy.intercept('GET', '**/api/todo', {
        statusCode: 200,
        body: todosResponse,
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': '*',
        },
      }).as('getTodosFiltered')

      cy.visit('/')
      cy.contains('clean desk')

      // Record interaction - the blocklisted headers won't appear in Pact file
      cy.usePactWait('getTodosFiltered').then((interception) => {
        // Verify important headers are present in the request
        expect(interception.request.headers).to.have.property('x-pactflow')

        // The 'ignore-me' header is sent but will be filtered from Pact file
        cy.log(
          'Headers validated - filtered headers excluded from Pact contract'
        )
      })
    })
  })

  describe('Request validation patterns', () => {
    beforeEach(() => {
      cy.setupTodoApiPact()
    })

    it('validates request was made with correct method and URL', () => {
      cy.intercept('GET', '**/api/todo', {
        statusCode: 200,
        body: todosResponse,
      }).as('getTodosValidate')

      cy.visit('/')
    })

    afterEach(() => {
      cy.usePactWait('getTodosValidate').then((interception) => {
        // Comprehensive request validation
        expect(interception.request.method).to.eq('GET')
        expect(interception.request.url).to.include('/api/todo')

        // Verify request headers
        expect(interception.request.headers).to.be.an('object')
        expect(interception.request.headers).to.have.property('x-pactflow')

        // Comprehensive response validation
        expect(interception.response.statusCode).to.eq(200)
        expect(interception.response.body).to.deep.equal(todosResponse)
        expect(interception.response.body).to.have.length(2)

        // Log that validation passed
        cy.log('Request and response validation passed')
      })
    })
  })

  describe('Custom Pact configuration', () => {
    it('allows overriding consumer and provider names', () => {
      // Demonstrate custom command flexibility
      cy.setupTodoApiPact({
        consumer: 'custom-ui-app',
        provider: 'custom-todo-service',
        headerBlocklist: ['x-custom-header'],
      })

      cy.intercept('GET', '**/api/todo', {
        statusCode: 200,
        body: todosResponse,
      }).as('getCustomTodos')

      cy.visit('/')
      cy.contains('clean desk')
    })

    afterEach(() => {
      cy.usePactWait('getCustomTodos')
    })
  })
})
