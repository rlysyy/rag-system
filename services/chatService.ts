import { storage } from '@/lib/storage'
import { messageUtils } from '@/utils/messageUtils'
import { STORAGE_KEYS } from '@/constants/storage'
import type { Message, ChatHistory } from '@/types/chat'

export const chatService = {
  initialize: () => {
    try {
      const lastChatId = storage.get(STORAGE_KEYS.LAST_CHAT_ID)
      const currentChatId = lastChatId || crypto.randomUUID()
      
      const savedMessages = storage.get(`${STORAGE_KEYS.CHAT_MESSAGES}-${currentChatId}`)
      console.log('Saved messages from storage:', savedMessages) // 调试日志
      
      let messages: Message[] = []
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages)
          messages = messageUtils.convertDates(parsedMessages)
          console.log('Parsed messages:', messages) // 调试日志
        } catch (e) {
          console.error('Failed to parse saved messages:', e)
          messages = [messageUtils.createWelcomeMessage()]
        }
      } else {
        messages = [messageUtils.createWelcomeMessage()]
      }

      const savedHistory = storage.get(STORAGE_KEYS.CHAT_HISTORY)
      const chatHistory = savedHistory ? 
        JSON.parse(savedHistory).map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp)
        })) : []

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

  saveMessages: (chatId: string, messages: Message[]) => {
    try {
      const messagesToSave = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : new Date().toISOString(),
        // 确保 references 被正确保存
        references: Array.isArray(msg.references) ? msg.references : []
      }))
      
      const key = `${STORAGE_KEYS.CHAT_MESSAGES}-${chatId}`
      console.log('Saving messages:', messagesToSave) // 调试日志
      storage.set(key, JSON.stringify(messagesToSave))
    } catch (error) {
      console.error('Failed to save messages:', error)
    }
  },

  saveHistory: (history: ChatHistory[]) => {
    storage.set(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(history))
  },

  db: {
    async saveMessage(sessionId: string, message: Message, userId: string) {
      try {
        const response = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId, message }),
        })

        if (!response.ok) {
          const error = await response.text()
          throw new Error(error)
        }

        return await response.json()
      } catch (error: any) {
        console.error('Failed to save message:', error)
        throw new Error(error.message || 'Failed to save message')
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
        console.log('Creating session with:', { userId, title })
        const response = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title }),
          credentials: 'include'
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Session creation failed:', errorText)
          throw new Error(errorText)
        }

        const data = await response.json()
        console.log('Session created:', data)
        return data
      } catch (error: any) {
        console.error('Failed to create session:', error)
        throw error
      }
    }
  }
} 