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
  stoppedContent: Record<string, string>
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
  return messages
    .map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp || Date.now())
    }))
    // 修改过滤逻辑，保留已停止的消息
    .filter(msg => {
      // 如果是用户消息，保留非空内容
      if (msg.role === 'user') {
        return msg.content.trim().length > 0
      }
      // 如果是AI消息，检查内容
      if (msg.role === 'assistant') {
        // 保留有内容的消息，包括已停止的消息
        const hasContent = msg.content.trim().length > 0
        const hasReferences = Array.isArray(msg.references) && msg.references.length > 0
        return hasContent || hasReferences
      }
      return false
    })
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  messages: (() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const messages = convertDates(JSON.parse(saved))
      // 如果只有一条空白的AI消息（没有引用），返回空数组
      if (messages.length === 1 && 
          messages[0].role === 'assistant' && 
          !messages[0].content.trim() && 
          (!messages[0].references || messages[0].references.length === 0)) {
        return [{
          role: 'assistant',
          content: '你好！我是AI助手，有什么我可以帮你的吗？',
          timestamp: new Date()
        }]
      }
      return messages
    }
    // 返回欢迎消息
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

  stoppedContent: (() => {
    if (typeof window === 'undefined') return {}
    const saved = localStorage.getItem('stopped-content')
    return saved ? JSON.parse(saved) : {}
  })(),

  setStopGeneration: (stop: boolean) => set({ stopGeneration: stop }),

  stopCurrentResponse: () => {
    const { messages } = get()
    const lastMessage = messages[messages.length - 1]
    
    if (lastMessage && lastMessage.role === 'assistant') {
      // 获取当前显示的内容
      const displayedContent = document.querySelector('.typing-content')?.textContent || lastMessage.content

      // 创建更新后的消息
      const updatedMessage = {
        ...lastMessage,
        content: displayedContent + '\n\n这条消息已停止',
        references: []
      }

      // 更新状态
      set({
        isLoading: false,
        stopGeneration: true,
        isTyping: false,
        messages: [...messages.slice(0, -1), updatedMessage],
        // 保存停止时的内容到 stoppedContent
        stoppedContent: {
          ...get().stoppedContent,
          [lastMessage.timestamp.getTime()]: displayedContent
        }
      })

      // 更新本地存储
      const currentChatId = get().currentChatId
      const updatedMessages = [...messages.slice(0, -1), updatedMessage]
      
      // 保存到消息存储
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages))
      localStorage.setItem(`messages-${currentChatId}`, JSON.stringify(updatedMessages))
      
      // 保存停止内容到单独的存储
      localStorage.setItem('stopped-content', JSON.stringify(get().stoppedContent))
    }
  },

  stopTyping: () => {
    set({ isTyping: false })
  },

  addMessage: async (message: Message) => {
    const { messages, currentChatId, stoppedContent } = get()
    set({ stopGeneration: false })
    
    // 使用保存的停止内容替换完整内容
    const processedMessages = messages.map(msg => {
      if (msg.role === 'assistant') {
        const stoppedMsg = stoppedContent[msg.timestamp.getTime()]
        if (stoppedMsg) {
          return {
            ...msg,
            content: stoppedMsg + '\n\n这条消息已停止',
            references: []
          }
        }
      }
      return msg
    })

    set({ messages: [...processedMessages, message] })

    if (message.role === 'user') {
      const isFirstUserMessage = !processedMessages.some(m => m.role === 'user')
      
      if (isFirstUserMessage) {
        const title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
        const newHistory = [{
          id: currentChatId,
          title,
          timestamp: new Date()
        }, ...get().chatHistory.slice(0, 19)]
        
        set({ chatHistory: newHistory })
        // 保存对话历史到本地存储
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
      }

      // 使用当前消息列表更新存储
      const updatedMessages = [...processedMessages, message]
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
        // 使用最新的消息列表
        const latestMessages = get().messages
        set({ messages: [...latestMessages, newMessage] })
        
        // 更新存储
        const allMessages = [...latestMessages, newMessage]
        localStorage.setItem(`messages-${currentChatId}`, JSON.stringify(allMessages))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allMessages))
      } finally {
        set({ isLoading: false })
      }
    }
  },

  clearMessages: () => {
    const newChatId = crypto.randomUUID()
    const { messages, currentChatId, chatHistory } = get()
    
    // 只有当前对话有用户消息时才保存到历史记录
    const hasUserMessage = messages.some(m => m.role === 'user')
    if (hasUserMessage) {
      const firstUserMessage = messages.find(m => m.role === 'user')
      if (firstUserMessage) {
        const title = firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '')
        
        // 保存当前对话消息
        localStorage.setItem(`messages-${currentChatId}`, JSON.stringify(messages))
        
        // 更新历史记录
        const newHistory = [{
          id: currentChatId,
          title,
          timestamp: new Date()
        }, ...chatHistory.filter(h => h.id !== currentChatId).slice(0, 19)]
        
        set({ chatHistory: newHistory })
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
      }
    }

    // 设置欢迎消息
    const welcomeMessage = {
      role: 'assistant' as const,
      content: '你好！我是AI助手，有什么我可以帮你的吗？',
      timestamp: new Date()
    }

    // 重置当前对话状态
    set({
      currentChatId: newChatId,
      messages: [welcomeMessage]
    })

    // 更新存储
    localStorage.setItem(STORAGE_KEY, JSON.stringify([welcomeMessage]))
    localStorage.removeItem(`messages-${newChatId}`) // 清除新对话的存储
  },

  loadChat: (chatId: string) => {
    const savedMessages = localStorage.getItem(`messages-${chatId}`)
    if (savedMessages) {
      const messages = convertDates(JSON.parse(savedMessages))
      // 只在有有效消息时加载
      if (messages.length > 0) {
        set({
          currentChatId: chatId,
          messages
        })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      }
    }
  },

  updateLastMessage: (content: string) => {
    const { messages } = get()
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      // 保存当前打字的内容
      set(state => ({
        stoppedContent: {
          ...state.stoppedContent,
          [lastMessage.timestamp.getTime()]: content
        }
      }))

      // 只有在消息停止时才添加停止标记
      const messageContent = content + (content.endsWith('这条消息已停止') ? '' : '\n\n这条消息已停止')
      const updatedMessage = {
        ...lastMessage,
        content: messageContent,
        references: []
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