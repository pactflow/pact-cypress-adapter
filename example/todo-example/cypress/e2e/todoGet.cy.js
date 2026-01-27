/**
 * Example: Using cy.usePactRequest() for direct API calls
 *
 * This pattern demonstrates an alternative to cy.intercept():
 * - Making real HTTP requests with cy.usePactRequest()
 * - Recording those requests to Pact files with cy.usePactGet()
 * - Testing external APIs without mocking
 *
 * When to use this pattern:
 * - Testing against real endpoints (like staging/test environments)
 * - When you want to verify actual API behavior, not mocked responses
 * - Integration testing scenarios
 *
 * Comparison with cy.intercept():
 * - cy.intercept() = Mock responses, test UI behavior with fixtures
 * - cy.usePactRequest() = Make real API calls, test actual endpoints
 */
describe('example to-do app - using cy.usePactRequest()', () => {
  beforeEach(() => {
    // Initialize Pact contract
    cy.setupPact('ui-consumer', 'todo-api')

    // Make a real HTTP request (not intercepted)
    // This calls the actual JSONPlaceholder API
    cy.usePactRequest(
      {
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/todos',
        headers: {
          'x-pactflow': 'blah',
          'ignore-me': 'ignore',
          'ignore-me-globally': 'ignore',
        },
      },
      'getTodosGet'
    )

    // Configure header filtering
    cy.setupPactHeaderBlocklist(['ignore-me'])
  })

  it('fetches todos from external API', () => {
    // Verify the request was made and stored
    cy.get('@getTodosGet').should('exist')
  })

  it('returns an array of todos', () => {
    // Verify the response structure
    // Note: cy.usePactRequest stores the response differently than cy.intercept
    cy.get('@getTodosGet').then((xhr) => {
      // The response might be in xhr.response or directly in xhr
      const response = xhr.response || xhr
      const body = response.body || response

      expect(body).to.be.an('array')
      expect(body.length).to.be.greaterThan(0)
    })
  })

  it('each todo has expected properties', () => {
    // Verify todo object structure
    cy.get('@getTodosGet').then((xhr) => {
      const response = xhr.response || xhr
      const body = response.body || response
      const firstTodo = body[0]

      expect(firstTodo).to.have.property('userId')
      expect(firstTodo).to.have.property('id')
      expect(firstTodo).to.have.property('title')
      expect(firstTodo).to.have.property('completed')
    })
  })

  afterEach(() => {
    // Record the interaction in the Pact file
    // This captures the real API response for contract verification
    cy.usePactGet('getTodosGet').then((xhr) => {
      // Handle different response structures
      const response = xhr.response || xhr
      const statusCode = response.statusCode || response.status
      const body = response.body || response

      // Comprehensive assertions on the real API response
      expect(statusCode).to.eq(200)
      expect(body).to.be.an('array')

      // JSONPlaceholder returns 200 todos
      expect(body.length).to.eq(200)
    })
  })
})
