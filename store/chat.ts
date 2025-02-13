'use client'

import { create } from 'zustand'
import type { Message, ChatStore, ChatHistory } from '@/types/chat'
import { createSession, converseWithAgent } from '@/services/agent'
import { chatService } from '@/services/chatService'

// 创建聊天状态管理store
export const useChatStore = create<ChatStore>()((set, get) => {
  const { messages, chatHistory, currentChatId } = chatService.initialize()

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

          // 立即添加用户消息
          const updatedMessages = [...currentMessages, message]
          set({ 
            messages: updatedMessages,
            isLoading: false  // 用户消息不需要 loading
          })

          // 创建新的会话
          const agentId = process.env.NEXT_PUBLIC_AGENT_ID
          if (!agentId) throw new Error('Agent ID not found')
          const sessionResponse = await createSession(agentId)
          const sessionId = sessionResponse.data.id

          // 添加空的 AI 消息
          const aiMessage: Message = {
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            references: []
          }

          // 添加 AI 消息并开始流式响应
          set(state => ({ 
            messages: [...state.messages, aiMessage],
            isTyping: true  // 开始打字效果
          }))

          let isFirstChunk = true

          converseWithAgent(
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
                
                if (lastMessage?.role === 'assistant') {
                  // 第一个数据块，直接设置内容
                  if (isFirstChunk) {
                    isFirstChunk = false
                    lastMessage.content = answer
                    lastMessage.references = references || []
                    return {
                      messages: newMessages,
                      isTyping: true
                    }
                  }

                  // 后续数据块，只有在内容变长时更新
                  if (answer.length > lastMessage.content.length) {
                    lastMessage.content = answer
                    lastMessage.references = references || []

                    // 延迟保存最终响应
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
                      saveTimeout,
                      isTyping: true
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
