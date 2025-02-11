'use client'

import { create } from 'zustand'
import type { Message, ChatStore, ChatHistory } from '@/types/chat'
import { createSession, converseWithAgent } from '@/services/agent'
import { STORAGE_KEYS } from '@/constants/storage'
import { chatService } from '@/services/chatService'
import { messageUtils } from '@/utils/messageUtils'

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
      // 如果 value 已经是字符串，直接使用
      const valueToStore = typeof value === 'string' ? value : JSON.stringify(value)
      localStorage.setItem(key, valueToStore)
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }
}

// 工具函数：转换消息中的日期并过滤无效消息
const convertDates = (messages: any): Message[] => {
  if (!Array.isArray(messages)) {
    console.warn('Invalid messages format:', messages)
    return []
  }

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
export const useChatStore = create<ChatStore>()((set, get) => {
  const { messages, chatHistory, currentChatId } = chatService.initialize()

  return {
    messages,
    chatHistory,
    currentChatId,
    isLoading: false,
    isTyping: false,
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
          const { currentChatId, messages: currentMessages, chatHistory } = get()
          
          // 更新消息和历史记录
          const updatedMessages = [...currentMessages, message]
          const updatedHistory = [...chatHistory]
          
          // 更新或添加聊天历史
          const existingChat = updatedHistory.find((chat: ChatHistory) => chat.id === currentChatId)
          if (!existingChat) {
            updatedHistory.push({
              id: currentChatId,
              title: message.content.slice(0, 30) + (message.content.length > 30 ? '...' : ''),
              timestamp: new Date(),
              lastMessage: message.content
            })
          } else {
            existingChat.lastMessage = message.content
            existingChat.timestamp = new Date()
          }
          
          // 保存状态
          chatService.saveMessages(currentChatId, updatedMessages)
          chatService.saveHistory(updatedHistory)
          
          set({ 
            messages: updatedMessages,
            chatHistory: updatedHistory,
            isLoading: true,
            isTyping: false
          })

          // 添加 AI 响应
          const agentId = process.env.NEXT_PUBLIC_AGENT_ID
          if (!agentId) throw new Error('Agent ID not found')

          // 创建新的会话
          const sessionResponse = await createSession(agentId)
          const sessionId = sessionResponse.data.id

          // 添加 loading 状态的 AI 消息
          const loadingMessage: Message = {
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            references: []
          }

          set(state => ({ 
            messages: [...state.messages, loadingMessage]
          }))

          let isFirstChunk = true
          await converseWithAgent(
            agentId,
            sessionId,
            message.content,
            ({ answer, references }) => {
              if (answer.includes('is running') || 
                  answer.includes('生成回答') ||
                  answer === '') {
                return
              }

              set(state => {
                const newMessages = [...state.messages]
                const lastMessage = newMessages[newMessages.length - 1]
                
                if (isFirstChunk) {
                  isFirstChunk = false
                  if (lastMessage?.role === 'assistant') {
                    lastMessage.content = answer
                    lastMessage.references = references || []
                  }
                  chatService.saveMessages(currentChatId, newMessages)
                  return {
                    messages: newMessages,
                    isTyping: true,
                    isLoading: false
                  }
                }

                if (lastMessage?.role === 'assistant') {
                  lastMessage.content = answer
                  lastMessage.references = references || []
                }
                chatService.saveMessages(currentChatId, newMessages)
                return { messages: newMessages }
              })
            }
          )
          
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
      }
    },

    clearMessages: () => {
      // 简化的清除逻辑
    },

    loadChat: (chatId: string) => {
      // 简化的加载逻辑
    },

    updateLastMessage: (content: string) => {
      const { messages, currentChatId } = get()
      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.role === 'assistant') {
        const updatedMessage = { ...lastMessage, content }
        const newMessages = [...messages.slice(0, -1), updatedMessage]
        set({ messages: newMessages })
        chatService.saveMessages(currentChatId, newMessages)
      }
    },

    // ... 其他必要方法
  }
})
