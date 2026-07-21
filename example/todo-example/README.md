# Pact Cypress Adapter - Todo Example

> A comprehensive example demonstrating contract testing with the Pact Cypress Adapter

This React application showcases modern Cypress testing patterns integrated with Pact for consumer-driven contract testing. The example demonstrates best practices for test isolation, custom commands, TypeScript support, and comprehensive assertions.

This example demonstrates **two main patterns** for contract testing with Cypress:

1. **`cy.intercept()` Pattern** ([todo.cy.js](cypress/e2e/todo.cy.js)) - Mock API responses with fixtures
2. **`cy.request()` Pattern** ([todoGet.cy.js](cypress/e2e/todoGet.cy.js)) - Make real HTTP requests to external APIs
3. **Advanced Patterns** ([todo-advanced.cy.js](cypress/e2e/todo-advanced.cy.js)) - Custom commands, multiple scenarios, header filtering

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Testing Patterns](#testing-patterns)
- [Modern Cypress Features](#modern-cypress-features)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

### What is Contract Testing?

Contract testing ensures that the consumer (UI) and provider (API) agree on the API contract. The Pact Cypress Adapter records your API interactions during Cypress tests and generates Pact files that can be verified by the provider.

## Prerequisites

- **Node.js**: v20, v22, or v24 (or other supported version)
- **npm**, **yarn** or **pnpm** package manager

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the React App

```bash
npm run build
```

### 3. Start the HTTP Server

```bash
npm run http-server
```

This starts a server on `http://localhost:3000`

### 4. Run Cypress Tests

In a separate terminal:

```bash
# Open Cypress Test Runner (interactive)
npm run cypress:open

# Run tests headlessly (CI mode)
npm run cypress:run
```

### 5. View Generated Pact Files

After tests run, Pact contract files are generated in:

```text
cypress/pacts/
├── ui-consumer-todo-api.json
└── custom-ui-app-custom-todo-service.json (from advanced examples)
```

## Testing Patterns

### Pattern 1: Using `cy.intercept()` (Recommended for UI Testing)

**File:** [cypress/e2e/todo.cy.js](cypress/e2e/todo.cy.js)

This pattern mocks API responses to test UI behavior in isolation:

```javascript
describe('Todo App', () => {
  beforeEach(() => {
    // Setup Pact contract
    cy.setupPact('ui-consumer', 'todo-api')

    // Intercept API calls
    cy.intercept('GET', '**/api/todo', {
      statusCode: 200,
      body: [{ content: 'clean desk' }],
    }).as('getTodos')

    cy.setupPactHeaderBlocklist(['ignore-me'])
    cy.visit('/')
  })

  it('displays todos', () => {
    cy.contains('clean desk')
  })

  afterEach(() => {
    // Record interaction to Pact file
    cy.usePactWait('getTodos')
  })
})
```

**When to use:**

- Testing UI behavior with predictable data
- Fast test execution (no real API calls)
- Testing error scenarios and edge cases

### Pattern 2: Using `cy.usePactRequest()` (For Integration Testing)

**File:** [cypress/e2e/todoGet.cy.js](cypress/e2e/todoGet.cy.js)

This pattern makes real HTTP requests to test actual API behavior:

```javascript
describe('Todo API Integration', () => {
  beforeEach(() => {
    cy.setupPact('ui-consumer', 'todo-api')

    // Make real HTTP request
    cy.usePactRequest(
      {
        method: 'GET',
        url: 'https://api.example.com/todos',
      },
      'getTodos'
    )

    cy.setupPactHeaderBlocklist(['ignore-me'])
  })

  it('fetches real data', () => {
    cy.get('@getTodos').should('exist')
  })

  afterEach(() => {
    // Record real API response to Pact file
    cy.usePactGet('getTodos')
  })
})
```

**When to use:**

- Testing against staging/test environments
- Verifying actual API behavior
- Integration testing scenarios

### Pattern 3: Custom Commands (Reduce Boilerplate)

**File:** [cypress/support/commands.js](cypress/support/commands.js)

Create reusable commands to reduce duplication:

```javascript
// Define once
Cypress.Commands.add('setupTodoApiPact', (options = {}) => {
  const { consumer = 'ui-consumer', provider = 'todo-api' } = options
  cy.setupPact(consumer, provider)
  cy.setupPactHeaderBlocklist(['ignore-me'])
})

// Use everywhere
cy.setupTodoApiPact()
```

## Modern Cypress Features

This example showcases modern Cypress best practices:

### ✅ Modern Configuration ([cypress.config.js](cypress.config.js))

```javascript
module.exports = defineConfig({
  retries: { runMode: 2, openMode: 0 }, // Auto-retry flaky tests
  viewportWidth: 1280, // Consistent viewport
  baseUrl: 'http://localhost:3000', // Centralized URL
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      // Inline plugin setup (v10+ pattern)
      const pactCypressPlugin = require('@pactflow/pact-cypress-adapter/dist/plugin')
      pactCypressPlugin(on, config, require('fs'))
      return config
    },
  },
})
```

### ✅ Test Isolation with `beforeEach`/`afterEach`

```javascript
// ✅ CORRECT - Each test runs independently
beforeEach(() => {
  cy.setupPact('consumer', 'provider')
  cy.visit('/')
})

// ❌ INCORRECT - Shared state between tests
before(() => {
  cy.setupPact('consumer', 'provider')
  cy.visit('/')
})
```

**Why this matters:** Tests can run in any order and won't affect each other.

### ✅ TypeScript Support

**File:** [cypress/support/index.d.ts](cypress/support/index.d.ts)

Get autocomplete and type safety for Pact commands:

```typescript
// IDE will show autocomplete for:
cy.setupPact(|)  // consumer: string, provider: string
cy.usePactWait(|)  // alias: string | string[]
cy.setupTodoApiPact(|)  // options?: { consumer?, provider?, headerBlocklist? }
```

### ✅ Code Quality Tools

```bash
# Lint Cypress tests
npm run lint

# Format code
npm run fmt:fix

# Clean artifacts
npm run cypress:clean
```

## Project Structure

```text
example/todo-example/
├── cypress/
│   ├── e2e/                          # Test files
│   │   ├── todo.cy.js               # cy.intercept() pattern
│   │   ├── todoGet.cy.js            # cy.usePactRequest() pattern
│   │   └── todo-advanced.cy.js      # Advanced patterns
│   ├── fixtures/
│   │   └── todo.json                # Mock data
│   ├── support/
│   │   ├── commands.js              # Custom commands
│   │   ├── e2e.js                   # Support file
│   │   └── index.d.ts               # TypeScript definitions
│   ├── pacts/                       # Generated Pact files (after tests run)
│   └── tsconfig.json                # TypeScript config
├── src/                              # React app
│   └── App.jsx                      # Simple todo list component
├── cypress.config.js                # Cypress configuration
├── eslint.config.js                 # ESLint rules for cypress/**/*.js
├── biome.jsonc (repo root)          # Code formatting and linting rules
├── package.json
└── README.md                        # This file
```

## Available Scripts

### Development

```bash
npm start          # Start React development server
npm run build      # Build React app for production
```

### Testing

```bash
npm run cypress:open     # Open Cypress Test Runner (interactive)
npm run cypress:run      # Run tests headlessly (CI mode)
npm run lint             # Lint the app and Cypress test files
npm run fmt:fix          # Format all files
npm run cypress:clean    # Remove generated artifacts
```

### Server

```bash
npm run http-server      # Serve built app on port 3000
```

## Best Practices

### 1. ✅ Use Test Isolation

Always use `beforeEach`/`afterEach` instead of `before`/`after`:

```javascript
// ✅ GOOD - Tests are isolated
beforeEach(() => {
  cy.setupPact('consumer', 'provider')
})

// ❌ BAD - Tests share state
before(() => {
  cy.setupPact('consumer', 'provider')
})
```

### 2. ✅ Configure baseUrl

Use `baseUrl` in `cypress.config.js` instead of hardcoding URLs:

```javascript
// ✅ GOOD
cy.visit('/')
cy.visit('/todos')

// ❌ BAD
cy.visit('http://localhost:3000/')
cy.visit('http://localhost:3000/todos')
```

### 3. ✅ Filter Sensitive Headers

Always exclude dynamic or sensitive headers from Pact files:

```javascript
cy.setupPactHeaderBlocklist([
  'authorization', // Sensitive tokens
  'x-request-id', // Dynamic IDs
  'x-correlation-id', // Tracing headers
  'cookie', // Session data
])
```

### 4. ✅ Use Custom Commands

Create custom commands for repetitive Pact setup:

```javascript
// cypress/support/commands.js
Cypress.Commands.add('setupApiPact', (options = {}) => {
  cy.setupPact(options.consumer || 'ui', options.provider || 'api')
  cy.setupPactHeaderBlocklist(options.blocklist || [])
})

// In tests
cy.setupApiPact({ consumer: 'my-app', provider: 'my-api' })
```

### 5. ✅ Add Comprehensive Assertions

Don't just check status codes - validate the entire response:

```javascript
afterEach(() => {
  cy.usePactWait('getTodos').should((xhr) => {
    // Status
    expect(xhr.response.statusCode).to.eq(200)

    // Structure
    expect(xhr.response.body).to.be.an('array')
    expect(xhr.response.body).to.have.length(2)

    // Content
    expect(xhr.response.body[0]).to.have.property('content')
    expect(xhr.response.body[0].content).to.eq('clean desk')

    // Headers
    expect(xhr.response.headers).to.have.property('content-type')
  })
})
```

## Troubleshooting

### Tests Fail: "Cannot find module '@pactflow/pact-cypress-adapter'"

**Solution:** Install dependencies:

```bash
npm install
```

### Port 3000 Already in Use

**Solution:** Stop the conflicting process or change the port:

```bash
# In package.json, change http-server port
"http-server": "http-server -p 3001 build/ &"

# In cypress.config.js, update baseUrl
baseUrl: 'http://localhost:3001'
```

### Pact Files Not Generated

**Solution:** Ensure you're calling `cy.usePactWait()` or `cy.usePactGet()`:

```javascript
afterEach(() => {
  // ✅ This records the interaction
  cy.usePactWait('myAlias')
})
```

### ESLint Errors in IDE

**Solution:** Install ESLint extension for your IDE:

- **VS Code**: Install "ESLint" extension
- **IntelliJ**: Enable ESLint in Preferences

### Tests Fail: "cy.setupPact is not a function"

**Solution:** Ensure support file is imported in `cypress.config.js`:

```javascript
e2e: {
  supportFile: 'cypress/support/e2e.js',  // Must be specified
  setupNodeEvents(on, config) { ... }
}
```

## Learn More

### Cypress Documentation

- [Migration Guide](https://docs.cypress.io/app/references/migration-guide)
- [Best Practices](https://docs.cypress.io/app/core-concepts/best-practices)
- [Configuration](https://docs.cypress.io/app/references/configuration)

### Pact Documentation

- [Pact Cypress Adapter](https://github.com/pactflow/pact-cypress-adapter)
- [Contract Testing Guide](https://docs.pact.io/)
- [Consumer-Driven Contracts](https://docs.pact.io/getting_started/how_pact_works)

### Cypress Command API

- [cy.intercept()](https://docs.cypress.io/api/commands/intercept)
- [cy.request()](https://docs.cypress.io/api/commands/request)
- [Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)

---

## Summary

This example demonstrates:

✅ Modern Cypress configuration with `defineConfig()`
✅ Test isolation with `beforeEach`/`afterEach` hooks
✅ Inline plugin setup (no legacy `cypress/plugins/` directory)
✅ TypeScript support for better IDE experience
✅ Custom commands to reduce test boilerplate
✅ Comprehensive assertions beyond just status codes
✅ Professional code quality with ESLint + Prettier
✅ Two contract testing patterns: mocking and real requests

The React app is intentionally minimal to keep focus on Cypress and Pact patterns.
