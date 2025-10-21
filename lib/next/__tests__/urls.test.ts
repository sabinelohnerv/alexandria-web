import { getBaseUrl } from '../urls'

// Mock next/headers
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}))

describe('next/urls', () => {
  describe('getBaseUrl', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should construct URL from x-forwarded headers', async () => {
      const { headers } = require('next/headers')
      headers.mockResolvedValue({
        get: jest.fn((key: string) => {
          if (key === 'x-forwarded-proto') return 'https'
          if (key === 'x-forwarded-host') return 'example.com'
          return null
        }),
      })

      const result = await getBaseUrl()
      expect(result).toBe('https://example.com')
    })

    it('should fallback to host header when x-forwarded-host is not present', async () => {
      const { headers } = require('next/headers')
      headers.mockResolvedValue({
        get: jest.fn((key: string) => {
          if (key === 'x-forwarded-proto') return 'https'
          if (key === 'host') return 'myapp.com'
          return null
        }),
      })

      const result = await getBaseUrl()
      expect(result).toBe('https://myapp.com')
    })

    it('should default to http protocol when x-forwarded-proto is not present', async () => {
      const { headers } = require('next/headers')
      headers.mockResolvedValue({
        get: jest.fn((key: string) => {
          if (key === 'host') return 'localhost:3000'
          return null
        }),
      })

      const result = await getBaseUrl()
      expect(result).toBe('http://localhost:3000')
    })

    it('should default to localhost:3000 when no headers are present', async () => {
      const { headers } = require('next/headers')
      headers.mockResolvedValue({
        get: jest.fn(() => null),
      })

      const result = await getBaseUrl()
      expect(result).toBe('http://localhost:3000')
    })

    it('should handle port numbers in host header', async () => {
      const { headers } = require('next/headers')
      headers.mockResolvedValue({
        get: jest.fn((key: string) => {
          if (key === 'x-forwarded-proto') return 'http'
          if (key === 'host') return 'localhost:8080'
          return null
        }),
      })

      const result = await getBaseUrl()
      expect(result).toBe('http://localhost:8080')
    })

    it('should prioritize x-forwarded-host over host', async () => {
      const { headers } = require('next/headers')
      headers.mockResolvedValue({
        get: jest.fn((key: string) => {
          if (key === 'x-forwarded-proto') return 'https'
          if (key === 'x-forwarded-host') return 'forwarded.com'
          if (key === 'host') return 'direct.com'
          return null
        }),
      })

      const result = await getBaseUrl()
      expect(result).toBe('https://forwarded.com')
    })
  })
})
