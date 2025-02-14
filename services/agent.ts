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

/**
 * 创建新的聊天会话
 * @param agentId - AI Agent的唯一标识符
 * @returns 返回包含会话ID的响应
 */
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

/**
 * 与 AI Agent 进行对话，支持流式响应
 * @param agentId - AI Agent的唯一标识符
 * @param sessionId - 会话ID，不能为空
 * @param message - 用户发送的消息内容
 * @param onMessage - 处理流式响应的回调函数，用于实时更新UI
 * @returns 返回完整的对话响应
 */
export async function converseWithAgent(
  agentId: string, 
  sessionId: string | null,
  message: string,
  onMessage: (data: { answer: string, references?: any[] }) => void
): Promise<ChatResponse> {

  if (!sessionId) {
    throw new Error('Session ID is required')
  }

  // 构建请求URL和参数
  const url = `/api/agents/${agentId}/completions`
  const requestBody = {
    question: message,
    stream: true,
    session_id: sessionId
  }

  // 发送请求
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  // 获取响应流读取器
  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  // 用于累积完整回答和引用
  let accumulatedAnswer = ''
  let finalReferences: any[] = []

  try {
    // 循环读取流式响应
    while (true) {
      const { done: streamDone, value } = await reader.read()
      
      if (streamDone) {
        break
      }

      // 解码二进制数据
      const text = new TextDecoder().decode(value)
      const lines = text.split('\n')
      
      // 处理每一行 SSE 数据
      for (const line of lines) {
        if (line.startsWith('data:')) {
          try {
            const jsonStr = line.slice(5).trim()
            if (!jsonStr) continue

            const data = JSON.parse(jsonStr)
            
            if (data.code === 0) {
              // 处理完成信号
              if (data.data === true) {
                console.log('done', data.data)
                onMessage({
                  answer: accumulatedAnswer,
                  references: finalReferences
                })
                continue
              }

              if (data.data.answer) {
                const currentAnswer = data.data.answer

                // 跳过加载状态消息
                if (currentAnswer.includes('is running') || 
                    currentAnswer.includes('生成回答') ||
                    currentAnswer === '') {
                  continue
                }
                
                accumulatedAnswer = currentAnswer

                // 更新引用信息
                if (data.data.reference?.chunks) {
                  finalReferences = data.data.reference.chunks
                }
                
                onMessage({
                  answer: accumulatedAnswer,
                  references: finalReferences,
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