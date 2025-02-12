import { storage } from '@/lib/storage'
import { messageUtils } from '@/utils/messageUtils'
import { STORAGE_KEYS } from '@/constants/storage'
import type { Message, ChatHistory } from '@/types/chat'

export const chatService = {
  initialize: () => {
    try {
      const lastChatId = storage.get(STORAGE_KEYS.LAST_CHAT_ID)
      const currentChatId = lastChatId || crypto.randomUUID()
      
      const savedHistory = storage.get(STORAGE_KEYS.CHAT_HISTORY)
      const chatHistory = savedHistory ? 
        JSON.parse(savedHistory) : []
      
      const savedMessages = storage.get(`${STORAGE_KEYS.CHAT_MESSAGES}-${currentChatId}`)
      const messages = savedMessages ? 
        messageUtils.convertDates(JSON.parse(savedMessages)) : 
        [messageUtils.createWelcomeMessage()]

      storage.set(STORAGE_KEYS.LAST_CHAT_ID, currentChatId)

      return { messages, chatHistory, currentChatId }
    } catch (error) {
      console.error('Failed to initialize chat:', error)
      return {
        messages: [messageUtils.createWelcomeMessage()],
        chatHistory: [],
        currentChatId: crypto.randomUUID()
      }
    }
  },

  saveMessages: (currentChatId: string, messages: Message[]) => {
    storage.set(`${STORAGE_KEYS.CHAT_MESSAGES}-${currentChatId}`, messages)
  },

  saveHistory: (history: ChatHistory[]) => {
    storage.set(STORAGE_KEYS.CHAT_HISTORY, history)
  },

  db: {
    async saveMessage(sessionId: string, message: Message, userId: string) {
      try {
        const response = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sessionId,
            message,
            userId
          }),
          credentials: 'include'
        })
        return await response.json()
      } catch (error) {
        console.error('Failed to save to DB:', error)
        return null
      }
    },

    async loadUserSessions(userId: string) {
      try {
        const response = await fetch(`/api/chat/sessions?userId=${userId}`, {
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
        return await response.json()
      } catch (error) {
        console.error('Failed to load from DB:', error)
        return []
      }
    },

    async loadSessionMessages(sessionId: string) {
      try {
        const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`, {
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
        return await response.json()
      } catch (error) {
        console.error('Failed to load session messages:', error)
        return []
      }
    },

    async createSession(userId: string, title: string) {
      try {
        const response = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId, title }),
          credentials: 'include'
        })
        return await response.json()
      } catch (error) {
        console.error('Failed to create session:', error)
        return null
      }
    }
  }
} 