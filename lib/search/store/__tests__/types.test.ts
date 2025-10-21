import { toUIMessage } from '../types'

describe('search/store/types', () => {
  describe('toUIMessage', () => {
    it('should convert API message to UI message format', () => {
      const apiMessage = {
        id: 123,
        role: 'user' as const,
        text: 'Test message',
        created_at: '2024-01-01T12:00:00Z',
        session: 1,
        useful_count: 0,
        not_useful_count: 0,
        my_feedback_label: null,
      }

      const result = toUIMessage(apiMessage)

      expect(result).toEqual({
        id: 123,
        role: 'user',
        content: 'Test message',
        createdAt: '2024-01-01T12:00:00Z',
      })
    })

    it('should handle assistant role', () => {
      const apiMessage = {
        id: 456,
        role: 'assistant' as const,
        text: 'Assistant response',
        created_at: '2024-01-01T12:01:00Z',
        session: 1,
        useful_count: 0,
        not_useful_count: 0,
        my_feedback_label: null,
      }

      const result = toUIMessage(apiMessage)

      expect(result.role).toBe('assistant')
      expect(result.content).toBe('Assistant response')
    })

    it('should handle system role', () => {
      const apiMessage = {
        id: 789,
        role: 'system' as const,
        text: 'System message',
        created_at: '2024-01-01T12:02:00Z',
        session: 1,
        useful_count: 0,
        not_useful_count: 0,
        my_feedback_label: null,
      }

      const result = toUIMessage(apiMessage)

      expect(result.role).toBe('system')
      expect(result.content).toBe('System message')
    })

    it('should preserve message ID', () => {
      const apiMessage = {
        id: 999,
        role: 'user' as const,
        text: 'Test',
        created_at: '2024-01-01T12:00:00Z',
        session: 1,
        useful_count: 0,
        not_useful_count: 0,
        my_feedback_label: null,
      }

      const result = toUIMessage(apiMessage)

      expect(result.id).toBe(999)
    })

    it('should convert text to content and created_at to createdAt', () => {
      const timestamp = '2024-01-01T15:30:45Z'
      const apiMessage = {
        id: 111,
        role: 'user' as const,
        text: 'Test message text',
        created_at: timestamp,
        session: 1,
        useful_count: 0,
        not_useful_count: 0,
        my_feedback_label: null,
      }

      const result = toUIMessage(apiMessage)

      expect(result.content).toBe('Test message text')
      expect(result.createdAt).toBe(timestamp)
      expect(result).not.toHaveProperty('text')
      expect(result).not.toHaveProperty('created_at')
    })

    it('should not include session or feedback properties in UI message', () => {
      const apiMessage = {
        id: 222,
        role: 'user' as const,
        text: 'Test',
        created_at: '2024-01-01T12:00:00Z',
        session: 1,
        useful_count: 5,
        not_useful_count: 2,
        my_feedback_label: 'useful' as const,
      }

      const result = toUIMessage(apiMessage)

      expect(result).not.toHaveProperty('session')
      expect(result).not.toHaveProperty('useful_count')
      expect(result).not.toHaveProperty('not_useful_count')
      expect(result).not.toHaveProperty('my_feedback_label')
    })
  })
})
