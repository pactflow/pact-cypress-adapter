import '../../../../dist/index'

describe('example to-do app', () => {
  before(() => {
    cy.setupPact('ui-consumer', 'todo-api')
    cy.usePactRequest(
      {
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/todos'
      },
      'getTodosGet'
    )
    cy.visit('http://localhost:3000/')
  })

  it('shows todo', () => {
  })

  after(() => {
    cy.usePactGet('getTodosGet')
      .its('response.statusCode')
      .should('eq', 200)
  })
})
