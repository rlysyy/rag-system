import { AiService } from '@/types/ai'
import { Message } from '@/types/chat'
import { streamUtils } from '@/utils/streamUtils'
import { createSession } from './agent'

export const defaultAiService: AiService = {
  async processMessage(
    message: string, 
    chatId: string,
    onProgress?: (data: { answer: string, references?: any[] }) => void
  ): Promise<Message> {
    const agentId = process.env.NEXT_PUBLIC_AGENT_ID
    if (!agentId) throw new Error('Agent ID not found')
    
    const sessionResponse = await createSession(agentId)
    const sessionId = sessionResponse.data.id

    const response = await fetch(`/api/agents/${agentId}/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: message,
        stream: true,
        session_id: sessionId
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    let accumulatedAnswer = ''
    let finalReferences: any[] = []

    await streamUtils.processStream(reader, (data) => {
      if (data.code === 0) {
        if (data.data === true) return

        if (data.data.answer) {
          const currentAnswer = data.data.answer
          if (currentAnswer.includes('is running') || 
              currentAnswer.includes('生成回答') ||
              currentAnswer === '') {
            return
          }

          accumulatedAnswer = currentAnswer
          if (data.data.reference?.chunks) {
            finalReferences = data.data.reference.chunks
          }

          onProgress?.({
            answer: accumulatedAnswer,
            references: finalReferences
          })
        }
      }
    })

    return {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      references: []
    }
  }
} 