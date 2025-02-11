import type { Message } from '@/types/chat'

export const messageUtils = {
  convertDates: (messages: any): Message[] => {
    if (!Array.isArray(messages)) return []
    return messages
      .map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp || Date.now())
      }))
      .filter(msg => {
        if (msg.role === 'user') return msg.content.trim().length > 0
        if (msg.role === 'assistant') {
          return msg.content.trim().length > 0 || 
            (Array.isArray(msg.references) && msg.references.length > 0)
        }
        return false
      })
  },

  createWelcomeMessage: (): Message => ({
    role: 'assistant' as const,
    content: '你好！我是AI助手，有什么我可以帮你的吗？',
    timestamp: new Date(),
    references: []
  })
} 