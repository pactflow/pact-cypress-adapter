import { Interception } from 'cypress/types/net-stubbing'
import { AUTOGEN_HEADER_BLOCKLIST } from './constants'
import { uniqBy, reverse, omit } from 'lodash'
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
  blocklist: string[] = []
) => {
  const filePath = constructFilePath(pactConfig)
  cy.task('readFile', filePath)
    .then((content) => {
      if (content) {
        const contentString = content as string
        return constructPactFile(intercept, testCaseTitle, pactConfig, blocklist, JSON.parse(contentString))
      } else {
        return constructPactFile(intercept, testCaseTitle, pactConfig, blocklist)
      }
    })
    .then((data) => {
      cy.writeFile(filePath, JSON.stringify(data))
    })
    .then(() => {
      return intercept
    })
}

export const omitHeaders = (headers: AnyObject, blocklist: string[]) => {
  return omit(headers, [...blocklist, ...AUTOGEN_HEADER_BLOCKLIST])
}

const constructInteraction = (intercept: Interception | AnyObject, testTitle: string, blocklist: string[]): Interaction => {
  const path = new URL(intercept.request.url).pathname
  const search = new URL(intercept.request.url).search
  const query = new URLSearchParams(search).toString()
  return {
    description: testTitle,
    providerState: '',
    request: {
      method: intercept.request.method,
      path: path,
      headers: omitHeaders(intercept.request.headers, blocklist),
      body: intercept.request.body,
      query: query
    },
    response: {
      status: intercept.response?.statusCode,
      headers: omitHeaders(intercept.response?.headers, blocklist),
      body: intercept.response?.body
    }
  }
}
export const constructPactFile = (
  intercept: Interception | XHRRequestAndResponse,
  testTitle: string,
  pactConfig: PactConfigType,
  blocklist: string[] = [],
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
    const interactions = [...content.interactions, constructInteraction(intercept, testTitle, blocklist)]
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
    interactions: [...pactSkeletonObject.interactions, constructInteraction(intercept, testTitle, blocklist)]
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
