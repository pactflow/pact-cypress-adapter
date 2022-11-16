import { AUTOGEN_HEADER_BLOCKLIST } from './constants'
import { AliasType, AnyObject, PactConfigType, XHRRequestAndResponse, RequestOptionType } from 'types'
import { formatAlias, writePact } from './utils'
import { env } from 'process'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      usePactWait: (alias: AliasType, providerState?: string) => Chainable
      usePactRequest: (option: AnyObject, alias: string) => Chainable
      usePactGet: (alias: string, pactConfig: PactConfigType, providerState?: string) => Chainable
      setupPact: (consumerName: string, providerName: string) => Chainable<null>
      setupPactHeaderBlocklist: (headers: string[]) => Chainable<null>
    }
  }
}

const pactConfig: PactConfigType = {
  consumerName: 'customer',
  providerName: 'provider'
}

const setupPact = (consumerName: string, providerName: string) => {
  pactConfig['consumerName'] = consumerName
  pactConfig['providerName'] = providerName
}

const ignoreDefaultBlocklist = Cypress.env('ignoreDefaultBlocklist') || false
const globalBlocklist = Cypress.env('headersBlocklist') || []
let headersBlocklist: string[] = ignoreDefaultBlocklist
  ? globalBlocklist
  : [...globalBlocklist, ...AUTOGEN_HEADER_BLOCKLIST]

const setupPactHeaderBlocklist = (headers: string[]) => {
  headersBlocklist = [...headers, ...headersBlocklist]
}

const usePactWait = (alias: AliasType, providerState: string = '') => {
  const formattedAlias = formatAlias(alias)
  // Cypress versions older than 8.2 do not have a currentTest objects
  const testCaseTitle = Cypress.currentTest ? Cypress.currentTest.title : ''
  //NOTE: spread only works for array containing more than one item
  if (formattedAlias.length > 1) {
    cy.wait([...formattedAlias]).spread((...intercepts) => {
      intercepts.forEach((intercept, index) => {
        writePact({
          intercept,
          testCaseTitle: `${testCaseTitle}-${formattedAlias[index]}`,
          pactConfig,
          blocklist: headersBlocklist,
          providerState: providerState,
        })
      })
    })
  } else {
    cy.wait(formattedAlias).then((intercept) => {
      const flattenIntercept = Array.isArray(intercept) ? intercept[0] : intercept
      writePact({
        intercept: flattenIntercept,
        testCaseTitle: `${testCaseTitle}`,
        pactConfig,
        blocklist: headersBlocklist,
        providerState: providerState
      })
    })
  }
}

const requestDataMap: AnyObject = {}

const usePactGet = (alias: string, pactConfig: PactConfigType, providerState: string = '') => {
  const formattedAlias = formatAlias(alias)
  // Cypress versions older than 8.2 do not have a currentTest objects
  const testCaseTitle = Cypress.currentTest ? Cypress.currentTest.title : ''

  formattedAlias.forEach((alias) => {
    cy.get(alias).then((response: any) => {
      const fullRequestAndResponse = {
        request: {
          method: requestDataMap[alias].method,
          url: requestDataMap[alias].url,
          headers: response.requestHeaders,
          body: response.requestBody
        },
        response: {
          body: response.body,
          statusCode: response.status,
          headers: response.headers,
          statusText: response.statusText
        }
      } as XHRRequestAndResponse
      writePact({
        intercept: fullRequestAndResponse,
        testCaseTitle: `${testCaseTitle}-${alias}`,
        pactConfig,
        blocklist: headersBlocklist,
        providerState:providerState,
      })
    })
  })
}

const usePactRequest = (option: Partial<RequestOptionType>, alias: string) => {
  cy.request(option).as(alias)
  // Store request url and method to a global item as cy.request.get() doesn't
  // provide related information
  requestDataMap[`@${alias}`] = option
}

Cypress.Commands.add('usePactWait', usePactWait)
Cypress.Commands.add('usePactRequest', usePactRequest)
Cypress.Commands.add('usePactGet', usePactGet)
Cypress.Commands.add('setupPact', setupPact)
Cypress.Commands.add('setupPactHeaderBlocklist', setupPactHeaderBlocklist)
