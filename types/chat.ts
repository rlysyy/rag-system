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
  isLoading: boolean
  isTyping: boolean
  currentChatId: string
  chatHistory: ChatHistory[]
  stopGeneration: boolean
  stoppedContent: Record<string, string>
  
  addMessage: (message: Message) => Promise<void>
  clearMessages: () => void
  loadChat: (chatId: string) => void
  updateLastMessage: (content: string) => void
  setStopGeneration: (stop: boolean) => void
  stopCurrentResponse: () => void
  stopTyping: () => void
}
