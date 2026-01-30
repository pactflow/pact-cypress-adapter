/**
 * @type {Cypress.PluginConfig}
 */

import { readFileAsync } from './utils'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
