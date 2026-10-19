import { describe, expect, it, vi } from "vitest";
import type { CypressConfigSource } from "../src/types";
import { readCypressConfig } from "../src/utils";

const getter = (values: Record<string, unknown>) =>
  vi.fn((key: string) => values[key]);

const throwing = () =>
  vi.fn(() => {
    throw new Error("Cypress.env() has been removed");
  });

describe("readCypressConfig", () => {
  it("reads env on Cypress before 15.10, which has no expose", () => {
    const cypress: CypressConfigSource = {
      env: getter({ headersBlocklist: ["env-header"] }),
    };
    expect(readCypressConfig(cypress, "headersBlocklist")).toEqual([
      "env-header",
    ]);
  });

  it("prefers expose over env", () => {
    const cypress: CypressConfigSource = {
      expose: getter({ headersBlocklist: ["exposed-header"] }),
      env: getter({ headersBlocklist: ["env-header"] }),
    };
    expect(readCypressConfig(cypress, "headersBlocklist")).toEqual([
      "exposed-header",
    ]);
  });

  it("keeps a falsy expose value", () => {
    const cypress: CypressConfigSource = {
      expose: getter({ ignoreDefaultBlocklist: false }),
      env: getter({ ignoreDefaultBlocklist: true }),
    };
    expect(readCypressConfig(cypress, "ignoreDefaultBlocklist")).toBe(false);
  });

  it("falls back to env on Cypress 15 when expose lacks the key", () => {
    const cypress: CypressConfigSource = {
      expose: getter({}),
      env: getter({ ignoreDefaultBlocklist: true }),
      config: getter({ allowCypressEnv: true }),
    };
    expect(readCypressConfig(cypress, "ignoreDefaultBlocklist")).toBe(true);
  });

  it("leaves env alone on Cypress 15 when allowCypressEnv is false", () => {
    const env = throwing();
    const cypress: CypressConfigSource = {
      expose: getter({}),
      env,
      config: getter({ allowCypressEnv: false }),
    };
    expect(readCypressConfig(cypress, "headersBlocklist")).toBeUndefined();
    expect(env).not.toHaveBeenCalled();
  });

  it("returns undefined on Cypress 16, whose env always throws", () => {
    const cypress: CypressConfigSource = {
      expose: getter({}),
      env: throwing(),
      config: getter({}),
    };
    expect(readCypressConfig(cypress, "headersBlocklist")).toBeUndefined();
  });
});
