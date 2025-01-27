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