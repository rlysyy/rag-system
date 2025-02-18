'use client'

import { create } from 'zustand'
import type { Message, ChatHistory } from '@/types/chat'
import { chatService } from '@/services/chatService'
import { storage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/constants/storage'
import { getAiService } from '@/services/aiServiceFactory'
import { DocumentReference } from '@/types/sdcAi'
import { messageUtils } from '@/utils/messageUtils'

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
  createNewChat: () => Promise<void>
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
        // 生成唯一的消息ID
        const messageId = `${currentChatId}-${Date.now()}`

        // 如果最后一条消息是空的，就移除它
        const updatedMessages = lastMessage.content.trim() === '' 
          ? messages.slice(0, -1)
          : messages.map(msg => ({
              ...msg,
              id: msg.id || messageId
            }))

        set({ 
          shouldStop: true,
          isLoading: false,
          isTyping: false,
          messages: updatedMessages
        })

        // 只保存消息，不处理历史记录
        chatService.saveMessages(currentChatId, updatedMessages)
      } else {
        set({ 
          shouldStop: true,
          isLoading: false,
          isTyping: false
        })
      }
    },
    stoppedContent: {},

    // 设置停止生成
    setStopGeneration: (stop: boolean) => set({ shouldStop: stop }),
    
    // 停止当前响应
    stopCurrentResponse: () => {
      set({ 
        shouldStop: true,
        isTyping: false,
        isLoading: false
      })
    },

    // 停止输入
    stopTyping: () => set({ isTyping: false }),

    // 添加消息
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

          // 添加用户消息
          set({ 
            messages: [...currentMessages, userMessage],
            isLoading: true 
          })

          // 获取当前配置的 AI 服务
          const aiService = getAiService()

          // 添加空的 AI 消息
          const aiMessage: Message = {
            id: `${currentChatId}-ai-${Date.now()}`,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            references: []
          }

          // 添加 AI 消息
          set(state => ({ 
            messages: [...state.messages, aiMessage]
          }))

          // 使用 AI 服务处理消息
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

          // 保存完整的消息记录
          const finalMessages = get().messages
          chatService.saveMessages(currentChatId, finalMessages)

        } catch (error) {
          console.error('Failed to process message:', error)
          set(state => {
            const messages = [...state.messages]
            if (messages.length > 0) {
              messages[messages.length - 1] = {
                role: 'assistant',
                content: '抱歉，发生了错误。请稍后重试。',
                timestamp: new Date(),
                references: []
              }
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

    // 创建新会话
    createNewChat: async () => {
      const { messages, currentChatId, chatHistory } = get()

      // 只有当有用户消息且不在历史记录中时，才保存当前会话
      if (messages.length > 1 && // 确保不只有欢迎消息
          messages.some(m => m.role === 'user') && 
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
      const newChatId = crypto.randomUUID()
      const welcomeMessage = messageUtils.createWelcomeMessage()

      set({
        currentChatId: newChatId,
        messages: [welcomeMessage]
      })

      chatService.saveMessages(newChatId, [welcomeMessage])
    },

    // 更新最后一条消息
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

    // 设置对话消息
    setMessages: (messages: Message[]) => {
      set({ messages })
    },
    
    // 设置对话历史
    setChatHistory: (history: ChatHistory[]) => {
      set({ chatHistory: history })
      chatService.saveHistory(history)
    },

    // 更新对话标题
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

    // 加载指定会话
    loadChat: async (chatId: string, userSession?: any) => {
      set({ currentChatId: chatId })
      storage.set(STORAGE_KEYS.LAST_CHAT_ID, chatId)
      
      // 先尝试从本地存储加载消息
      const savedMessages = storage.get(`${STORAGE_KEYS.CHAT_MESSAGES}-${chatId}`)
      
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages)
          const messages = messageUtils.convertDates(parsedMessages)
          set({ messages }) // 设置消息状态
          return // 如果本地有数据，直接返回
        } catch (error) {
          console.error('Failed to parse local messages:', error)
          // 解析失败继续从数据库加载
        }
      }
      
      // 本地没有数据或解析失败时，从数据库加载
      if (userSession?.user?.id) {
        try {
          const dbMessages = await chatService.db.loadSessionMessages(chatId)
          if (dbMessages && dbMessages.length > 0) {
            set({ messages: dbMessages })
            // 保存到本地存储以便下次使用
            chatService.saveMessages(chatId, dbMessages)
          } else {
            // 如果数据库也没有消息，设置欢迎消息
            const welcomeMessage = messageUtils.createWelcomeMessage()
            set({ messages: [welcomeMessage] })
            chatService.saveMessages(chatId, [welcomeMessage])
          }
        } catch (error) {
          console.error('Failed to load chat:', error)
          // 加载失败时也设置欢迎消息
          const welcomeMessage = messageUtils.createWelcomeMessage()
          set({ messages: [welcomeMessage] })
          chatService.saveMessages(chatId, [welcomeMessage])
        }
      }
    },

    // 删除对话
    deleteChat: async (chatId: string) => {
      const { chatHistory, currentChatId } = get()

      try {
        // 先删除数据库和本地存储
        console.log('deleteChat chatId', chatId)
        await chatService.db.deleteChat(chatId)
        storage.remove(`${STORAGE_KEYS.CHAT_MESSAGES}-${chatId}`)
        
        // 更新历史记录
        const updatedHistory = chatHistory.filter(chat => chat.id !== chatId)
        set({ 
          chatHistory: updatedHistory,
          // 如果删除的是当前会话，清空消息
          messages: chatId === currentChatId ? [] : get().messages
        })
        
        // 保存更新后的历史记录
        chatService.saveHistory(updatedHistory)
        
        // 如果删除的是当前会话，创建新的空会话
        if (chatId === currentChatId) {
          const newChatId = crypto.randomUUID()
          const welcomeMessage = messageUtils.createWelcomeMessage()
          
          set({
            currentChatId: newChatId,
            messages: [welcomeMessage]
          })
          
          // 只保存欢迎消息
          // chatService.saveMessages(newChatId, [welcomeMessage])
        }
      } catch (error) {
        console.error('Failed to delete chat:', error)
      }
    },

    // ... 其他必要方法 
  }
})
