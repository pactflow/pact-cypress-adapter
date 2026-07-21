/**
 * @type {Cypress.PluginConfig}
 */

import { readFileAsync } from "./utils";

// biome-ignore lint/style/noCommonJs: Cypress loads plugin files through require() at runtime
// biome-ignore lint/suspicious/noExplicitAny: on/config/fs are Cypress plugin host arguments and are untyped
module.exports = (on: any, _config: any, fs: any) => {
  const readFile = (filename: string) => readFileAsync(fs.promises, filename);
  const removePactDir = () => {
    fs.promises
      .rm("cypress/pacts", { recursive: true, force: true })
      .then(() => {
        console.log("Clear up pacts");
      });
  };
  on("before:run", () => {
    removePactDir();
  });
  on("task", {
    readFile,
  });
};
