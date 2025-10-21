import { nextDraftId } from '../utils'

describe('search/store/utils', () => {
  describe('nextDraftId', () => {
    it('should return negative sequential IDs', () => {
      // Reset the module to start fresh
      jest.resetModules()
      const { nextDraftId: freshNextDraftId } = require('../utils')
      
      const id1 = freshNextDraftId()
      const id2 = freshNextDraftId()
      const id3 = freshNextDraftId()

      expect(id1).toBeLessThan(0)
      expect(id2).toBeLessThan(0)
      expect(id3).toBeLessThan(0)
      
      expect(id2).toBe(id1 - 1)
      expect(id3).toBe(id2 - 1)
    })

    it('should generate unique IDs on each call', () => {
      const ids = new Set()
      
      for (let i = 0; i < 100; i++) {
        ids.add(nextDraftId())
      }
      
      expect(ids.size).toBe(100)
    })

    it('should always return negative numbers', () => {
      for (let i = 0; i < 10; i++) {
        const id = nextDraftId()
        expect(id).toBeLessThan(0)
      }
    })
  })
})
