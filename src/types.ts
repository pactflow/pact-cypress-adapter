// biome-ignore-all lint/style/useConsistentTypeDefinitions: these are all plain object shapes declared with `type`; switching to `interface` would only change the published .d.ts syntax, not any signature

import type { Interception } from "cypress/types/net-stubbing";

type BaseXhr = {
  headers: HeaderType;
  body: unknown | undefined;
};

type Encodings =
  | "ascii"
  | "base64"
  | "binary"
  | "hex"
  | "latin1"
  | "utf8"
  | "utf-8"
  | "ucs2"
  | "ucs-2"
  | "utf16le"
  | "utf-16le"
  | null;

export type AliasType = string | string[];

export type PrefixedAliasType = `@${string}`;

export type AnyObject = {
  [K in string | number]: unknown;
};

export type PactConfigType = {
  consumerName: string;
  providerName: string;
};

export type HeaderType = Record<string, string | string[]> | undefined;

export type Interaction = {
  description: string;
  providerState: string;
  request: {
    method: string;
    path: string;
    query: string;
  } & BaseXhr;
  response: {
    status: string | number | undefined;
  } & BaseXhr;
};

// biome-ignore lint/style/useNamingConvention: XHRRequestAndResponse is part of the published public API; renaming to satisfy strictCase would be a breaking change
export type XHRRequestAndResponse = {
  request: {
    method: string;
    url: string;
  } & BaseXhr;
  response: {
    statusCode: string | number | undefined;
    statusText: string | undefined;
  } & BaseXhr;
};

export type RequestOptionType = {
  auth: object;
  body: AnyObject;
  encoding: Encodings;
  followRedirect: boolean;
  form: boolean;
  gzip: boolean;
  headers: object;
  method: string;
  qs: object;
  url: string;
};

export type PactFileType = {
  intercept: Interception | XHRRequestAndResponse;
  testCaseTitle: string;
  pactConfig: PactConfigType;
  blocklist?: string[];
  content?: Record<string, unknown>;
};
