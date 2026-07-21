/// <reference types="cypress" />

/**
 * Type definitions for Pact Cypress Adapter custom commands
 * Provides autocomplete and type safety in IDEs
 */

// biome-ignore-all lint/style/noNamespace: augmenting Cypress's global Chainable interface requires TypeScript's ambient `declare namespace` merging syntax; this is Cypress's own documented pattern for typing custom commands.
// biome-ignore-all lint/style/useConsistentMethodSignatures: matches the method-style signatures Cypress's own built-in Chainable interface uses; mixing styles across the merged interface would be inconsistent, and converting is an unsafe fix that can change call-site variance checking.
// biome-ignore-all lint/suspicious/noExplicitAny: these commands wrap cy.wait()/cy.request(), whose intercepted payload shape varies per test; a precise type would require importing Cypress's internal net-stubbing module types into this ambient global-augmentation file, changing it from a script to a module.
declare namespace Cypress {
  interface Chainable {
    /**
     * Initializes a Pact contract between a consumer and provider
     * This should be called before any API interactions you want to record
     *
     * @param consumerName - Name of the consumer application
     * @param providerName - Name of the provider/API service
     * @example
     * cy.setupPact('ui-consumer', 'todo-api')
     */
    setupPact(consumerName: string, providerName: string): Chainable<void>;

    /**
     * Waits for a request alias and records it in the Pact file
     * Use this after your test assertions to capture the interaction
     *
     * @param alias - Request alias (without @ prefix) or array of aliases
     * @returns The intercepted request for further assertions
     * @example
     * cy.usePactWait('getTodos').its('response.statusCode').should('eq', 200)
     */
    usePactWait(alias: string | string[]): Chainable<any>;

    /**
     * Configures headers to exclude from Pact contract files
     * Useful for removing dynamic or irrelevant headers
     *
     * @param headers - Array of header names to block
     * @example
     * cy.setupPactHeaderBlocklist(['ignore-me', 'x-request-id'])
     */
    setupPactHeaderBlocklist(headers: string[]): Chainable<void>;

    /**
     * Makes an HTTP request and records it in the Pact file
     * Alternative to cy.intercept() for direct API calls
     *
     * @param options - Cypress request options
     * @param alias - Request alias for later reference
     * @returns The request response
     * @example
     * cy.usePactRequest({ method: 'GET', url: '/api/todos' }, 'getTodos')
     */
    usePactRequest(
      options: Partial<Cypress.RequestOptions>,
      alias: string,
    ): Chainable<any>;

    /**
     * Retrieves a recorded request from the Pact and records it
     * Use with cy.usePactRequest() pattern
     *
     * @param alias - Request alias (without @ prefix) or array of aliases
     * @returns The request for assertions
     * @example
     * cy.usePactGet('getTodos').its('response.statusCode').should('eq', 200)
     */
    usePactGet(alias: string | string[]): Chainable<any>;

    /**
     * Custom command: Sets up Pact with common todo API configuration
     * Reduces boilerplate by combining setupPact and setupPactHeaderBlocklist
     *
     * @param options - Configuration options
     * @param options.consumer - Consumer name (default: 'ui-consumer')
     * @param options.provider - Provider name (default: 'todo-api')
     * @param options.headerBlocklist - Headers to block (default: ['ignore-me'])
     * @example
     * cy.setupTodoApiPact()
     * cy.setupTodoApiPact({ consumer: 'my-app' })
     */
    setupTodoApiPact(options?: {
      consumer?: string;
      provider?: string;
      headerBlocklist?: string[];
    }): Chainable<void>;
  }
}
