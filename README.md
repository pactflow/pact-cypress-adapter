# Pact Cypress Adapter

[![test](https://github.com/pactflow/pact-cypress-adapter/actions/workflows/test.yml/badge.svg)](https://github.com/pactflow/pact-cypress-adapter/actions/workflows/test.yml) [![npm version](https://badge.fury.io/js/@pactflow%2Fpact-cypress-adapter.svg)](https://badge.fury.io/js/@pactflow%2Fpact-cypress-adapter)

Generate Pact contracts from your existing Cypress tests.

> Accelerate your entry into contract testing with the Cypress development experience you know and love. — With Pact Cypress Adapter you can get the extra layer of testing safety, easily using existing mocks you’ve created with Cypress.
>
> Read our [blog post](https://pactflow.io/blog/use-cypress-in-contract-testing/) to find out more, otherwise dive-right in.

## Requirements

- Cypress 12.17.4 or later. Earlier versions bundle support files with webpack 4, which cannot parse this package.
- A maintained Node.js release, currently 22 or later.

## Installation

Use your favourite Node package manager:

```bash
npm i -D @pactflow/pact-cypress-adapter
yarn add -D @pactflow/pact-cypress-adapter
pnpm add -D @pactflow/pact-cypress-adapter
```

## Setup

Configure the Pact plugin in your `cypress.config.{js,ts}` file using the `setupNodeEvents` function:

```js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      const pactCypressPlugin = require('@pactflow/pact-cypress-adapter/dist/plugin')
      const fs = require('fs')
      pactCypressPlugin(on, config, fs)
      return config
    }
  }
})
```

Then, update your `cypress/support/e2e.js` file to include the Pact Cypress commands:

```js
import '@pactflow/pact-cypress-adapter'
```

## Configuration

By default, this plugin omits most Cypress auto-generated HTTP headers.

### Add more headers to blocklist

To exclude other headers in your pact, add them as a list of strings in your `cypress.config.{js,ts}` file under the `expose.headersBlocklist` key:

```js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  expose: {
    headersBlocklist: ['ignore-me-globally']
  },
  e2e: {
    setupNodeEvents(on, config) {
      // ... plugin setup
    }
  }
})
```

**Note:** Header blocklist can also be set up at test level. See [cy.setupPactHeaderBlocklist](#cysetuppactheaderblocklistheaders)

### Ignore cypress auto-generated header blocklist

To stop Cypress auto-generated HTTP headers from being omitted by the plugin, set `expose.ignoreDefaultBlocklist` to `true`:

```js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  expose: {
    headersBlocklist: ['ignore-me-globally'],
    ignoreDefaultBlocklist: true
  },
  e2e: {
    setupNodeEvents(on, config) {
      // ... plugin setup
    }
  }
})
```

<details>
<summary>Legacy Configuration (using env, deprecated in Cypress 15.10.0+)</summary>

If you're using Cypress 15.9.x or earlier, you can use the `env` configuration instead of `expose`:

```js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  env: {
    headersBlocklist: ['ignore-me-globally'],
    ignoreDefaultBlocklist: true
  },
  e2e: {
    setupNodeEvents(on, config) {
      // ... plugin setup
    }
  }
})
```

**Migration Note:** Cypress 15.10.0 deprecated `Cypress.env()`, and Cypress 16 removed it. Use the `expose` configuration above on Cypress 15.10.0 and later. The adapter reads `expose` first and falls back to `env`.

</details>

## Commands

### cy.setupPact

Configure your consumer and provider name

```js
before(() => {
  cy.setupPact('ui-consumer', 'api-provider')
})
```

### cy.usePactWait

Listen to aliased `cy.intercept` network call(s), record network request and response to a pact file.
[Usage and example](https://docs.cypress.io/api/commands/intercept) about `cy.intercept`

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

### cy.setupPactHeaderBlocklist

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

### cy.usePactRequest and cy.usePactGet

Use `cy.usePactRequest` to initiate network calls and use `cy.usePactGet` to record network request and response to a pact file.

Convenience wrapper for `cy.request(options).as(alias)`

- Accepts a valid Cypress request options argument [Cypress request options argument](https://docs.cypress.io/api/commands/request#Arguments)

**Example**

```js
before(() => {
  cy.setupPact('ui-consumer', 'api-provider')
  cy.usePactRequest(
    {
      method: 'GET',
      url: '/users'
    },
    'getAllUsers'
  )
})

//... cypress test

after(() => {
  cy.usePactGet(['getAllUsers'])
})
```

## Example Project

Check out a comprehensive React app example demonstrating Pact Cypress Adapter at [`example/todo-example/`](example/todo-example/).

The example showcases:

- Modern Cypress configuration using `cypress.config.js`
- Two testing patterns: `cy.intercept()` for mocked responses and `cy.usePactRequest()` for real API calls
- Custom commands to reduce boilerplate
- Best practices for test isolation and contract testing
