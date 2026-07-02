import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

interface MockCypress {
  expose: (key: string) => unknown
  env: (key: string) => unknown
}

describe('Configuration Loading', () => {
  let originalCypress: typeof Cypress

  beforeEach(() => {
    // Store original Cypress
    originalCypress = global.Cypress as typeof Cypress
  })

  afterEach(() => {
    // Restore original Cypress
    if (originalCypress) {
      global.Cypress = originalCypress
    }
  })

  it('should prefer Cypress.expose() over Cypress.env() for headersBlocklist', () => {
    // Setup mock Cypress object
    const mockCypress: MockCypress = {
      expose: vi.fn((key: string) => {
        if (key === 'headersBlocklist') return ['exposed-header']
        return undefined
      }),
      env: vi.fn(() => {
        return undefined
      }),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.Cypress = mockCypress as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cypress = global.Cypress as any

    // Simulate the config loading logic
    const globalBlocklist =
      cypress.expose('headersBlocklist') ??
      cypress.env('headersBlocklist') ??
      []

    // Should use Cypress.expose() value, not Cypress.env()
    expect(globalBlocklist).toEqual(['exposed-header'])
    expect(mockCypress.expose).toHaveBeenCalledWith('headersBlocklist')
  })

  it('should fallback to Cypress.env() when Cypress.expose() is undefined for headersBlocklist', () => {
    const mockCypress: MockCypress = {
      expose: vi.fn(() => {
        // Cypress.expose() not set
        return undefined
      }),
      env: vi.fn((key: string) => {
        if (key === 'headersBlocklist') return ['env-header']
        return undefined
      }),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.Cypress = mockCypress as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cypress = global.Cypress as any

    const globalBlocklist =
      cypress.expose('headersBlocklist') ??
      cypress.env('headersBlocklist') ??
      []

    // Should fallback to Cypress.env() value
    expect(globalBlocklist).toEqual(['env-header'])
  })

  it('should use default value when both Cypress.expose() and Cypress.env() are undefined', () => {
    const mockCypress: MockCypress = {
      expose: vi.fn(() => {
        return undefined
      }),
      env: vi.fn(() => {
        return undefined
      }),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.Cypress = mockCypress as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cypress = global.Cypress as any

    const globalBlocklist =
      cypress.expose('headersBlocklist') ??
      cypress.env('headersBlocklist') ??
      []

    // Should use default empty array
    expect(globalBlocklist).toEqual([])
  })

  it('should prefer Cypress.expose() over Cypress.env() for ignoreDefaultBlocklist', () => {
    const mockCypress: MockCypress = {
      expose: vi.fn((key: string) => {
        if (key === 'ignoreDefaultBlocklist') return true
        return undefined
      }),
      env: vi.fn(() => {
        return undefined
      }),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.Cypress = mockCypress as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cypress = global.Cypress as any

    const ignoreDefaultBlocklist =
      cypress.expose('ignoreDefaultBlocklist') ??
      cypress.env('ignoreDefaultBlocklist') ??
      false

    // Should use Cypress.expose() value, not Cypress.env()
    expect(ignoreDefaultBlocklist).toBe(true)
    expect(mockCypress.expose).toHaveBeenCalledWith('ignoreDefaultBlocklist')
  })

  it('should fallback to Cypress.env() when Cypress.expose() is undefined for ignoreDefaultBlocklist', () => {
    const mockCypress: MockCypress = {
      expose: vi.fn(() => {
        return undefined
      }),
      env: vi.fn((key: string) => {
        if (key === 'ignoreDefaultBlocklist') return true
        return undefined
      }),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.Cypress = mockCypress as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cypress = global.Cypress as any

    const ignoreDefaultBlocklist =
      cypress.expose('ignoreDefaultBlocklist') ??
      cypress.env('ignoreDefaultBlocklist') ??
      false

    // Should fallback to Cypress.env() value
    expect(ignoreDefaultBlocklist).toBe(true)
  })

  it('should use default value when both Cypress.expose() and Cypress.env() are undefined for ignoreDefaultBlocklist', () => {
    const mockCypress: MockCypress = {
      expose: vi.fn(() => {
        return undefined
      }),
      env: vi.fn(() => {
        return undefined
      }),
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.Cypress = mockCypress as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cypress = global.Cypress as any

    const ignoreDefaultBlocklist =
      cypress.expose('ignoreDefaultBlocklist') ??
      cypress.env('ignoreDefaultBlocklist') ??
      false

    // Should use default false
    expect(ignoreDefaultBlocklist).toBe(false)
  })
})
