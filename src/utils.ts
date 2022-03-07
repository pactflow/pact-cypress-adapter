import { DEFAULT_ALLOW_HEADERS } from './constants'
import { Interception } from 'cypress/types/net-stubbing'
import { uniqBy, reverse, pick } from 'lodash'
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
  pactConfig: PactConfigType,
  headerAllowList: string[]
) => {
  const filePath = constructFilePath(pactConfig)
  cy.task('readFile', filePath)
    .then((content) => {
      if (content) {
        const contentString = content as string
        return constructPactFile(intercept, testCaseTitle, pactConfig, headerAllowList, JSON.parse(contentString))
      } else {
        return constructPactFile(intercept, testCaseTitle, pactConfig, headerAllowList)
      }
    })
    .then((data) => {
      cy.writeFile(filePath, JSON.stringify(data))
    })
    .then(() => {
      return intercept
    })
}

export const filterHeaders = (headers: AnyObject, allowList: string[]) => {
  return pick(headers, [...allowList, ...DEFAULT_ALLOW_HEADERS])
}

const constructInteraction = (
  intercept: Interception | AnyObject,
  testTitle: string,
  headerAllowList: string[]
): Interaction => {
  const path = new URL(intercept.request.url).pathname
  const search = new URL(intercept.request.url).search
  const query = new URLSearchParams(search).toString()
  return {
    description: testTitle,
    providerState: '',
    request: {
      method: intercept.request.method,
      path: path,
      headers: filterHeaders(intercept.request.headers, headerAllowList),
      body: intercept.request.body,
      query: query
    },
    response: {
      status: intercept.response?.statusCode,
      headers: filterHeaders(intercept.response?.headers, headerAllowList),
      body: intercept.response?.body
    }
  }
}

export const getHeaderAllowlist = (headerAllowList: string[]) => {
  const headerAllowlist = headerAllowList || Cypress.env('pactHeaderAllowlist') || []
  return headerAllowlist
}

export const constructPactFile = (
  intercept: Interception | XHRRequestAndResponse,
  testTitle: string,
  pactConfig: PactConfigType,
  headerAllowList: string[] = [],
  content?: any,
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
    const interactions = [...content.interactions, constructInteraction(intercept, testTitle, headerAllowList)]
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
    interactions: [...pactSkeletonObject.interactions, constructInteraction(intercept, testTitle, headerAllowList)]
  }
}

const isFileExisted = async (fs: any, filename: string) => !!(await fs.stat(filename).catch((e: any) => false))
export const readFileAsync = async (fs: any, filename: string) => {
  if (await isFileExisted(fs, filename)) {
    const data = await fs.readFile(filename, 'utf8')
    return data
  }
  return null
}
