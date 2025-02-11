import { AgentListParams, AgentListResponse } from '@/types/agent'

export async function getAgents(params: AgentListParams = {}): Promise<AgentListResponse> {
  const queryParams = new URLSearchParams({
    page: (params.page || 1).toString(),
    page_size: (params.page_size || 30).toString(),
    orderby: params.orderby || 'create_time',
    desc: (params.desc ?? true).toString(),
    ...(params.name && { name: params.name }),
    ...(params.id && { id: params.id })
  })

  try {
    const response = await fetch(`/api/agents?${queryParams}`)
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('API Call Error:', error)
    throw error
  }
}

interface SessionResponse {
  data: {
    id: string
  }
}

interface ChatResponse {
  data: {
    answer: string
    references?: Array<{
      id: string
      name: string
    }>
  }
}

// 创建会话
export async function createSession(agentId: string): Promise<SessionResponse> {
  
  const response = await fetch(`/api/agents/${agentId}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('Failed to create session:', error)
    throw new Error(error.message || `API error: ${response.status}`)
  }

  const data = await response.json()
  return data
}

// 对话
export async function converseWithAgent(
  agentId: string, 
  sessionId: string | null,
  message: string,
  onProgress?: (data: { answer: string, references?: any[] }) => void
): Promise<ChatResponse> {
  console.log('Starting conversation with agent:', { agentId, sessionId, message })

  if (!sessionId) {
    throw new Error('Session ID is required')
  }

  const url = `/api/agents/${agentId}/completions`
  console.log('Making request to:', url)
  
  const requestBody = {
    question: message,
    stream: true,
    session_id: sessionId
  }
  console.log('Request body:', requestBody)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })

  console.log('API response status:', response.status)

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  let accumulatedAnswer = ''
  let finalReferences: any[] = []
  let previousAnswer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        console.log('Stream completed. Final answer:', accumulatedAnswer)
        break
      }

      const text = new TextDecoder().decode(value)
      console.log('Raw chunk received:', text)
      
      const lines = text.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data:')) {
          try {
            const jsonStr = line.slice(5).trim()
            if (!jsonStr) continue

            const data = JSON.parse(jsonStr)
            console.log('Parsed chunk data:', data)
            
            if (data.code === 0) {
              if (data.data === true) {
                console.log('Received completion signal')
                continue
              }

              if (data.data.answer) {
                const currentAnswer = data.data.answer
                console.log('Current answer:', currentAnswer)

                // 跳过 loading 状态的消息
                if (currentAnswer.includes('is running') || 
                    currentAnswer.includes('生成回答') ||
                    currentAnswer === '') {
                  console.log('Skipping loading message')
                  continue
                }

                // 获取新增内容
                const newContent = currentAnswer.slice(previousAnswer.length)
                console.log('New content:', newContent)
                
                accumulatedAnswer = currentAnswer
                previousAnswer = currentAnswer

                if (data.data.reference?.chunks) {
                  finalReferences = data.data.reference.chunks
                  console.log('Updated references:', finalReferences)
                }
                
                console.log('Calling onProgress with:', {
                  answer: accumulatedAnswer,
                  references: finalReferences
                })
                
                onProgress?.({
                  answer: accumulatedAnswer,
                  references: finalReferences
                })
              }
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e, 'Line:', line)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return {
    data: {
      answer: accumulatedAnswer,
      references: finalReferences
    }
  }
} 