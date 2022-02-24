import { aliasType, pactflowConfig } from 'types'
import { formatAlias, writePact } from './utils'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      usePactWait: (alias: aliasType, pactflowConfig: pactflowConfig) => Chainable
    }
  }
}

export const setupPactflow = ({ consumerName, providerName }: pactflowConfig) => ({
  consumerName,
  providerName
})

const constructFilePath = ({ consumerName, providerName }: pactflowConfig) =>
  `cypress/pacts/${providerName}-${consumerName}.json`

const usePactWait = (alias: aliasType, pactflowConfig: pactflowConfig) => {
  const formattedAlias = formatAlias(alias)
  const testCaseTitle = Cypress.currentTest.title
  const filePath = constructFilePath(pactflowConfig)
  if (formattedAlias.length > 1) {
    cy.wait([...formattedAlias]).spread((...intercepts) => {
      intercepts.forEach((intercept, index) => {
        writePact(filePath, intercept, `${testCaseTitle}-${formattedAlias[index]}`, pactflowConfig)
      })
    })
  } else {
    cy.wait(formattedAlias).then((intercept) => {
      const flattenIntercept = Array.isArray(intercept) ? intercept[0] : intercept
      writePact(filePath, flattenIntercept, `${testCaseTitle}`, pactflowConfig)
    })
  }
}

Cypress.Commands.add('usePactWait', usePactWait)
