import fs from "node:fs";

// biome-ignore lint/correctness/noUnresolvedImports: defineConfig is exported by cypress at runtime; Biome's resolver misreads the package's conditional exports map across the nested example node_modules.
import { defineConfig } from "cypress";

export default defineConfig({
  video: false,
  screenshotOnRunFailure: true,
  viewportWidth: 1280,
  viewportHeight: 720,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  expose: {
    headersBlocklist: ["ignore-me-globally"],
    ignoreDefaultBlocklist: false,
  },
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    async setupNodeEvents(on, config) {
      const { default: pactCypressPlugin } = await import(
        "@pactflow/pact-cypress-adapter/dist/plugin.js"
      );
      pactCypressPlugin(on, config, fs);
      return config;
    },
  },
});
