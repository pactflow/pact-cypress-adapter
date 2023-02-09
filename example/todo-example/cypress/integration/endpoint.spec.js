import todosResponse from '../fixtures/todo.json';

describe('example to-do app', () => {
  before(() => {
    cy.setupPact('endpoint-consumer', 'todo-api');
  })

  it('oneOf - generates pact for endpoint specific oneOf issue', () => {
    const aliasId = 'endpointOneOf';
    const url = 'https://google.com';
    cy.intercept(url, {
      method: 'GET',
      statusCode: 200,
      body: {oneOf: todosResponse}
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

  it('anyOf - generates pact for endpoint specific anyOf issue', () => {
    const aliasId = 'endpointAnyOf';
    const url = 'https://google.com';
    cy.intercept(url, {
      method: 'GET',
      statusCode: 200,
      body: {anyOf: todosResponse}
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


  it('allOf - generates pact for endpoint specific allOf issue', () => {
    const aliasId = 'endpointAllOf';
    const url = 'https://google.com';
    cy.intercept(url, {
      method: 'GET',
      statusCode: 200,
      body: {allOf: todosResponse}
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

  it('not - generates pact for endpoint specific not issue', () => {
    const aliasId = 'endpointNot';
    const url = 'https://google.com';
    cy.intercept(url, {
      method: 'GET',
      statusCode: 200,
      body: {not: todosResponse}
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

  it('Generates regular contract without oneOf', () => {
    const aliasId = 'endpointDefault';
    const url = 'https://google.com';
    cy.intercept(url, {
      method: 'GET',
      statusCode: 200,
      body: todosResponse
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
