// API 配置和类型定义
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const API_KEY = process.env.API_KEY

interface CompletionRequest {
  question: string
  stream: boolean
  session_id: string
  user_id?: string
}

interface CompletionResponse {
  content: string
  references?: Array<{
    id: string
    name: string
  }>
}

// API 调用函数
export async function getCompletion(params: CompletionRequest): Promise<CompletionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/agents/${process.env.AGENT_ID}/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify(params)
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
} 