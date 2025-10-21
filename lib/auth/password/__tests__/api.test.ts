import {
  requestPasswordReset,
  resendPasswordReset,
  confirmPasswordReset,
  passwordResetStatus,
} from '../api'

describe('auth/password/api', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('requestPasswordReset', () => {
    it('should send POST request with email', async () => {
      const mockResponse = { detail: 'Reset email sent' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await requestPasswordReset({ email: 'test@example.com' })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/password/request-reset',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com' }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on failed request', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ detail: 'Invalid email' }),
      })

      await expect(
        requestPasswordReset({ email: 'invalid' })
      ).rejects.toThrow('Invalid email')
    })

    it('should handle JSON parsing errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Parse error')
        },
      })

      await expect(
        requestPasswordReset({ email: 'test@example.com' })
      ).rejects.toThrow()
    })
  })

  describe('resendPasswordReset', () => {
    it('should send POST request to resend endpoint', async () => {
      const mockResponse = { detail: 'Reset email resent' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await resendPasswordReset({ email: 'test@example.com' })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/password/resend-reset',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('confirmPasswordReset', () => {
    it('should send POST request with email, otp_code, and new_password', async () => {
      const mockResponse = { detail: 'Password reset successful' }
      const body = {
        email: 'test@example.com',
        otp_code: '123456',
        new_password: 'newPassword123',
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await confirmPasswordReset(body)

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/password/confirm',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify(body),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should handle validation errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          new_password: ['Password too weak'],
        }),
      })

      await expect(
        confirmPasswordReset({
          email: 'test@example.com',
          otp_code: '123456',
          new_password: '123',
        })
      ).rejects.toThrow('Password too weak')
    })
  })

  describe('passwordResetStatus', () => {
    it('should send GET request with encoded email', async () => {
      const mockResponse = {
        email: 'test@example.com',
        otp_sent: true,
        otp_expires_at: '2024-01-01T00:00:00Z',
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await passwordResetStatus('test@example.com')

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/password/status?email=test%40example.com',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should properly encode special characters in email', async () => {
      const mockResponse = { email: 'test+tag@example.com', otp_sent: false }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await passwordResetStatus('test+tag@example.com')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test%2Btag%40example.com'),
        expect.any(Object)
      )
    })
  })
})
