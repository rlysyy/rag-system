export interface Agent {
  id: string
  title: string
  description: string | null
  avatar: string | null
  create_date: string
  update_date: string
  create_time: number
  update_time: number
  user_id: string
  canvas_type: string | null
  dsl: {
    // ... DSL 相关类型
  }
}

export interface AgentListResponse {
  code: number
  data: Agent[]
}

export interface AgentListParams {
  page?: number
  page_size?: number
  orderby?: 'create_time' | 'update_time'
  desc?: boolean
  name?: string
  id?: string
} 