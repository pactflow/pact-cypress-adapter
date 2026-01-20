import '../../../../dist/index'

describe('example to-do app', () => {
  before(() => {
    cy.setupPact('ui-consumer', 'todo-api')
    cy.usePactRequest(
      {
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/todos',
        headers: {
          'x-pactflow': 'blah',
          'ignore-me': 'ignore',
          'ignore-me-globally': 'ignore'
        }
      },
      'getTodosGet'
    )
    cy.setupPactHeaderBlocklist(['ignore-me'])
  })

  it('shows todo', () => {
  })

  after(() => {
    cy.usePactGet('getTodosGet')
      .its('response.statusCode')
      .should('eq', 200)
  })
})
