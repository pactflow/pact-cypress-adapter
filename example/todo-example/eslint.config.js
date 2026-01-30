const cypress = require('eslint-plugin-cypress/flat');

module.exports = [
  {
    files: ['cypress/**/*.js'],
    plugins: cypress.configs.recommended.plugins,
    languageOptions: {
      ...cypress.configs.recommended.languageOptions,
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...cypress.configs.recommended.languageOptions.globals,
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        module: 'writable',
        require: 'readonly'
      }
    },
    rules: {
      ...cypress.configs.recommended.rules,
      'cypress/no-unnecessary-waiting': 'warn',
      'cypress/assertion-before-screenshot': 'warn',
      'cypress/no-async-tests': 'error',
      'cypress/no-pause': 'warn'
    }
  }
];
