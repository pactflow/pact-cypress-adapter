import { Interception } from 'cypress/types/net-stubbing'
import { uniqBy, reverse, omit } from 'lodash'
import {
  AliasType,
  Interaction,
  PactConfigType,
  XHRRequestAndResponse,
  PactFileType,
  HeaderType,
} from 'types'
const pjson = require('../package.json')
export const formatAlias = (alias: AliasType) => {
  if (Array.isArray(alias)) {
    return [...alias].map((a) => `@${a}`)
  }
  return [`@${alias}`]
}

const constructFilePath = ({ consumerName, providerName }: PactConfigType) =>
  `cypress/pacts/${providerName}-${consumerName}.json`

export const writePact = ({ intercept, testCaseTitle, pactConfig, blocklist }: PactFileType) => {
  const filePath = constructFilePath(pactConfig)
  cy.task('readFile', filePath)
    .then((content) => {
      if (content) {
        const parsedContent = JSON.parse(content as string)
        return constructPactFile({ intercept, testCaseTitle, pactConfig, blocklist, content: parsedContent })
      } else {
        return constructPactFile({ intercept, testCaseTitle, pactConfig, blocklist })
      }
    })
    .then((data) => {
      cy.writeFile(filePath, JSON.stringify(data))
    })
    .then(() => {
      return intercept
    })
}

export const omitHeaders = (headers: HeaderType, blocklist: string[]) => {
  return omit(headers, [...blocklist])
}

const constructInteraction = (
  intercept: Interception | XHRRequestAndResponse,
  testTitle: string,
  blocklist: string[]
): Interaction => {
  const path = new URL(intercept.request.url).pathname
  const search = new URL(intercept.request.url).search
  const query = new URLSearchParams(search).toString()
  let contractObject: Interaction = {
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

  if (intercept.response?.body.oneOf) {
    contractObject.response.oneOf = { body: intercept.response?.body.oneOf }
    delete contractObject.response?.body
  } else if (intercept.response?.body.allOf) {
    contractObject.response.allOf = { body: intercept.response?.body.allOf }
    delete contractObject.response?.body
  } else if (intercept.response?.body.anyOf) {
    contractObject.response.anyOf = { body: intercept.response?.body.anyOf }
    delete contractObject.response?.body
  } else if (intercept.response?.body.not) {
    contractObject.response.not = { body: intercept.response?.body.not }
    delete contractObject.response?.body
  }

  return contractObject
}
export const constructPactFile = ({ intercept, testCaseTitle, pactConfig, blocklist = [], content }: PactFileType) => {
  const pactSkeletonObject = {
    consumer: { name: pactConfig.consumerName },
    provider: { name: pactConfig.providerName },
    interactions: [],
    metadata: {
      pactSpecification: {
        version: '2.0.0'
      },
      client: {
        name: 'pact-cypress-adapter',
        version: pjson.version
      }
    }
  }

  if (content) {
    const interactions = [...content.interactions, constructInteraction(intercept, testCaseTitle, blocklist)]
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
    interactions: [...pactSkeletonObject.interactions, constructInteraction(intercept, testCaseTitle, blocklist)]
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
