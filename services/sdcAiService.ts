import { AiService } from '@/types/ai'
import { Message } from '@/types/chat'
import { streamUtils } from '@/utils/streamUtils'
import type { SdcAiRequest, SdcAiResponse, DocumentReference } from '@/types/sdcAi'

export const sdcAiService: AiService = {
  async processMessage(
    message: string, 
    chatId: string,
    onProgress?: (data: { answer: string, references?: any[] }) => void
  ): Promise<Message> {
    console.log('SDC AI Service: Starting request')
    const payload: SdcAiRequest = {
      text: message,
      kb_ids: [process.env.NEXT_PUBLIC_SDC_KB_IDS!],
      chat_id: chatId,
      stream: true
    }
    console.log('SDC AI Service: Payload', payload)

    const response = await fetch(`${process.env.NEXT_PUBLIC_SDC_API_URL}/api/v1/retrival_answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    console.log('SDC AI Service: Response status:', response.status)
    if (!response.ok) {
      throw new Error(`SDC AI API error: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    let accumulatedAnswer = ''
    let finalReferences: DocumentReference[] = []

    console.log('SDC AI Service: Starting stream processing')

    await streamUtils.processStream(reader, (data) => {
      console.log('SDC AI Service: Received data:', data)
      
      if (data === '[DONE]') {
        console.log('SDC AI Service: Stream completed')
        return
      }

      if (data.code === 200 && data.data?.answer) {
        console.log('SDC AI Service: Processing answer:', data.data.answer)
        accumulatedAnswer += data.data.answer
        if (data.data.reference) {
          finalReferences = data.data.reference
        }
        
        onProgress?.({
          answer: accumulatedAnswer,
          references: finalReferences
        })
        console.log('SDC AI Service: Progress callback called')
      }
    })

    console.log('SDC AI Service: Stream processing completed')
    console.log('SDC AI Service: Final answer:', accumulatedAnswer)

    return {
      role: 'assistant',
      content: accumulatedAnswer,
      timestamp: new Date(),
      references: finalReferences
    }
  }
} 