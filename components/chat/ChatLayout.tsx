'use client'

import { useEffect, useState } from 'react'
import { Bubble } from './Bubble'
import { Sender } from './Sender'
import { ChatSidebar } from './ChatSidebar'
import { useChatStore } from '@/store/chat'

export function ChatLayout() {
  const { messages } = useChatStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // 或者返回一个加载占位符
  }

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
              {messages.map((message, index) => (
                <Bubble
                  key={index}
                  message={message}
                  isLast={index === messages.length - 1}
                  isNewResponse={
                    message.role === 'assistant' && 
                    index === messages.length - 1
                  }
                />
              ))}
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