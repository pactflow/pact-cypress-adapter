import cypress from "eslint-plugin-cypress";

export default [
  {
    files: ["cypress/**/*.js"],
    ...cypress.configs.recommended,
  },
];
