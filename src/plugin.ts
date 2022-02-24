/**
 * @type {Cypress.PluginConfig}
 */

// eslint-disable-next-line no-unused-vars
module.exports = (on: any, config: any, fs: any) => {
  const fileExists = async (filename: string) => !!(await fs.promises.stat(filename).catch((e: any) => false))
  const readFile = async (filename: string) => {
    if (await fileExists(filename)) {
      const data = await fs.promises.readFile(filename, 'utf8')
      return data
    }
    return null
  }
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
