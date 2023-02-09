import '../../../../dist/index'
import todosResponse from '../fixtures/todo.json'
describe('example to-do app', () => {
  before(() => {
    cy.setupPact('endpoint-consumer', 'todo-api')
    const aliasId = 'endpointTestForOAS3'
    const url = '**/api/todo'
    cy.intercept(url, {
      method: 'GET',
      statusCode: 200,
      body: { oneOf: todosResponse }
    })
      .as(aliasId)
      .then(() => {
        fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }).catch((error) => {
          cy.log(error)
        })
      })
    cy.usePactWait(aliasId)
  })
})
