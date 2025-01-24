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
  // 从 localStorage 获取或生成新的 chatId
  const [currentChatId] = useState<string>(() => {
    if (typeof window === 'undefined') return crypto.randomUUID()
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const messages = safeJSONParse(saved)
      // 如果有用户消息，使用现有的对话
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
      setIsLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const response = getMockResponse()
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          references: response.references
        }])
      } catch (error) {
        console.error('Failed to get response:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([{
      role: 'assistant',
      content: '你好！我是AI助手，有什么我可以帮你的吗？',
      timestamp: new Date()
    }])
    // 不再需要设置 currentChatId，因为它是常量
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('Failed to clear messages:', e)
    }
  }, [])

  return {
    messages,
    addMessage,
    clearMessages,
    isLoading,
    currentChatId,
    chatHistory
  }
} 