'use client'

import { create } from 'zustand'
import type { Message, ChatStore, ChatHistory } from '@/types/chat'
import { createSession, converseWithAgent } from '@/services/agent'
import { STORAGE_KEYS } from '@/constants/storage'

// 工具函数：安全地访问 localStorage
const getLocalStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key)
  }
  return null
}

const setLocalStorage = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
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
  messages: [],  // 恢复为空数组
  isLoading: false,
  isTyping: false,
  currentChatId: 'default',
  chatHistory: [],
  stopGeneration: false,
  stoppedContent: {},

  setStopGeneration: (stop: boolean) => set({ stopGeneration: stop }),
  
  stopCurrentResponse: () => {
    const { messages } = get()
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'assistant') {
      set({ 
        stopGeneration: true,
        isTyping: false,
        isLoading: false
      })
    }
  },

  stopTyping: () => set({ isTyping: false }),

  addMessage: async (message: Message) => {
    if (message.role === 'user') {
      try {
        const agentId = process.env.NEXT_PUBLIC_AGENT_ID
        if (!agentId) throw new Error('Agent ID not found')

        const { currentChatId, messages: currentMessages } = get()
        let sessionId = getLocalStorage(`session-${currentChatId}`)

        // 添加用户消息
        const updatedMessages = [...currentMessages, message]
        
        // 添加 loading 状态的 AI 消息
        const loadingMessage: Message = {
          role: 'assistant' as const,
          content: '',
          timestamp: new Date(),
          references: []
        }

        set({ 
          messages: [...updatedMessages, loadingMessage],
          isLoading: true,
          isTyping: false
        })
        
        try {
          // 确保每次对话都创建新的 session
          const sessionResponse = await createSession(agentId)
          sessionId = sessionResponse.data.id
          setLocalStorage(`session-${currentChatId}`, sessionId)
          console.log('Created new session:', sessionId)

          let isFirstChunk = true
          await converseWithAgent(
            agentId,
            sessionId,
            message.content,
            ({ answer, references }) => {
              console.log('Received response chunk:', { answer, references })
              
              // 跳过 loading 状态的消息
              if (answer.includes('is running') || 
                  answer.includes('生成回答') ||
                  answer === '') {
                return
              }

              // 第一个内容块时开始打字效果
              if (isFirstChunk) {
                isFirstChunk = false;
                set(state => {
                  const newMessages = [...state.messages];
                  newMessages[newMessages.length - 1] = {
                    ...newMessages[newMessages.length - 1],
                    content: answer || ' ',
                    references: references || []
                  };
                  return {
                    messages: newMessages,
                    isTyping: true,
                    isLoading: false
                  };
                });
              } else {
                set(state => {
                  const newMessages = [...state.messages];
                  newMessages[newMessages.length - 1] = {
                    ...newMessages[newMessages.length - 1],
                    content: answer || ' ',
                    references: references || []
                  };
                  return { messages: newMessages };
                });
              }
            }
          )
          
          // 完成后设置状态
          set({ isTyping: false })
          
        } catch (error) {
          console.error('Chat error:', error)
          set(state => {
            const messages = [...state.messages]
            messages[messages.length - 1] = {
              role: 'assistant',
              content: '抱歉，发生了错误。请稍后重试。',
              timestamp: new Date(),
              references: []
            }
            return { 
              messages,
              isTyping: false,
              isLoading: false
            }
          })
        }
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
    setLocalStorage(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify([welcomeMessage]))
    // 清除旧的会话ID
    setLocalStorage(`session-${newChatId}`, null)
  },

  // 加载指定会话
  loadChat: (chatId: string) => {
    const savedMessages = getLocalStorage(`messages-${chatId}`)
    if (savedMessages) {
      const messages = convertDates(JSON.parse(savedMessages))
      set({ currentChatId: chatId, messages })
      setLocalStorage(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages))
    }
  },

  // 更新最后一条消息
  updateLastMessage: (content: string) => {
    const { messages } = get()
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'assistant') {
      const updatedMessage = { ...lastMessage, content }
      set({ messages: [...messages.slice(0, -1), updatedMessage] })
      setLocalStorage(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify([...messages.slice(0, -1), updatedMessage]))
    }
  }
}))
