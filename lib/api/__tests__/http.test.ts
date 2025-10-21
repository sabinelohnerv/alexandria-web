import { fetchJson } from '../http'

// Mock environment variables
const originalEnv = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = { ...originalEnv }
  global.fetch = jest.fn()
})

afterEach(() => {
  process.env = originalEnv
})

describe('http', () => {
  describe('fetchJson', () => {
    it('should fetch and parse JSON successfully', async () => {
      const mockData = { id: 1, name: 'Test' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await fetchJson('test/path')
      expect(result).toEqual(mockData)
    })

    it('should add trailing slash for POST requests', async () => {
      const mockData = { success: true }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      await fetchJson('test/path', { method: 'POST' })
      
      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(callUrl).toContain('test/path/')
    })

    it('should add trailing slash for search/ routes', async () => {
      const mockData = { results: [] }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      await fetchJson('search/sessions', { method: 'GET' })
      
      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(callUrl).toContain('search/sessions/')
    })

    it('should handle query parameters correctly', async () => {
      const mockData = { results: [] }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      await fetchJson('test/path?foo=bar&baz=qux')
      
      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(callUrl).toContain('?foo=bar&baz=qux')
    })

    it('should throw error on non-ok response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Resource not found',
      })

      await expect(fetchJson('test/path')).rejects.toThrow('HTTP 404')
    })

    it('should include Content-Type header', async () => {
      const mockData = { success: true }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      await fetchJson('test/path', { method: 'POST' })
      
      const callInit = (global.fetch as jest.Mock).mock.calls[0][1]
      expect(callInit.headers['Content-Type']).toBe('application/json')
    })

    it('should parse as text when parseAs is "text"', async () => {
      const mockText = 'Plain text response'
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => mockText,
      })

      const result = await fetchJson('test/path', { parseAs: 'text' })
      expect(result).toBe(mockText)
    })

    it('should preserve custom headers', async () => {
      const mockData = { success: true }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      await fetchJson('test/path', {
        headers: { 'X-Custom-Header': 'custom-value' },
      })
      
      const callInit = (global.fetch as jest.Mock).mock.calls[0][1]
      expect(callInit.headers['X-Custom-Header']).toBe('custom-value')
      expect(callInit.headers['Content-Type']).toBe('application/json')
    })

    it('should not add trailing slash to paths with file extensions', async () => {
      const mockData = { success: true }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      await fetchJson('test/file.json', { method: 'POST' })
      
      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(callUrl).not.toContain('file.json/')
    })
  })
})
