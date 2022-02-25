import { aliasType, AnyObject, pactConfig, XHRRequestAndResponse } from 'types'
import { formatAlias, writePact } from './utils'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      usePactWait: (alias: aliasType) => Chainable
      usePactRequest: (option: AnyObject, alias: string) => Chainable
      usePactGet: (alias: string, pactConfig: pactConfig) => Chainable
      setupPact:(consumerName: string, providerName: string) => Chainable<null>
    }
  }
}

const pactConfig: pactConfig = {
  consumerName: 'customer',
  providerName: 'provider'
}

const setupPact = (consumerName: string, providerName: string) => {
  pactConfig['consumerName'] =  consumerName
  pactConfig['providerName'] =  providerName
}

const constructFilePath = ({ consumerName, providerName }: pactConfig) =>
  `cypress/pacts/${providerName}-${consumerName}.json`

const usePactWait = (alias: aliasType) => {
  const formattedAlias = formatAlias(alias)
  const testCaseTitle = Cypress.currentTest.title
  const filePath = constructFilePath(pactConfig)
  if (formattedAlias.length > 1) {
    cy.wait([...formattedAlias]).spread((...intercepts) => {
      intercepts.forEach((intercept, index) => {
        writePact(filePath, intercept, `${testCaseTitle}-${formattedAlias[index]}`, pactConfig)
      })
    })
  } else {
    cy.wait(formattedAlias).then((intercept) => {
      const flattenIntercept = Array.isArray(intercept) ? intercept[0] : intercept
      writePact(filePath, flattenIntercept, `${testCaseTitle}`, pactConfig)
    })
  }
}

const requestDataMap: AnyObject = {}

const usePactGet = (alias: string) => {
  const formattedAlias = formatAlias(alias)
  const testCaseTitle = Cypress.currentTest.title
  const filePath = constructFilePath(pactConfig)
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
          statusCode: response.status,
          headers: response.headers,
          statusText: response.statusText
        }
      } as XHRRequestAndResponse
      writePact(filePath, fullRequestAndResponse, `${testCaseTitle}-${alias}`, pactConfig)
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
Cypress.Commands.add('setupPact', setupPact)
