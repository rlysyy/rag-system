'use client'

import { useEffect, useState } from 'react'
import { Bubble } from './Bubble'
import { Sender } from './Sender'
import { ChatSidebar } from './ChatSidebar'
import { useChatStore } from '@/store/chat'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ChatLayout() {
  // 从全局状态获取消息和加载状态
  const { messages, addMessage, isLoading } = useChatStore()
  // 处理客户端水合
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    // 主布局容器
    <div className="min-w-0 h-full w-full p-4">
      {/* 聊天界面容器 */}
      <div className="flex min-w-0 h-full rounded-lg border bg-background shadow-sm">
        <ChatSidebar />

        {/* 消息区域 */}
        <div className="flex flex-col flex-1 min-w-0 border-l">
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="w-full mx-auto p-4 space-y-6">
              {/* 渲染消息气泡 */}
              {messages.map((message, index) => (
                <Bubble
                  key={index} 
                  message={message} 
                  isLast={index === messages.length - 1}
                  isNewResponse={
                    message.role === 'assistant' && 
                    index === messages.length - 1 && 
                    !isLoading
                  }
                />
              ))}
              {/* 加载状态指示器 */}
              {isLoading && (
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/bot-avatar.svg" alt="AI" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="flex gap-1.5 h-4 items-center">
                    {/* 加载动画点 */}
                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 消息输入区域 */}
          <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="w-full max-w-[1200px] mx-auto">
              <Sender />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 