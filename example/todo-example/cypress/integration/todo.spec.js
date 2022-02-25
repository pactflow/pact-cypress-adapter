import '../../../../dist/index'
import todosResponse from '../fixtures/todo.json'
describe('example to-do app', () => {
  before(() => {
    cy.setupPact('ui-consumer', 'todo-api')
    cy.intercept(
      {
        method: 'GET',
        url: '**/api/todo'
      },
      {
        statusCode: 200,
        body: todosResponse,
        headers: { 'access-control-allow-origin': '*' }
      }
    ).as('getTodos')
    cy.visit('http://localhost:3000/')
  })

  it('shows todo', () => {})

  after(() => {
    cy.usePactWait('getTodos').its('response.statusCode').should('eq', 200)
  })
})