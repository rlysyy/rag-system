import { DocumentReference } from '@/types/sdcAi'

export interface AIService {
  processMessage: (
    message: string,
    sessionId: string,
    onProgress: (data: { answer: string; references?: DocumentReference[] }) => void
  ) => Promise<void>;
  abort?: () => void;  // 添加可选的 abort 方法
}

// 用于区分 AI 服务类型
export type AiServiceType = 'default' | 'sdc' 