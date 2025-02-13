interface Reference {
  name: string
  id: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  references?: Array<{ id: string; name: string }>
  isSystemMessage?: boolean
}

export interface ChatContextType {
  messages: Message[]
  addMessage: (message: Message) => void
  isLoading: boolean
}

export interface ChatHistory {
  id: string
  title: string
  lastMessage?: string
  timestamp: Date
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
  clearMessages: () => void
  loadChat: (chatId: string) => void
  updateLastMessage: (content: string) => void
  setStopGeneration: (stop: boolean) => void
  stopCurrentResponse: () => void
  stopTyping: () => void
}
