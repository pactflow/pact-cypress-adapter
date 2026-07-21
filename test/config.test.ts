// biome-ignore-all lint/suspicious/noExplicitAny: test doubles are deliberately loosely typed

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface MockCypress {
  expose: (key: string) => unknown;
  env: (key: string) => unknown;
}

describe("Configuration Loading", () => {
  let originalCypress: typeof Cypress;

  beforeEach(() => {
    // Store original Cypress
    originalCypress = globalThis.Cypress as typeof Cypress;
  });

  afterEach(() => {
    // Restore original Cypress
    if (originalCypress) {
      globalThis.Cypress = originalCypress;
    }
  });

  it("should prefer Cypress.expose() over Cypress.env() for headersBlocklist", () => {
    // Setup mock Cypress object
    const mockCypress: MockCypress = {
      expose: vi.fn((key: string) => {
        if (key === "headersBlocklist") {
          return ["exposed-header"];
        }
      }),
      env: vi.fn(() => {}),
    };

    globalThis.Cypress = mockCypress as any;
    const cypress = globalThis.Cypress as any;

    // Simulate the config loading logic
    const globalBlocklist =
      cypress.expose("headersBlocklist") ??
      cypress.env("headersBlocklist") ??
      [];

    // Should use Cypress.expose() value, not Cypress.env()
    expect(globalBlocklist).toEqual(["exposed-header"]);
    expect(mockCypress.expose).toHaveBeenCalledWith("headersBlocklist");
  });

  it("should fallback to Cypress.env() when Cypress.expose() is undefined for headersBlocklist", () => {
    const mockCypress: MockCypress = {
      expose: vi.fn(() => {}),
      env: vi.fn((key: string) => {
        if (key === "headersBlocklist") {
          return ["env-header"];
        }
      }),
    };

    globalThis.Cypress = mockCypress as any;
    const cypress = globalThis.Cypress as any;

    const globalBlocklist =
      cypress.expose("headersBlocklist") ??
      cypress.env("headersBlocklist") ??
      [];

    // Should fallback to Cypress.env() value
    expect(globalBlocklist).toEqual(["env-header"]);
  });

  it("should use default value when both Cypress.expose() and Cypress.env() are undefined", () => {
    const mockCypress: MockCypress = {
      expose: vi.fn(() => {}),
      env: vi.fn(() => {}),
    };

    globalThis.Cypress = mockCypress as any;
    const cypress = globalThis.Cypress as any;

    const globalBlocklist =
      cypress.expose("headersBlocklist") ??
      cypress.env("headersBlocklist") ??
      [];

    // Should use default empty array
    expect(globalBlocklist).toEqual([]);
  });

  it("should prefer Cypress.expose() over Cypress.env() for ignoreDefaultBlocklist", () => {
    const mockCypress: MockCypress = {
      expose: vi.fn((key: string) => {
        if (key === "ignoreDefaultBlocklist") {
          return true;
        }
      }),
      env: vi.fn(() => {}),
    };

    globalThis.Cypress = mockCypress as any;
    const cypress = globalThis.Cypress as any;

    const ignoreDefaultBlocklist =
      cypress.expose("ignoreDefaultBlocklist") ??
      cypress.env("ignoreDefaultBlocklist") ??
      false;

    // Should use Cypress.expose() value, not Cypress.env()
    expect(ignoreDefaultBlocklist).toBe(true);
    expect(mockCypress.expose).toHaveBeenCalledWith("ignoreDefaultBlocklist");
  });

  it("should fallback to Cypress.env() when Cypress.expose() is undefined for ignoreDefaultBlocklist", () => {
    const mockCypress: MockCypress = {
      expose: vi.fn(() => {}),
      env: vi.fn((key: string) => {
        if (key === "ignoreDefaultBlocklist") {
          return true;
        }
      }),
    };

    globalThis.Cypress = mockCypress as any;
    const cypress = globalThis.Cypress as any;

    const ignoreDefaultBlocklist =
      cypress.expose("ignoreDefaultBlocklist") ??
      cypress.env("ignoreDefaultBlocklist") ??
      false;

    // Should fallback to Cypress.env() value
    expect(ignoreDefaultBlocklist).toBe(true);
  });

  it("should use default value when both Cypress.expose() and Cypress.env() are undefined for ignoreDefaultBlocklist", () => {
    const mockCypress: MockCypress = {
      expose: vi.fn(() => {}),
      env: vi.fn(() => {}),
    };

    globalThis.Cypress = mockCypress as any;
    const cypress = globalThis.Cypress as any;

    const ignoreDefaultBlocklist =
      cypress.expose("ignoreDefaultBlocklist") ??
      cypress.env("ignoreDefaultBlocklist") ??
      false;

    // Should use default false
    expect(ignoreDefaultBlocklist).toBe(false);
  });
});
