export type AliasType = string | string[]

export type AnyObject = {
  [K in string | number]: any
}

export type PactConfigType = {
  consumerName: string
  providerName: string
}

type BaseXHR = {
  headers: Record<string, string | string[]> | undefined
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
      }
    & BaseXHR
  response: {
    statusCode: string | number | undefined

    statusText: string | undefined
  } & BaseXHR
}
