import { aliasType, AnyObject, pactflowConfig, XHRRequestAndResponse } from 'types'
import { formatAlias, writePact } from './utils'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      usePactWait: (alias: aliasType, pactflowConfig: pactflowConfig) => Chainable
      usePactRequest: (option: AnyObject, alias: string) => Chainable
      usePactGet: (alias: string, pactflowConfig: pactflowConfig) => Chainable
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

const requestDataMap: AnyObject = {}

const usePactGet = (alias: string, pactflowConfig: pactflowConfig) => {
  const formattedAlias = formatAlias(alias)
  const testCaseTitle = Cypress.currentTest.title
  const filePath = constructFilePath(pactflowConfig)
  formattedAlias.forEach((alias) => {
    cy.get(alias).then((response: any) => {
      const fullRequestAndResponse = {
        request: {
          method: requestDataMap[alias].method,
          url: requestDataMap[alias].url,
          headers: response.requestHeaders
        },
        response: {
          body: response.body,
          status: response.status,
          headers: response.headers,
          statusText: response.statusText
        }
      } as XHRRequestAndResponse
      writePact(filePath, fullRequestAndResponse, `${testCaseTitle}-${alias}`, pactflowConfig)
    })
  })
}

const usePactRequest = (option: AnyObject, alias: string) => {
  cy.request(option).as(alias)
  requestDataMap[`@${alias}`] = option
}

Cypress.Commands.add('usePactWait', usePactWait)
Cypress.Commands.add('usePactRequest', usePactRequest)
Cypress.Commands.add('usePactGet', usePactGet)
