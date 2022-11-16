import { Interception } from 'cypress/types/net-stubbing'

export type AliasType = string | string[]

export type AnyObject = {
  [K in string | number]: any
}

export type PactConfigType = {
  consumerName: string
  providerName: string
}

export type HeaderType = Record<string, string | string[]> | undefined

type BaseXHR = {
  headers: HeaderType
  body: any | undefined
}
export type Interaction = {
  description: string
  providerState: string
  request: {
    method: string
    path: string
    query: string
  } & BaseXHR
  response: {
    status: string | number | undefined
  } & BaseXHR
}

export type XHRRequestAndResponse = {
  request:
    | {
        method: string
        url: string
      } & BaseXHR
  response: {
    statusCode: string | number | undefined
    statusText: string | undefined
  } & BaseXHR
}

type Encodings =
  | 'ascii'
  | 'base64'
  | 'binary'
  | 'hex'
  | 'latin1'
  | 'utf8'
  | 'utf-8'
  | 'ucs2'
  | 'ucs-2'
  | 'utf16le'
  | 'utf-16le'
  | null

export type RequestOptionType = {
  auth: object
  body: AnyObject
  encoding: Encodings
  followRedirect: boolean
  form: boolean
  gzip: boolean
  headers: object
  method: string
  qs: object
  url: string
}

export type PactFileType = {
  intercept: Interception | XHRRequestAndResponse
  testCaseTitle: string
  pactConfig: PactConfigType
  blocklist?: string[],
  content?: any,
  providerState: string,
}
