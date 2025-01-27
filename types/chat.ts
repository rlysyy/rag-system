interface Reference {
  name: string
  id: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  references?: Reference[]
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
  timestamp: Date
}

export interface ChatStore {
  messages: Message[]
  currentChatId: string
  chatHistory: ChatHistory[]
  isLoading: boolean
  stopGeneration: boolean
  isTyping: boolean
  stoppedContent: Record<string, string>
  
  addMessage: (message: Message) => Promise<void>
  clearMessages: () => void
  loadChat: (chatId: string) => void
  setStopGeneration: (stop: boolean) => void
  stopCurrentResponse: () => void
  stopTyping: () => void
  updateLastMessage: (content: string) => void
}
