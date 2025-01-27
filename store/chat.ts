'use client'

import { create } from 'zustand'
import type { Message, ChatStore, ChatHistory } from '@/types/chat'
import { getCompletion } from '@/services/api'
import { STORAGE_KEYS } from '@/constants/storage'

// 工具函数：更新本地存储
const updateLocalStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

// 工具函数：转换消息中的日期并过滤无效消息
const convertDates = (messages: any[]): Message[] => {
  return messages
    .map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp || Date.now())
    }))
    .filter(msg => {
      // 用户消息：保留非空内容
      if (msg.role === 'user') {
        return msg.content.trim().length > 0
      }
      // AI消息：保留有内容或引用的消息
      if (msg.role === 'assistant') {
        const hasContent = msg.content.trim().length > 0
        const hasReferences = Array.isArray(msg.references) && msg.references.length > 0
        return hasContent || hasReferences
      }
      return false
    })
}

// 创建聊天状态管理store
export const useChatStore = create<ChatStore>()((set, get) => ({
  // 初始化消息列表
  messages: (() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES)
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
    return [{
      role: 'assistant',
      content: '你好！我是AI助手，有什么我可以帮你的吗？',
      timestamp: new Date()
    }]
  })(),

  // 生成当前会话ID
  currentChatId: crypto.randomUUID(),

  // 初始化聊天历史
  chatHistory: (() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY)
    return saved ? JSON.parse(saved) : []
  })(),

  // 状态标志
  isLoading: false,
  stopGeneration: false,
  isTyping: false,

  // 存储已停止的消息内容
  stoppedContent: (() => {
    const saved = localStorage.getItem('stopped-content')
    return saved ? JSON.parse(saved) : {}
  })(),

  // 设置停止生成标志
  setStopGeneration: (stop: boolean) => set({ stopGeneration: stop }),

  // 停止当前响应
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
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(updatedMessages))
      localStorage.setItem(`messages-${currentChatId}`, JSON.stringify(updatedMessages))
      
      // 保存停止内容到单独的存储
      localStorage.setItem('stopped-content', JSON.stringify(get().stoppedContent))
    }
  },

  // 停止打字动画
  stopTyping: () => {
    set({ isTyping: false })
  },

  // 添加新消息
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
        localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(newHistory))
      }

      // 使用当前消息列表更新存储
      const updatedMessages = [...processedMessages, message]
      localStorage.setItem(`messages-${currentChatId}`, JSON.stringify(updatedMessages))
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(updatedMessages))

      set({ isLoading: true })
      try {
        const response = await getCompletion({
          question: message.content,
          stream: false,
          session_id: currentChatId,
          // user_id: session?.user?.id  // 如果需要的话
        })
        
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
        const latestMessages = get().messages
        set({ messages: [...latestMessages, newMessage] })
        
        // 更新存储
        const allMessages = [...latestMessages, newMessage]
        localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(allMessages))
        
      } catch (error) {
        console.error('API error:', error)
        // 可以添加错误处理UI
      } finally {
        set({ isLoading: false })
      }
    }
  },

  // 清空当前会话
  clearMessages: () => {
    const newChatId = crypto.randomUUID()
    const welcomeMessage = {
      role: 'assistant' as const,
      content: '你好！我是AI助手，有什么我可以帮你的吗？',
      timestamp: new Date()
    }
    set({ currentChatId: newChatId, messages: [welcomeMessage] })
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify([welcomeMessage]))
  },

  // 加载指定会话
  loadChat: (chatId: string) => {
    const savedMessages = localStorage.getItem(`messages-${chatId}`)
    if (savedMessages) {
      const messages = convertDates(JSON.parse(savedMessages))
      set({ currentChatId: chatId, messages })
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages))
    }
  },

  // 更新最后一条消息
  updateLastMessage: (content: string) => {
    const { messages } = get()
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'assistant') {
      const updatedMessage = { ...lastMessage, content }
      set({ messages: [...messages.slice(0, -1), updatedMessage] })
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify([...messages.slice(0, -1), updatedMessage]))
    }
  }
}))
