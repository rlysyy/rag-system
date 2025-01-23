'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Bubble } from "./Bubble"
import { Sender } from "@/components/chat/Sender"

interface ChatLayoutProps {
  showDataPanel?: boolean;
}

export default function ChatLayout({ showDataPanel = false }: ChatLayoutProps) {
  const [conversations, setConversations] = useState([
    { id: '1', title: '对话 1' },
    { id: '2', title: '对话 2' },
  ])
  const [activeConversation, setActiveConversation] = useState<string | null>('1')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hi! How can I help you today?' },
    { role: 'user', content: 'Hello! I have some questions about React.' },
    { role: 'assistant', content: 'Sure! I\'d be happy to help you with React. What would you like to know?' },
  ])
  const [isLoading, setIsLoading] = useState(false);

  const handleNewConversation = () => {
    const newConversation = { 
      id: Date.now().toString(), 
      title: `对话 ${conversations.length + 1}` 
    }
    setConversations((prev) => [...prev, newConversation])
    setActiveConversation(newConversation.id)
    setMessages([])
  }

  const handleSendMessage = async (content: string) => {
    // 添加用户消息
    setMessages(prev => [...prev, { role: 'user', content }]);
    
    // 立即设置加载状态
    setIsLoading(true);

    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 3000));
      const aiResponse = "This is a simulated response.";
      
      // 添加 AI 响应
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Error:', error);
      // 可以添加错误处理
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex h-screen transition-all duration-300 ${showDataPanel ? 'w-1/2' : 'w-full'} p-2`}>
      <div className="w-full h-full rounded-xl border bg-card shadow-sm flex">
        {/* 左侧栏 */}
        <div className="w-64 shrink-0 border-r">
          <div className="p-4">
            <Button onClick={handleNewConversation} className="w-full">
              新建对话
            </Button>
          </div>
          <Separator />
          <div className="p-2 text-sm font-medium text-muted-foreground">
            历史记录
          </div>
          <ScrollArea className="flex-1 px-2 pb-2">
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
          </ScrollArea>
        </div>

        {/* 右侧聊天窗口 */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
            <div className="max-w-4xl mx-auto py-4">
              {messages.map((msg, index) => (
                <div key={index} className="mb-6 px-4">
                  <Bubble
                    content={msg.content}
                    role={msg.role}
                    avatar={msg.role === 'assistant' ? '/bot-avatar.png' : '/user-avatar.png'}
                  />
                </div>
              ))}
              {isLoading && (
                <div className="mb-6 px-4">
                  <Bubble
                    content=""
                    role="assistant"
                    avatar="/bot-avatar.png"
                    isLoading={true}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="p-4">
            <div className="max-w-4xl mx-auto">
              <Sender onSend={handleSendMessage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 