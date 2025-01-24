interface Reference {
  name: string
  id: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  references?: Reference[]
}

export interface ChatContextType {
  messages: Message[]
  addMessage: (message: Message) => void
  isLoading: boolean
} 