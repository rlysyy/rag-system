'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from "lucide-react"
import { Sender } from "@/app/components/Sender"

export default function ChatLayout() {
  const [conversations, setConversations] = useState([
    { id: '1', title: '对话 1' },
    { id: '2', title: '对话 2' },
  ])
  const [activeConversation, setActiveConversation] = useState<string | null>('1')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    // 添加用户消息
    setMessages((prev) => [...prev, { role: 'user', content: input }])
    setInput('')

    try {
      // 发送消息到后端
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })

      const data = await response.json()

      // 添加助手消息
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (error) {
      console.error('发送消息失败:', error)
      setMessages((prev) => [...prev, { role: 'assistant', content: '抱歉，出错了，请稍后再试。' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewConversation = () => {
    const newConversation = { id: Date.now().toString(), title: `对话 ${conversations.length + 1}` }
    setConversations((prev) => [...prev, newConversation])
    setActiveConversation(newConversation.id)
    setMessages([])
  }

  return (
    <div className="flex h-screen">
      {/* 左侧栏 */}
      <div className="w-64 border-r bg-[hsl(var(--background))]">
        <div className="p-4">
          <Button onClick={handleNewConversation} className="w-full">
            新建对话
          </Button>
        </div>
        <div className="p-2 text-sm font-medium text-muted-foreground">
          历史记录
        </div>
        <ScrollArea className="h-[calc(100vh-148px)] p-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                activeConversation === conv.id
                  ? 'bg-primary/10 text-foreground'
                  : 'hover:bg-secondary'
              }`}
              onClick={() => setActiveConversation(conv.id)}
            >
              {conv.title}
            </div>
          ))}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-muted/70 to-muted" />
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              仅显示最近 20 条对话
            </div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-muted/70 to-muted" />
          </div>
        </ScrollArea>
      </div>

      {/* 右侧聊天窗口 */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              {msg.role === 'assistant' && (
                <Avatar className="mr-2">
                  <AvatarImage src="/bot-avatar.png" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`p-3 rounded-lg max-w-[70%] ${
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-background">
          <Sender />
        </div>
      </div>
    </div>
  )
} 