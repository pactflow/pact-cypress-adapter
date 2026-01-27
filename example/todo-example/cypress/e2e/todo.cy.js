import todosResponse from '../fixtures/todo.json'

/**
 * Example: Using cy.intercept() to mock API responses
 *
 * This pattern demonstrates:
 * - Setting up a Pact contract with cy.setupPact()
 * - Mocking API responses with cy.intercept()
 * - Recording interactions to Pact files with cy.usePactWait()
 * - Filtering headers from contracts with cy.setupPactHeaderBlocklist()
 *
 * Best practice: Use beforeEach/afterEach for test isolation
 * This ensures each test runs independently and can run in any order
 */
describe('example to-do app - using cy.intercept()', () => {
  beforeEach(() => {
    // Initialize Pact contract between consumer and provider
    cy.setupPact('ui-consumer', 'todo-api')

    // Intercept API calls and return fixture data
    // The 'ignore-me' header will be filtered out by the header blocklist
    cy.intercept(
      {
        method: 'GET',
        url: '**/api/todo',
        headers: {
          'x-pactflow': 'blah',
          'ignore-me': 'ignore',
          'ignore-me-globally': 'ignore',
        },
      },
      {
        statusCode: 200,
        body: todosResponse,
        headers: { 'access-control-allow-origin': '*' },
      }
    ).as('getTodos')

    // Configure which headers to exclude from Pact files
    // 'ignore-me-globally' is also excluded via cypress.config.js env.headersBlocklist
    cy.setupPactHeaderBlocklist(['ignore-me'])

    cy.visit('/')
  })

  it('displays todos from the API', () => {
    // Verify the UI shows the first todo from our fixture
    cy.contains('clean desk')
    cy.contains('make coffee')
  })

  it('verifies the correct number of todos', () => {
    // Count the number of todo items
    cy.get('li').should('have.length', 2)
  })

  afterEach(() => {
    // Record the interaction in the Pact file with comprehensive assertions
    cy.usePactWait('getTodos').should((interception) => {
      // Verify response status
      expect(interception.response.statusCode).to.eq(200)

      // Verify response body structure
      expect(interception.response.body).to.be.an('array')
      expect(interception.response.body).to.have.length(2)

      // Verify response body content
      expect(interception.response.body[0]).to.have.property('content')
      expect(interception.response.body[0].content).to.eq('clean desk')
      expect(interception.response.body[1].content).to.eq('make coffee')

      // Verify CORS header is present
      expect(interception.response.headers).to.have.property(
        'access-control-allow-origin'
      )
    })
  })
})
