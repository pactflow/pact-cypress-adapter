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

## Configuration
By default, this plugin omits most HTTP headers except `authorization`, `content-type` and `accept`.
To include customised headers in your pact, add allowed headers as a list of string in `cypress.json` under key `pactHeaderAllowlist`. Eg. in your `cypress.json`
```js
{
    ...otherCypressConfig,
    'pactHeaderAllowlist': ['my-header-1', 'referer']
}

```

Note: Header allowlist can be set up at test level. Check command (cy.setupPactHeaderAllowlist)[/#cy.setupPactHeaderAllowlist([header])]

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

### cy.setupPactHeaderAllowlist([header])
Add a list of headers that will be included in a pact at test case level

**Example**
```js
before(() => {
    cy.setupPact('ui-consumer', 'api-provider')
    cy.intercept('GET', '/users').as('getAllUsers')
    cy.setupPactHeaderAllowlist([''])
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

