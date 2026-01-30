import { Interception } from 'cypress/types/net-stubbing'
import { AliasType, Interaction, PactConfigType, XHRRequestAndResponse, PactFileType, HeaderType } from 'types'
import * as pjson from '../package.json'

// Helper to keep only the latest item by property
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const uniqByProperty = <T extends Record<string, any>>(arr: T[], property: keyof T): T[] => {
  const seen = new Map()
  // Process from end to keep latest occurrence
  for (let i = arr.length - 1; i >= 0; i--) {
    const value = arr[i][property]
    if (!seen.has(value)) {
      seen.set(value, true)
    }
  }
  return arr.filter((item) => {
    const value = item[property]
    if (seen.has(value)) {
      seen.delete(value)
      return true
    }
    return false
  })
}

// Helper to remove specified keys from object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const omit = <T extends Record<string, any>>(obj: T | undefined, keys: string[]): Partial<T> | undefined => {
  if (!obj) return undefined
  const result: Partial<T> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (!keys.includes(key)) {
      result[key as keyof T] = value
    }
  }
  return result
}
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
        return constructPactFile({
          intercept,
          testCaseTitle,
          pactConfig,
          blocklist,
          content: parsedContent
        })
      } else {
        return constructPactFile({
          intercept,
          testCaseTitle,
          pactConfig,
          blocklist
        })
      }
    })
    .then((data) => {
      cy.writeFile(filePath, JSON.stringify(data))
    })
    .then(() => {
      return intercept
    })
}

export const omitHeaders = (headers: HeaderType, blocklist: string[]): HeaderType => {
  const result = omit(headers, blocklist)
  return (result as HeaderType) ?? undefined
}

const constructInteraction = (
  intercept: Interception | XHRRequestAndResponse,
  testTitle: string,
  blocklist: string[]
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
    const interactions = [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(content as any).interactions,
      constructInteraction(intercept, testCaseTitle, blocklist)
    ]
    const nonDuplicatesInteractions = uniqByProperty(interactions, 'description')
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isFileExisted = async (fs: any, filename: string) => !!(await fs.stat(filename).catch(() => false))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const readFileAsync = async (fs: any, filename: string) => {
  if (await isFileExisted(fs, filename)) {
    const data = await fs.readFile(filename, 'utf8')
    return data
  }
  return null
}
