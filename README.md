# bets-pact-cypress-adapter
Repository for the pact cypress adaptor while we wait for the PR to be merged

The github actions have been disabled. Please build new versions manually and publish with

```
npm publish
```

Original README:

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
By default, this plugin omits most cypress auto-generated HTTP headers. 
To exclude more customised headers in your pact, add allowed headers as a list of string in `cypress.json` under key `env.headersBlocklist`. Eg. in your `cypress.json`
```js
{
    ...otherCypressConfig,
    "env": {
        'headersBlocklist': ['ignore-me-globally']
    }
}
```

Note: Header blocklist can be set up at test level. Check command (cy.setupPactHeaderBlocklist)[/#cy.setupPactHeaderBlocklist([headers])]

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

### cy.setupPactHeaderBlocklist([headers])
Add a list of headers that will be excluded in a pact at test case level

```js
before(() => {
    cy.setupPact('ui-consumer', 'api-provider')
    cy.intercept('GET', '/users', headers: {'ignore-me': 'ignore me please'}).as('getAllUsers')
    cy.setupPactHeaderBlocklist(['ignore-me'])
})

//... cypress test

after(() => {
    cy.usePactWait(['getAllUsers'])
})
```

### cy.usePactRequest(option, alias) and cy.usePactGet([alias] | alias)
Use `cy.usePactRequest` to initiate network calls and use `cy.usePactGet` to record network request and response to a pact file.

For detailed examples, please check example project.
