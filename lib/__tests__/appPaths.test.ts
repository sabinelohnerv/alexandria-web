import { HOME_PATH } from '../appPaths'

describe('appPaths', () => {
  it('should export HOME_PATH constant', () => {
    expect(HOME_PATH).toBe('/')
  })

  it('should be a string', () => {
    expect(typeof HOME_PATH).toBe('string')
  })

  it('should start with a forward slash', () => {
    expect(HOME_PATH).toMatch(/^\//)
  })
})
