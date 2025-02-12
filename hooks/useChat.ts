import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import type { Message, ChatHistory } from '@/types/chat'
import { chatService } from '@/services/chatService'
import { getMockResponse } from '@/lib/mockData/ai-responses'

const STORAGE_KEY = 'chat-messages'
const HISTORY_KEY = 'chat-history'

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
  console.log('useChat hook initializing...')  // 初始化日志
  
  const { data: session, status } = useSession()
  console.log('useSession result:', { status, session })  // session 状态日志

  // 添加调试日志
  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)
  }, [session, status])

  // 当前会话ID状态
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

  // 消息列表状态
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
  
  // 聊天历史状态
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

  // 初始化：从数据库加载数据
  useEffect(() => {
    async function loadFromDB() {
      console.log('loadFromDB called with:', { session })  // 日志
      if (!session?.user?.id) return
      
      try {
        // 加载用户的会话列表
        const dbSessions = await chatService.db.loadUserSessions(session.user.id)
        console.log('Loaded sessions:', dbSessions)  // 日志
        if (dbSessions.length > 0) {
          // 更新本地历史记录
          setChatHistory(prev => [...prev, ...dbSessions])
        }
      } catch (error) {
        console.error('Failed to load from DB:', error)
      }
    }

    loadFromDB()
  }, [session])

  // 保存消息到localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
        
        const firstUserMessage = messages.find(m => m.role === 'user')
        if (firstUserMessage) {
          const title = firstUserMessage.content.slice(0, 30) + 
            (firstUserMessage.content.length > 30 ? '...' : '')
          
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

  // 添加消息的处理函数
  const addMessage = useCallback(async (message: Message) => {
    console.log('addMessage called with:', message)  // 消息处理日志
    console.log('Current session state:', { status, session })  // 当前 session 状态

    // 更新本地状态
    setMessages(prev => [...prev, {
      ...message,
      timestamp: message.timestamp || new Date()
    }])
    
    if (message.role === 'user') {
      const isFirstUserMessage = !messages.some(m => m.role === 'user')
      
      if (isFirstUserMessage) {
        const title = message.content.slice(0, 30) + 
          (message.content.length > 30 ? '...' : '')
        setChatHistory(prev => [{
          id: currentChatId,
          title,
          timestamp: new Date()
        }, ...prev.slice(0, 19)]) // 保持最多20条记录
      }

      // 保存到本地存储
      const updatedMessages = [...messages, message]
      localStorage.setItem(`messages-${currentChatId}`, JSON.stringify(updatedMessages))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMessages))

      // 如果用户已登录，保存到数据库
      if (session?.user?.id) {
        try {
          console.log('User ID:', session.user.id)  // 添加日志
          console.log('Saving user message to DB...')
          await chatService.db.saveMessage(currentChatId, message, session.user.id)
        } catch (error) {
          console.error('Failed to save message to DB:', error)
        }
      } else {
        console.log('No user session found, skipping DB save')  // 添加日志
      }

      // 获取 AI 响应
      setIsLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const response = getMockResponse()
        
        const aiMessage = {
          role: 'assistant' as const,
          content: response.content,
          timestamp: new Date(),
          references: response.references
        }

        setMessages(prev => [...prev, aiMessage])
        
        // 更新存储
        const allMessages = [...updatedMessages, aiMessage]
        localStorage.setItem(`messages-${currentChatId}`, JSON.stringify(allMessages))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allMessages))

        // 保存 AI 响应到数据库
        if (session?.user?.id) {
          console.log('Saving AI response to DB...')  // 添加日志
          await chatService.db.saveMessage(currentChatId, aiMessage, session.user.id)
        }
      } catch (error) {
        console.error('Failed to process message:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }, [messages, currentChatId, session, status])

  /**
   * 清除当前会话并创建新会话
   */
  const clearMessages = useCallback(async () => {
    // 生成新的对话ID
    const newChatId = crypto.randomUUID()
    
    // 如果当前对话有用户消息，保存到历史记录
    const hasUserMessage = messages.some(m => m.role === 'user')
    if (hasUserMessage) {
      const firstUserMessage = messages.find(m => m.role === 'user')
      if (firstUserMessage) {
        const title = firstUserMessage.content.slice(0, 30) + 
          (firstUserMessage.content.length > 30 ? '...' : '')
        
        const historyEntry = {
          id: currentChatId,
          title,
          timestamp: new Date()
        }
        
        // 保存当前对话消息到本地存储
        localStorage.setItem(`messages-${currentChatId}`, JSON.stringify(messages))
        
        // 更新历史记录
        setChatHistory(prev => {
          const newHistory = prev.filter(h => h.id !== currentChatId)
          return [historyEntry, ...newHistory].slice(0, 20)
        })

        // 如果用户已登录，在数据库中创建新会话
        if (session?.user?.id) {
          try {
            await chatService.db.createSession(session.user.id, title)
          } catch (error) {
            console.error('Failed to create new session in DB:', error)
          }
        }
      }
    }
    
    // 创建欢迎消息
    const welcomeMessage = {
      role: 'assistant' as const,
      content: '你好！我是AI助手，有什么我可以帮你的吗？',
      timestamp: new Date()
    }
    
    // 更新状态
    setCurrentChatId(newChatId)
    setMessages([welcomeMessage])
    
    // 更新本地存储
    localStorage.setItem(STORAGE_KEY, JSON.stringify([welcomeMessage]))
    localStorage.removeItem(`messages-${newChatId}`)
  }, [messages, currentChatId, session])

  /**
   * 加载指定ID的会话
   * @param chatId - 要加载的会话ID
   */
  const loadChat = useCallback(async (chatId: string) => {
    setCurrentChatId(chatId)
    
    // 首先尝试从本地存储加载
    const savedMessages = localStorage.getItem(`messages-${chatId}`)
    if (savedMessages) {
      setMessages(convertDates(JSON.parse(savedMessages)))
      localStorage.setItem(STORAGE_KEY, savedMessages)
    }

    // 如果用户已登录，从数据库同步消息
    if (session?.user?.id) {
      try {
        const dbMessages = await chatService.db.loadSessionMessages(chatId)
        if (dbMessages && dbMessages.length > 0) {
          // 更新本地状态和存储
          setMessages(convertDates(dbMessages))
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dbMessages))
          localStorage.setItem(`messages-${chatId}`, JSON.stringify(dbMessages))
        }
      } catch (error) {
        console.error('Failed to load messages from DB:', error)
      }
    }
  }, [session])

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

  // 在返回前添加日志
  const result = {
    messages,
    addMessage,
    clearMessages,
    loadChat,
    isLoading,
    currentChatId,
    chatHistory
  }
  console.log('useChat returning:', result)  // 返回值日志
  return result
}
