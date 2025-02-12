import type { Message } from '@/types/chat'

export const dbChatService = {
  // 获取用户的所有聊天会话
  async getUserSessions(userId: string) {
    const response = await fetch(`/api/chat/sessions?userId=${userId}`)
    return response.json()
  },

  // 获取单个会话的所有消息
  async getSessionMessages(sessionId: string) {
    const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`)
    return response.json()
  },

  // 创建新的聊天会话
  async createSession(userId: string, title: string) {
    const response = await fetch('/api/chat/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, title })
    })
    return response.json()
  },

  // 保存新消息
  async saveMessage(sessionId: string, message: Message) {
    const response = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionId, message })
    })
    return response.json()
  }
} 