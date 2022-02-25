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

