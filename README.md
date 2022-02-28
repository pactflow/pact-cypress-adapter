# Pact Cypress
Generate pact contracts from cypress test.

## Installation

```bash
#todo add bash script for installation
```

Then, setup your cypress plugin at `cypress/plugins/index.js`

```js
const pactCypressPlugin = require('package-name')
const fs = require('fs')

module.exports = (on, config) => {
  pactCypressPlugin(on, config, fs)
}
```

Finally, update cypress/support/index.js file to include cypress-pact commands via adding:
```js
import 'package-name'
```


## Commands 
### cy.setupPact(consumerName:string, providerName: string)
Configure your consumer and provider name

**Example**
```js
before(() => {
    cy.setupPact('ui-consumer', 'api-provider')
})
```
### cy.usePactWait([alias] | alias)
Listen to aliased `cy.intercept` network call(s), record network request and response to a pact file.
[Usage and example](https://docs.cypress.io/api/commands/intercept) about `cy.intercept`

**Example**
```js
before(() => {
    cy.setupPact('ui-consumer', 'api-provider')
    cy.intercept('GET', '/users').as('getAllUsers')
})

//... cypress test

after(() => {
    cy.usePactWait(['getAllUsers'])
})

```


### cy.usePactRequest(option, alias) and cy.usePactGet([alias] | alias)
Use `cy.usePactRequest` to initiate network calls and use `cy.usePactGet` to record network request and response to a pact file.

**Example**
```js

before(() => {
    cy.setupPact('ui-consumer', 'api-provider')
    cy.usePactRequest('GET', '/users').as('getAllUsers')
})

//... cypress test

after(() => {
    cy.usePactGet(['getAllUsers'])
})

```

## Example Project
Check out a simple react app example project at [/example/todo-example](/example/todo-example/)

