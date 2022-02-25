# bets-pact-cypress-adapter
Repository for the pact cypress adaptor while we wait for the PR to be merged

The github actions have been disabled. Please build new versions manually and publish with

```
npm publish
```

Original README:

# Pact Cypress
Generate pact contracts from cypress test.

## Installation

```bash
#todo add bash script for installation
```

Then, setup your cypress plugin at `cypress/plugins/index.js`

```js
const pactCypressPlugin = require('package-name')
const fs = require('fs')

module.exports = (on, config) => {
  pactCypressPlugin(on, config, fs)
}
```

Finally, update cypress/support/index.js file to include cypress-pact commands via adding:
```js
import 'package-name'
```


## Command 
### cy.setupPact(consumerName:string, providerName: string)

### cy.usePactWait([alias])

### cy.usePactRequest(option, alias) and cy.usePactGet([alias])


## Example

For detailed examples, please check example project.
