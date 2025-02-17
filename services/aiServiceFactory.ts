import { AiService, AiServiceType } from '@/types/ai'
import { defaultAiService } from './defaultAiService'
import { sdcAiService } from './sdcAiService'

export function getAiService(): AiService {
  const serviceType = process.env.NEXT_PUBLIC_AI_SERVICE as AiServiceType

  switch (serviceType) {
    case 'sdc':
      return sdcAiService
    case 'default':
    default:
      return defaultAiService
  }
} 