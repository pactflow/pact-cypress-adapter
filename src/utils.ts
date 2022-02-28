import { Interception } from 'cypress/types/net-stubbing'
import { uniqBy, reverse } from 'lodash'
import { AliasType, AnyObject, Interaction, PactConfigType, XHRRequestAndResponse } from 'types'

export const formatAlias = (alias: AliasType) => {
  if (Array.isArray(alias)) {
    return [...alias].map((a) => `@${a}`)
  }
  return [`@${alias}`]
}

const constructFilePath = ({ consumerName, providerName }: PactConfigType) =>
  `cypress/pacts/${providerName}-${consumerName}.json`

export const writePact = (
  intercept: Interception | XHRRequestAndResponse,
  testCaseTitle: string,
  pactConfig: PactConfigType
) => {
  const filePath = constructFilePath(pactConfig)
  cy.task('readFile', filePath)
    .then((content) => {
      if (content) {
        const contentString = content as string
        return constructPactFile(intercept, testCaseTitle, pactConfig, JSON.parse(contentString))
      } else {
        return constructPactFile(intercept, testCaseTitle, pactConfig)
      }
    })
    .then((data) => {
      cy.writeFile(filePath, JSON.stringify(data))
    })
    .then(() => {
      return intercept
    })
}

const constructInteraction = (intercept: Interception | AnyObject, testTitle: string): Interaction => {
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
  pactConfig: PactConfigType,
  content?: any
) => {
  const pactSkeletonObject = {
    consumer: { name: pactConfig.consumerName },
    provider: { name: pactConfig.providerName },
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
