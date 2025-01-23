'use client'

import { useState, useRef } from 'react'
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
  const abortControllerRef = useRef<AbortController | null>(null);

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
    if (isLoading) return;
    
    setMessages(prev => [...prev, { role: 'user', content }]);
    setIsLoading(true);
    
    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();

    try {
      // 模拟 API 调用，传入 signal
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(resolve, 3000);
        abortControllerRef.current?.signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new Error('Cancelled'));
        });
      });

      const aiResponse = "This is a simulated response.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Cancelled') {
        console.log('Request cancelled');
      } else {
        console.error('Error:', error);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
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
              <Sender 
                onSend={handleSendMessage} 
                isLoading={isLoading}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 