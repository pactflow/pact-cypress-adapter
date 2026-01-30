const cypress = require('eslint-plugin-cypress/flat');

module.exports = [
  {
    files: ['cypress/**/*.js'],
    ...cypress.configs.recommended,
    rules: {
      ...cypress.configs.recommended.rules,
      'cypress/no-unnecessary-waiting': 'warn',
      'cypress/assertion-before-screenshot': 'warn',
      'cypress/no-async-tests': 'error',
      'cypress/no-pause': 'warn'
    }
  }
];
