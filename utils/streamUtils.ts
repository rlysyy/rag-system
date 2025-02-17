export interface StreamProcessor {
  processStream: (
    response: Response,
    onChunk: (data: any) => void
  ) => Promise<void>
}

export const streamUtils = {
  async processStream(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onChunk: (data: any) => void
  ) {
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const text = new TextDecoder().decode(value)
        const lines = text.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const jsonStr = line.slice(5).trim()
              if (!jsonStr) continue
              
              if (jsonStr === '[DONE]') {
                onChunk('[DONE]')
                continue
              }

              const data = JSON.parse(jsonStr)
              onChunk(data)
            } catch (e) {
              console.error('Failed to parse SSE data:', e)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
} 