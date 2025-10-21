import { ACCESS_COOKIE, REFRESH_COOKIE, cookieOpts, refreshMaxAge } from '../cookies'

describe('auth/cookies', () => {
  describe('constants', () => {
    it('should export ACCESS_COOKIE constant', () => {
      expect(ACCESS_COOKIE).toBe('access_token')
    })

    it('should export REFRESH_COOKIE constant', () => {
      expect(REFRESH_COOKIE).toBe('refresh_token')
    })

    it('should export refreshMaxAge constant', () => {
      expect(refreshMaxAge).toBe(60 * 60 * 24 * 7) // 7 days in seconds
    })
  })

  describe('cookieOpts', () => {
    it('should have httpOnly set to true', () => {
      expect(cookieOpts.httpOnly).toBe(true)
    })

    it('should have sameSite set to lax', () => {
      expect(cookieOpts.sameSite).toBe('lax')
    })

    it('should have path set to /', () => {
      expect(cookieOpts.path).toBe('/')
    })

    it('should have secure based on NODE_ENV', () => {
      // In production, secure should be true
      if (process.env.NODE_ENV === 'production') {
        expect(cookieOpts.secure).toBe(true)
      } else {
        // In development/test, secure should be false
        expect(cookieOpts.secure).toBe(false)
      }
    })
  })
})
