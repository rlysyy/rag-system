import { DocumentReference } from './sdcAi'

interface Reference {
  name: string
  id: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  references?: DocumentReference[]
}

export interface ChatContextType {
  messages: Message[]
  addMessage: (message: Message) => void
  isLoading: boolean
}

export interface ChatHistory {
  id: string
  title: string
  timestamp: Date
  lastMessage?: string
}

export interface ChatStore {
  messages: Message[]
  chatHistory: ChatHistory[]
  currentChatId: string
  isLoading: boolean
  isTyping: boolean
  stopGeneration: boolean
  stoppedContent: Record<string, string>
  saveTimeout?: NodeJS.Timeout
  
  addMessage: (message: Message, userSession?: any) => Promise<void>
  updateLastMessage: (content: string) => void
  loadChat: (chatId: string, userSession?: any) => Promise<void>
  clearMessages: () => Promise<void>
  setStopGeneration: (stop: boolean) => void
  stopCurrentResponse: () => void
  stopTyping: () => void
  setMessages: (messages: Message[]) => void
  setChatHistory: (history: ChatHistory[]) => void
}
