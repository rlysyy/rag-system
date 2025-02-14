'use client'

import { create } from 'zustand'
import type { Message, ChatStore, ChatHistory } from '@/types/chat'
import { createSession, converseWithAgent } from '@/services/agent'
import { chatService } from '@/services/chatService'
import { storage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/constants/storage'

// 创建聊天状态管理store
export const useChatStore = create<ChatStore>()((set, get) => {
  const { messages, chatHistory, currentChatId } = typeof window === 'undefined' 
    ? { 
        messages: [], 
        chatHistory: [], 
        currentChatId: '' 
      }
    : chatService.initialize()

  let lastSavedContent = ''  // 用于跟踪最后保存的内容

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

    addMessage: async (message: Message, userSession?: any) => {
      if (message.role === 'user') {
        try {
          const { currentChatId, messages: currentMessages } = get()
          
          // 保存用户消息到数据库
          if (userSession?.user?.id) {
            await chatService.db.saveMessage(currentChatId, message, userSession.user.id)
          }

          // 只添加用户消息，不设置 loading
          const updatedMessages = [...currentMessages, message]
          set({ messages: updatedMessages })

          // 创建新的会话
          const agentId = process.env.NEXT_PUBLIC_AGENT_ID
          if (!agentId) throw new Error('Agent ID not found')
          const sessionResponse = await createSession(agentId)
          const sessionId = sessionResponse.data.id

          // 添加空的 AI 消息，并设置 loading 状态
          const aiMessage: Message = {
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            references: []
          }

          set(state => ({ 
            messages: [...state.messages, aiMessage],
            isLoading: true  // 在这里设置 loading
          }))

          let isFirstChunk = true

          converseWithAgent(
            agentId,
            sessionId,
            message.content,
            ({ answer, references, done }) => {
              if (!answer || 
                  answer.includes('is running') || 
                  answer.includes('生成回答') ||
                  answer === '') {
                return
              }

              set(state => {
                const newMessages = [...state.messages]
                const lastMessage = newMessages[newMessages.length - 1]
                
                if (lastMessage?.role === 'assistant') {
                  // 第一个数据块，设置内容并开始打字效果
                  if (isFirstChunk) {
                    isFirstChunk = false
                    lastMessage.content = answer
                    lastMessage.references = references || []
                    return {
                      messages: newMessages,
                      isTyping: true,   // 设置打字效果
                      isLoading: false  // 确保关闭 loading
                    }
                  }

                  // 后续数据块，累积内容
                  if (answer.length > lastMessage.content.length) {
                    lastMessage.content = answer
                    lastMessage.references = references || []

                    // 如果收到流结束标志，直接保存
                    if (done && userSession?.user?.id) {
                      chatService.db.saveMessage(currentChatId, lastMessage, userSession.user.id)
                        .catch(error => console.error('Failed to save AI message:', error))
                      return {
                        messages: newMessages,
                        isTyping: false  // 关闭打字效果
                      }
                    }

                    // 否则继续使用延迟保存
                    clearTimeout(state.saveTimeout)
                    const saveTimeout = setTimeout(() => {
                      if (lastSavedContent !== answer) {
                        if (userSession?.user?.id) {
                          lastSavedContent = answer
                          chatService.db.saveMessage(currentChatId, lastMessage, userSession.user.id)
                            .catch(error => console.error('Failed to save AI message:', error))
                          set({ isTyping: false })
                        }
                      }
                    }, 1000)

                    return {
                      messages: newMessages,
                      saveTimeout
                    }
                  }
                }

                return { messages: newMessages }
              })
            }
          )
        } catch (error) {
          console.error('Failed to save user message:', error)
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

    // 加载指定会话
    loadChat: async (chatId: string, userSession?: any) => {
      set({ currentChatId: chatId })
      storage.set(STORAGE_KEYS.LAST_CHAT_ID, chatId) // 保存最后访问的会话ID
      
      if (userSession?.user?.id) {
        try {
          const dbMessages = await chatService.db.loadSessionMessages(chatId)
          if (dbMessages && dbMessages.length > 0) {
            set({ messages: dbMessages })
            chatService.saveMessages(chatId, dbMessages)
          }
        } catch (error) {
          console.error('Failed to load chat:', error)
        }
      }
    },

    // 清除当前会话
    clearMessages: async () => {
      const { messages, currentChatId, chatHistory } = get()
      const newChatId = crypto.randomUUID()

      // 如果当前会话有内容，保存到历史
      if (messages.some(m => m.role === 'user')) {
        const firstUserMessage = messages.find(m => m.role === 'user')
        if (firstUserMessage) {
          const title = firstUserMessage.content.slice(0, 30)
          chatService.saveMessages(currentChatId, messages)
          
          set(state => ({
            chatHistory: [
              { id: currentChatId, title, timestamp: new Date() },
              ...state.chatHistory.filter(h => h.id !== currentChatId)
            ]
          }))
        }
      }

      // 创建新会话
      const welcomeMessage = {
        role: 'assistant' as const,
        content: '你好！我是AI助手，有什么我可以帮你的吗？',
        timestamp: new Date(),
        references: []
      }

      set({
        currentChatId: newChatId,
        messages: [welcomeMessage]
      })

      chatService.saveMessages(newChatId, [welcomeMessage])
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

    setMessages: (messages: Message[]) => {
      set({ messages })
    },
    
    setChatHistory: (history: ChatHistory[]) => {
      set({ chatHistory: history })
      chatService.saveHistory(history)
    },

    // ... 其他必要方法
  }
})
