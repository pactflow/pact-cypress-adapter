import cypress from "eslint-plugin-cypress";
import globals from "globals";

export default [
  {
    files: ["cypress/**/*.js"],
    ...cypress.configs.recommended,
    languageOptions: {
      globals: {
        ...globals.mocha,
        cy: "readonly",
        // biome-ignore lint/style/useNamingConvention: Cypress is the actual global identifier Cypress injects at runtime; it cannot be renamed.
        Cypress: "readonly",
        expect: "readonly",
        assert: "readonly",
      },
    },
  },
];
