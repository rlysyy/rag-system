import { useState, useCallback, useEffect } from 'react'
import type { Message } from '@/types/chat'
import { getMockResponse } from '@/lib/mockData/ai-responses'

const STORAGE_KEY = 'chat-messages'
const HISTORY_KEY = 'chat-history'

interface ChatHistory {
  id: string
  title: string
  timestamp: Date
}

// 帮助函数：转换日期
const convertDates = (messages: any[]): Message[] => {
  return messages.map(msg => ({
    ...msg,
    timestamp: new Date(msg.timestamp || Date.now())
  }))
}

// 安全地解析 JSON
const safeJSONParse = (str: string | null, fallback: any = []) => {
  if (!str) return fallback
  try {
    return JSON.parse(str)
  } catch (e) {
    console.error('Failed to parse JSON:', e)
    return fallback
  }
}

export function useChat() {
  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    if (typeof window === 'undefined') return crypto.randomUUID()
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const messages = safeJSONParse(saved)
      const hasUserMessage = messages.some((msg: Message) => msg.role === 'user')
      if (hasUserMessage) {
        const history = safeJSONParse(localStorage.getItem(HISTORY_KEY))
        return history?.[0]?.id || crypto.randomUUID()
      }
    }
    return crypto.randomUUID()
  })

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const messages = convertDates(safeJSONParse(saved))
      // 如果没有用户消息，清除历史记录并显示欢迎消息
      if (!messages.some(msg => msg.role === 'user')) {
        localStorage.removeItem(STORAGE_KEY)
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
  })
  
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem(HISTORY_KEY)
    const history = saved ? safeJSONParse(saved).map((chat: any) => ({
      ...chat,
      timestamp: new Date(chat.timestamp)
    })) : []
    // 只保留有效的对话（有用户消息的对话）
    return history.filter((chat: ChatHistory) => {
      const messages = safeJSONParse(localStorage.getItem(`messages-${chat.id}`))
      return messages?.some((msg: Message) => msg.role === 'user')
    })
  })

  const [isLoading, setIsLoading] = useState(false)

  // 保存消息到localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
        
        // 只在第一条用户消息时更新对话历史
        const firstUserMessage = messages.find(m => m.role === 'user')
        if (firstUserMessage) {
          const title = firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '')
          
          setChatHistory(prev => {
            const newHistory = prev.filter(h => h.id !== currentChatId)
            return [{
              id: currentChatId,
              title,
              timestamp: new Date()
            }, ...newHistory]
          })
        }
      } catch (e) {
        console.error('Failed to save messages:', e)
      }
    }
  }, [messages, currentChatId])

  // 保存对话历史到localStorage
  useEffect(() => {
    if (chatHistory.length > 0) {
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(chatHistory))
      } catch (e) {
        console.error('Failed to save chat history:', e)
      }
    }
  }, [chatHistory])

  const addMessage = useCallback(async (message: Message) => {
    setMessages(prev => [...prev, {
      ...message,
      timestamp: message.timestamp || new Date()
    }])
    
    if (message.role === 'user') {
      // 检查是否是当前对话的第一条用户消息
      const isFirstUserMessage = !messages.some(m => m.role === 'user')
      
      if (isFirstUserMessage) {
        // 立即创建并添加到对话历史
        const title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
        setChatHistory(prev => [{
          id: currentChatId,
          title,
          timestamp: new Date()
        }, ...prev.slice(0, 19)]) // 保持最多20条记录
      }

      // 保存当前对话的消息
      const updatedMessages = [...messages, message]
      localStorage.setItem(`messages-${currentChatId}`, JSON.stringify(updatedMessages))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages))

      setIsLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const response = getMockResponse()
        
        const newMessage = {
          role: 'assistant' as const,
          content: response.content,
          timestamp: new Date(),
          references: response.references
        }

        setMessages(prev => [...prev, newMessage])
        
        // 更新存储
        const allMessages = [...updatedMessages, newMessage]
        localStorage.setItem(`messages-${currentChatId}`, JSON.stringify(allMessages))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allMessages))
      } catch (error) {
        console.error('Failed to get response:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }, [messages, currentChatId])

  const clearMessages = useCallback(() => {
    // 生成新的对话ID
    const newChatId = crypto.randomUUID()
    
    // 如果当前对话有用户消息，保存到历史记录
    const hasUserMessage = messages.some(m => m.role === 'user')
    if (hasUserMessage) {
      const firstUserMessage = messages.find(m => m.role === 'user')
      if (firstUserMessage) {
        const title = firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '')
        const historyEntry = {
          id: currentChatId,
          title,
          timestamp: new Date()
        }
        
        // 保存当前对话消息
        localStorage.setItem(`messages-${currentChatId}`, JSON.stringify(messages))
        
        // 更新历史记录
        setChatHistory(prev => {
          const newHistory = prev.filter(h => h.id !== currentChatId)
          return [historyEntry, ...newHistory].slice(0, 20)
        })
      }
    }
    
    // 重置当前对话
    const welcomeMessage = {
      role: 'assistant' as const,
      content: '你好！我是AI助手，有什么我可以帮你的吗？',
      timestamp: new Date()
    }
    
    // 直接更新状态
    setCurrentChatId(newChatId)
    setMessages([welcomeMessage])
    
    // 更新 localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify([welcomeMessage]))
    localStorage.removeItem(`messages-${newChatId}`)
  }, [messages, currentChatId])

  const loadChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId) // 更新当前对话ID
    const savedMessages = localStorage.getItem(`messages-${chatId}`)
    if (savedMessages) {
      setMessages(convertDates(JSON.parse(savedMessages)))
      localStorage.setItem(STORAGE_KEY, savedMessages)
    }
  }, [])

  // 在组件顶部添加这个 effect
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        role: 'assistant' as const,
        content: '你好！我是AI助手，有什么我可以帮你的吗？',
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [messages])

  return {
    messages,
    addMessage,
    clearMessages,
    loadChat,
    isLoading,
    currentChatId,
    chatHistory
  }
}
