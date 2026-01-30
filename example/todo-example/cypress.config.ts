import { defineConfig } from 'cypress'
import * as fs from 'fs'

export default defineConfig({
  video: false,
  screenshotOnRunFailure: true,
  viewportWidth: 1280,
  viewportHeight: 720,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  env: {
    headersBlocklist: ['ignore-me-globally'],
    ignoreDefaultBlocklist: false,
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    async setupNodeEvents(on, config) {
      const { default: pactCypressPlugin } =
        await import('@pactflow/pact-cypress-adapter/dist/plugin.js')
      pactCypressPlugin(on, config, fs)
      return config
    },
  },
})
