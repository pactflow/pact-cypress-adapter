import { Interception } from 'cypress/types/net-stubbing'
import { uniqBy, reverse } from 'lodash'
import { aliasType, AnyObject, Interaction, pactflowConfig, XHRRequestAndResponse } from 'types'

export const formatAlias = (alias: aliasType) => {
  if (Array.isArray(alias)) {
    return [...alias].map((a) => `@${a}`)
  }
  return [`@${alias}`]
}

export const writePact = (
  filePath: string,
  intercept: Interception | XHRRequestAndResponse,
  testCaseTitle: string,
  pactflowConfig: pactflowConfig
) => {
  cy.task('readFile', filePath)
    .then((content) => {
      if (content) {
        const contentString = content as string
        return constructPactFile(intercept, testCaseTitle, pactflowConfig, JSON.parse(contentString))
      } else {
        return constructPactFile(intercept, testCaseTitle, pactflowConfig)
      }
    })
    .then((data) => {
      cy.writeFile(filePath, JSON.stringify(data))
    })
    .then(() => {
      return intercept
    })
}

const constructInteraction = (intercept: Interception | AnyObject, testTitle: string) : Interaction => {
  const path = new URL(intercept.request.url).pathname
  const search = new URL(intercept.request.url).search
  const query = new URLSearchParams(search).toString()
  return {
    description: testTitle,
    providerState: '',
    request: {
      method: intercept.request.method,
      path: path,
      headers: intercept.request.headers,
      body: intercept.request.body,
      query: query
    },
    response: {
      status: intercept.response?.statusCode,
      headers: intercept.response?.headers,
      body: intercept.response?.body
    }
  }
}
export const constructPactFile = (
  intercept: Interception | XHRRequestAndResponse,
  testTitle: string,
  pactflowConfig: pactflowConfig,
  content?: any
) => {
  const pactSkeletonObject = {
    consumer: { name: pactflowConfig.consumerName },
    provider: { name: pactflowConfig.providerName },
    interactions: [],
    metadata: {
      pactSpecification: {
        version: '2.0.0'
      }
    }
  }

  if (content) {
    const interactions = [...content.interactions, constructInteraction(intercept, testTitle)]
    const nonDuplicatesInteractions = reverse(uniqBy(reverse(interactions), 'description'))
    const data = {
      ...pactSkeletonObject,
      ...content,
      interactions: nonDuplicatesInteractions
    }
    return data
  }

  return {
    ...pactSkeletonObject,
    interactions: [...pactSkeletonObject.interactions, constructInteraction(intercept, testTitle)]
  }
}
