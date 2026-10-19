import type { Interception } from "cypress/types/net-stubbing";
import type {
  AliasType,
  CypressConfigSource,
  HeaderType,
  Interaction,
  PactConfigType,
  PactFileType,
  PrefixedAliasType,
  XHRRequestAndResponse,
} from "./types";

// biome-ignore lint/style/noCommonJs: an import would pull package.json into the TypeScript program and nest the build output under dist/src/
const pjson = require("../package.json") as { version: string };

const constructFilePath = ({ consumerName, providerName }: PactConfigType) =>
  `cypress/pacts/${providerName}-${consumerName}.json`;

// Helper to keep only the latest item by property
// biome-ignore lint/suspicious/noExplicitAny: generic helper accepts records of arbitrary value type
const uniqByProperty = <T extends Record<string, any>>(
  arr: T[],
  property: keyof T,
): T[] => {
  const lastIndex = new Map<unknown, number>();
  for (const [index, item] of arr.entries()) {
    lastIndex.set(item[property], index);
  }
  return arr.filter((item, index) => lastIndex.get(item[property]) === index);
};

// Helper to remove specified keys from object
// biome-ignore lint/suspicious/noExplicitAny: generic helper accepts records of arbitrary value type
const omit = <T extends Record<string, any>>(
  obj: T | undefined,
  keys: string[],
): Partial<T> | undefined => {
  if (!obj) {
    return;
  }
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!keys.includes(key)) {
      result[key as keyof T] = value;
    }
  }
  return result;
};

const constructInteraction = (
  intercept: Interception | XHRRequestAndResponse,
  testTitle: string,
  blocklist: string[],
): Interaction => {
  const path = new URL(intercept.request.url).pathname;
  const { search } = new URL(intercept.request.url);
  const query = new URLSearchParams(search).toString();
  return {
    description: testTitle,
    providerState: "",
    request: {
      method: intercept.request.method,
      path,
      headers: omitHeaders(intercept.request.headers, blocklist),
      body: intercept.request.body,
      query,
    },
    response: {
      status: intercept.response?.statusCode,
      headers: omitHeaders(intercept.response?.headers, blocklist),
      body: intercept.response?.body,
    },
  };
};

// biome-ignore lint/suspicious/noExplicitAny: fs is injected by the Cypress plugin host and is untyped
const isFileExisted = async (fs: any, filename: string) =>
  Boolean(await fs.stat(filename).catch(() => false));

/**
 * A user config value from `Cypress.expose()`, falling back to `Cypress.env()`.
 * Cypress 15.10 added `expose()` and the `allowCypressEnv` option. Cypress 16
 * keeps `env()` as a stub that always throws.
 */
export const readCypressConfig = (
  cypress: CypressConfigSource,
  key: string,
): unknown => {
  const exposed = cypress.expose?.(key);
  if (
    exposed !== undefined ||
    !cypress.env ||
    cypress.config?.("allowCypressEnv") === false
  ) {
    return exposed;
  }
  try {
    return cypress.env(key);
  } catch {
    // Cypress 16's env() stub throws, which leaves the key unset.
    return exposed;
  }
};

export const formatAlias = (alias: AliasType): PrefixedAliasType[] => {
  if (Array.isArray(alias)) {
    return [...alias].map((a): PrefixedAliasType => `@${a}`);
  }
  return [`@${alias}`];
};

export const writePact = ({
  intercept,
  testCaseTitle,
  pactConfig,
  blocklist,
}: PactFileType) => {
  const filePath = constructFilePath(pactConfig);
  cy.task("readFile", filePath)
    .then((content) => {
      if (content) {
        const parsedContent = JSON.parse(content as string);
        return constructPactFile({
          intercept,
          testCaseTitle,
          pactConfig,
          blocklist,
          content: parsedContent,
        });
      }
      return constructPactFile({
        intercept,
        testCaseTitle,
        pactConfig,
        blocklist,
      });
    })
    .then((data) => {
      cy.writeFile(filePath, JSON.stringify(data));
    })
    .then(() => intercept);
};

export const omitHeaders = (
  headers: HeaderType,
  blocklist: string[],
): HeaderType => {
  const result = omit(headers, blocklist);
  return (result as HeaderType) ?? undefined;
};

export const constructPactFile = ({
  intercept,
  testCaseTitle,
  pactConfig,
  blocklist = [],
  content,
}: PactFileType) => {
  const pactSkeletonObject = {
    consumer: { name: pactConfig.consumerName },
    provider: { name: pactConfig.providerName },
    interactions: [],
    metadata: {
      pactSpecification: {
        version: "2.0.0",
      },
      client: {
        name: "pact-cypress-adapter",
        version: pjson.version,
      },
    },
  };

  if (content) {
    const interactions = [
      // biome-ignore lint/suspicious/noExplicitAny: content is parsed JSON of unknown shape from a prior pact file write
      ...(content as any).interactions,
      constructInteraction(intercept, testCaseTitle, blocklist),
    ];
    const nonDuplicatesInteractions = uniqByProperty(
      interactions,
      "description",
    );
    const data = {
      ...pactSkeletonObject,
      ...content,
      interactions: nonDuplicatesInteractions,
    };
    return data;
  }

  return {
    ...pactSkeletonObject,
    interactions: [
      ...pactSkeletonObject.interactions,
      constructInteraction(intercept, testCaseTitle, blocklist),
    ],
  };
};

// biome-ignore lint/suspicious/noExplicitAny: fs is injected by the Cypress plugin host and is untyped
export const readFileAsync = async (fs: any, filename: string) => {
  if (await isFileExisted(fs, filename)) {
    const data = await fs.readFile(filename, "utf8");
    return data;
  }
  return null;
};
