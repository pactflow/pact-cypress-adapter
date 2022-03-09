import '../../../../dist/index'
import todosResponse from '../fixtures/todo.json'
describe('example to-do app', () => {
  before(() => {
    cy.setupPact('ui-consumer', 'todo-api')
    cy.intercept(
      {
        method: 'GET',
        url: '**/api/todo',
        headers: {
          'x-pactflow': 'blah',
          'ignore-me': 'ignore',
          'ignore-me-globally': 'ignore'
        }
      },
      {
        statusCode: 200,
        body: todosResponse,
        headers: { 'access-control-allow-origin': '*' }
      }
    ).as('getTodos')
    cy.setupPactHeaderBlocklist(['ignore-me'])
    cy.visit('http://localhost:3000/')
  })

  it('shows todo', () => {
    cy.contains('clean desk')
  })

  after(() => {
    cy.usePactWait('getTodos').its('response.statusCode').should('eq', 200)
  })
})