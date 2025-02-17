'use client'

import { create } from 'zustand'
import type { Message, ChatHistory } from '@/types/chat'
import { createSession, converseWithAgent } from '@/services/agent'
import { chatService } from '@/services/chatService'
import { storage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/constants/storage'
import { getAiService } from '@/services/aiServiceFactory'
import { AiServiceType } from '@/types/ai'
import { SDCAIService } from '@/services/aiService'
import { DocumentReference } from '@/types/sdcAi'

// 重命名本地接口
interface ChatStoreState {
  messages: Message[]
  chatHistory: ChatHistory[]
  currentChatId: string
  isLoading: boolean
  isTyping: boolean
  shouldStop: boolean
  stopGeneration: () => void
  stoppedContent: Record<string, boolean>
  saveTimeout?: NodeJS.Timeout
  setStopGeneration: (stop: boolean) => void
  stopCurrentResponse: () => void
  stopTyping: () => void
  addMessage: (message: Message, userSession?: any) => Promise<void>
  loadChat: (chatId: string, userSession?: any) => Promise<void>
  clearMessages: () => Promise<void>
  updateLastMessage: (content: string) => void
  setMessages: (messages: Message[]) => void
  setChatHistory: (history: ChatHistory[]) => void
  updateChatTitle: (chatId: string, newTitle: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
}

// 创建聊天状态管理store
export const useChatStore = create<ChatStoreState>()((set, get) => {
  const { messages, chatHistory, currentChatId } = typeof window === 'undefined' 
    ? { 
        messages: [], 
        chatHistory: [], 
        currentChatId: '' 
      }
    : chatService.initialize()

  let lastSavedContent = ''  // 用于跟踪最后保存的内容
  let lastSavedAnswer = ''  // 跟踪最后保存到DB的内容

  return {
    messages,
    chatHistory,
    currentChatId,
    isLoading: false,
    isTyping: false,
    shouldStop: false,
    stopGeneration: () => {
      const { messages, chatHistory, currentChatId } = get()
      const lastMessage = messages[messages.length - 1]
      
      // 中断 AI 服务的请求
      const aiService = getAiService()
      if (aiService.abort) {
        aiService.abort()
      }
      
      if (lastMessage?.role === 'assistant') {
        const title = messages[messages.length - 2]?.content?.slice(0, 30) || '新对话'
        
        // 生成唯一的消息ID
        const messageId = `${currentChatId}-${Date.now()}`
        
        // 检查是否已存在相同 ID 的历史记录
        const updatedHistory = chatHistory.some(chat => chat.id === currentChatId)
          ? chatHistory
          : [
              { 
                id: currentChatId, 
                title, 
                timestamp: new Date() 
              },
              ...chatHistory
            ]

        // 如果最后一条消息是空的，就移除它
        const updatedMessages = lastMessage.content.trim() === '' 
          ? messages.slice(0, -1)
          : messages.map(msg => ({
              ...msg,
              id: msg.id || messageId // 确保每条消息都有唯一ID
            }))

        set({ 
          shouldStop: true,
          isLoading: false,
          isTyping: false,
          chatHistory: updatedHistory,
          messages: updatedMessages
        })

        // 保存状态
        if (!chatHistory.some(chat => chat.id === currentChatId)) {
          chatService.saveHistory(updatedHistory)
        }
        chatService.saveMessages(currentChatId, updatedMessages)
        storage.set(STORAGE_KEYS.LAST_CHAT_ID, currentChatId)
      } else {
        set({ 
          shouldStop: true,
          isLoading: false,
          isTyping: false
        })
      }
    },
    stoppedContent: {},

    setStopGeneration: (stop: boolean) => set({ shouldStop: stop }),
    
    stopCurrentResponse: () => {
      set({ 
        shouldStop: true,
        isTyping: false,
        isLoading: false
      })
    },

    stopTyping: () => set({ isTyping: false }),

    addMessage: async (message: Message, userSession?: any) => {
      if (message.role === 'user') {
        try {
          const { currentChatId, messages: currentMessages } = get()
          
          // 为用户消息添加唯一ID
          const userMessage = {
            ...message,
            id: `${currentChatId}-user-${Date.now()}`
          }
          
          // 保存用户消息到数据库
          if (userSession?.user?.id) {
            await chatService.db.saveMessage(currentChatId, userMessage, userSession.user.id)
          }

          // 只添加用户消息，不设置 loading
          const updatedMessages = [...currentMessages, userMessage]
          set({ messages: updatedMessages })

          // 获取当前配置的 AI 服务
          const aiService = getAiService()

          // 添加空的 AI 消息，并设置 loading 状态
          const aiMessage: Message = {
            id: `${currentChatId}-ai-${Date.now()}`,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            references: []
          }

          set(state => ({ 
            messages: [...state.messages, aiMessage],
            isLoading: true
          }))

          let isFirstChunk = true

          // 使用 AI 服务处理消息
          console.log('Store: Starting AI service processing')
          await aiService.processMessage(
            message.content,
            currentChatId,
            ({ answer, references }: { answer: string; references?: DocumentReference[] }) => {
              // 检查是否应该停止
              if (get().shouldStop) {
                // 保存当前内容到数据库和本地
                const currentMessages = get().messages
                const lastMessage = currentMessages[currentMessages.length - 1]
                if (lastMessage?.role === 'assistant' && 
                    lastMessage.content !== lastSavedAnswer) {  // 只在内容变化时保存
                  if (userSession?.user?.id) {
                    lastSavedAnswer = lastMessage.content  // 更新已保存内容
                    chatService.db.saveMessage(currentChatId, {
                      ...lastMessage,
                      references: references || []
                    }, userSession.user.id)
                      .catch(error => console.error('Failed to save AI message:', error))
                  }
                  chatService.saveMessages(currentChatId, currentMessages)
                }
                return // 停止继续处理
              }

              // 如果没有停止，继续原来的处理逻辑
              if (!answer || 
                  answer.includes('is running') || 
                  answer.includes('生成回答') ||
                  answer === '') {
                return
              }

              set(state => {
                console.log('Store: Updating state with answer:', answer)
                const newMessages = [...state.messages]
                const lastMessage = newMessages[newMessages.length - 1]
                
                if (lastMessage?.role === 'assistant') {
                  if (isFirstChunk) {
                    isFirstChunk = false
                    lastMessage.content = answer
                    lastMessage.references = references || []
                    return {
                      messages: newMessages,
                      isTyping: true,
                      isLoading: true
                    }
                  }

                  // 后续数据块，累积内容
                  if (answer.length > lastMessage.content.length) {
                    lastMessage.content = answer
                    // 确保引用被正确设置
                    lastMessage.references = references || []

                    clearTimeout(state.saveTimeout)
                    const saveTimeout = setTimeout(() => {
                      if (lastSavedContent !== answer && answer !== lastSavedAnswer) {
                        if (userSession?.user?.id) {
                          lastSavedContent = answer
                          lastSavedAnswer = answer
                          chatService.db.saveMessage(currentChatId, {
                            ...lastMessage,
                            references: references || []
                          }, userSession.user.id)
                            .catch(error => console.error('Failed to save AI message:', error))

                          // 如果是新会话的第一次对话，更新聊天历史
                          if (newMessages.length === 3) {
                            const title = message.content.slice(0, 30)
                            const updatedHistory = [
                              { id: currentChatId, title, timestamp: new Date() },
                              ...get().chatHistory
                            ]
                            set({ 
                              isTyping: false,
                              isLoading: false,
                              shouldStop: false,
                              chatHistory: updatedHistory
                            })
                            chatService.saveHistory(updatedHistory)
                          } else {
                            set({ 
                              isTyping: false,
                              isLoading: false,
                              shouldStop: false
                            })
                          }
                        }
                      }                   
                    }, 3000)

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
          console.error('Failed to process message:', error)
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
          console.log('Store: Loaded messages:', dbMessages)
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

      // 如果当前会话有内容且不在历史记录中，保存到历史
      if (messages.some(m => m.role === 'user') && 
          !chatHistory.some(chat => chat.id === currentChatId)) {
        const firstUserMessage = messages.find(m => m.role === 'user')
        if (firstUserMessage) {
          const title = firstUserMessage.content.slice(0, 30)
          chatService.saveMessages(currentChatId, messages)
          
          const updatedHistory = [
            { id: currentChatId, title, timestamp: new Date() },
            ...chatHistory
          ]
          
          set({ chatHistory: updatedHistory })
          chatService.saveHistory(updatedHistory)
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

    updateChatTitle: async (chatId: string, newTitle: string) => {
      const { chatHistory } = get()
      const updatedHistory = chatHistory.map(chat => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      )
      
      set({ chatHistory: updatedHistory })
      
      // 保存到本地存储
      chatService.saveHistory(updatedHistory)
      
      // 保存到数据库
      try {
        await chatService.db.updateChatTitle(chatId, newTitle)
      } catch (error) {
        console.error('Failed to update chat title:', error)
      }
    },

    deleteChat: async (chatId: string) => {
      const { chatHistory, currentChatId, clearMessages } = get()
      const updatedHistory = chatHistory.filter(chat => chat.id !== chatId)
      
      set({ chatHistory: updatedHistory })
      
      // 保存到本地存储
      chatService.saveHistory(updatedHistory)
      
      // 保存到数据库
      try {
        await chatService.db.deleteChat(chatId)
        
        // 如果删除的是当前会话，清除消息
        if (chatId === currentChatId) {
          await clearMessages()
        }
      } catch (error) {
        console.error('Failed to delete chat:', error)
      }
    },

    // ... 其他必要方法
  }
})
