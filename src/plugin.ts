/**
 * @type {Cypress.PluginConfig}
 */

// eslint-disable-next-line no-unused-vars
const { readFileAsync } = require('./utils')
module.exports = (on: any, config: any, fs: any) => {
  const readFile = (filename: string) => readFileAsync(fs.promises, filename)
  const removePactDir = () => {
    fs.promises.rm('cypress/pacts', { recursive: true, force: true }).then(() => {
      console.log('Clear up pacts')
    })
  }
  on('before:run', () => {
    removePactDir()
  })
  on('task', {
    readFile
  })
}
