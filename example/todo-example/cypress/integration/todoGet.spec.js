import '../../../../dist/index'

describe('example to-do app', () => {
  before(() => {
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
      //expect(true).toBe(true)
  })

  after(() => {
    cy.usePactGet('getTodosGet', { consumerName: 'consumer', providerName: 'provider' })
      .its('response.statusCode')
      .should('eq', 200)
  })
})
