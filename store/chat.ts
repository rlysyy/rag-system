import { create } from 'zustand'
import { StateCreator } from 'zustand'
import type { Message } from '@/types/chat'
import { getMockResponse } from '@/lib/mockData/ai-responses'

interface ChatHistory {
  id: string
  title: string
  timestamp: Date
}

interface ChatStore {
  messages: Message[]
  currentChatId: string
  chatHistory: ChatHistory[]
  isLoading: boolean
  stopGeneration: boolean
  isTyping: boolean
  addMessage: (message: Message) => Promise<void>
  clearMessages: () => void
  loadChat: (chatId: string) => void
  setStopGeneration: (stop: boolean) => void
  stopCurrentResponse: () => void
  stopTyping: () => void
  updateLastMessage: (content: string) => void
}

const updateLocalStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

const STORAGE_KEY = 'chat-messages'
const HISTORY_KEY = 'chat-history'

const convertDates = (messages: any[]): Message[] => {
  return messages.map(msg => ({
    ...msg,
    timestamp: new Date(msg.timestamp || Date.now())
  }))
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  messages: (() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const messages = convertDates(JSON.parse(saved))
      return messages
    }
    return [{
      role: 'assistant',
      content: '你好！我是AI助手，有什么我可以帮你的吗？',
      timestamp: new Date()
    }]
  })(),

  currentChatId: (() => {
    if (typeof window === 'undefined') return crypto.randomUUID()
    return crypto.randomUUID()
  })(),

  chatHistory: (() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem(HISTORY_KEY)
    return saved ? JSON.parse(saved).map((chat: any) => ({
      ...chat,
      timestamp: new Date(chat.timestamp)
    })) : []
  })(),

  isLoading: false,

  stopGeneration: false,

  isTyping: false,

  setStopGeneration: (stop: boolean) => set({ stopGeneration: stop }),

  stopCurrentResponse: () => {
    set({ 
      isLoading: false,
      stopGeneration: true,
      isTyping: false 
    })
  },

  stopTyping: () => {
    set({ isTyping: false })
  },

  addMessage: async (message: Message) => {
    const { messages, currentChatId, stopGeneration } = get()
    set({ stopGeneration: false })
    
    set(state => ({ messages: [...state.messages, message] }))

    if (message.role === 'user') {
      const isFirstUserMessage = !messages.some(m => m.role === 'user')
      
      if (isFirstUserMessage) {
        const title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
        set(state => ({
          chatHistory: [{
            id: currentChatId,
            title,
            timestamp: new Date()
          }, ...state.chatHistory.slice(0, 19)]
        }))
      }

      const updatedMessages = [...messages, message]
      localStorage.setItem(`messages-${currentChatId}`, JSON.stringify(updatedMessages))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages))

      set({ isLoading: true })
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const response = getMockResponse()
        
        if (get().stopGeneration) {
          return
        }
        
        const newMessage = {
          role: 'assistant' as const,
          content: response.content,
          timestamp: new Date(),
          references: response.references
        }

        set({ isTyping: true })
        set(state => ({ messages: [...state.messages, newMessage] }))
        
        const allMessages = [...updatedMessages, newMessage]
        localStorage.setItem(`messages-${currentChatId}`, JSON.stringify(allMessages))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allMessages))
      } finally {
        set({ isLoading: false })
      }
    }
  },

  clearMessages: () => {
    const newChatId = crypto.randomUUID()
    const { messages, currentChatId } = get()
    
    const hasUserMessage = messages.some(m => m.role === 'user')
    if (hasUserMessage) {
      const firstUserMessage = messages.find(m => m.role === 'user')
      if (firstUserMessage) {
        const title = firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '')
        localStorage.setItem(`messages-${currentChatId}`, JSON.stringify(messages))
        
        set(state => ({
          chatHistory: [{
            id: currentChatId,
            title,
            timestamp: new Date()
          }, ...state.chatHistory.filter(h => h.id !== currentChatId).slice(0, 19)]
        }))
      }
    }

    const welcomeMessage = {
      role: 'assistant' as const,
      content: '你好！我是AI助手，有什么我可以帮你的吗？',
      timestamp: new Date()
    }

    set({
      currentChatId: newChatId,
      messages: [welcomeMessage]
    })

    localStorage.setItem(STORAGE_KEY, JSON.stringify([welcomeMessage]))
    localStorage.removeItem(`messages-${newChatId}`)
  },

  loadChat: (chatId: string) => {
    const savedMessages = localStorage.getItem(`messages-${chatId}`)
    if (savedMessages) {
      set({
        currentChatId: chatId,
        messages: convertDates(JSON.parse(savedMessages))
      })
      localStorage.setItem(STORAGE_KEY, savedMessages)
    }
  },

  updateLastMessage: (content: string) => {
    const { messages } = get()
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      const updatedMessage = {
        ...lastMessage,
        content: content + '\n\n这条消息已停止'
      }
      set({
        messages: [...messages.slice(0, -1), updatedMessage]
      })
      
      // 更新本地存储
      const currentChatId = get().currentChatId
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...messages.slice(0, -1), updatedMessage]))
      localStorage.setItem(`messages-${currentChatId}`, JSON.stringify([...messages.slice(0, -1), updatedMessage]))
    }
  }
})) 