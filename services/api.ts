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
  references: Array<{
    id: string
    name: string
  }>
}

interface CompletionParams {
  question: string
  stream?: boolean
  session_id?: string
  user_id?: string
}

// API 调用函数
export async function getCompletion(params: CompletionParams): Promise<CompletionResponse> {
  // 暂时返回模拟数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        content: "这是一个模拟的回复。",
        references: []
      })
    }, 1000)  // 模拟1秒延迟
  })
} 