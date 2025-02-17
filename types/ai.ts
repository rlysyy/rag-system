import { Message } from './chat'

export interface AiService {
  processMessage: (
    message: string, 
    chatId: string,
    onProgress?: (data: { answer: string, references?: any[] }) => void
  ) => Promise<Message>
}

// 用于区分 AI 服务类型
export type AiServiceType = 'default' | 'sdc' 