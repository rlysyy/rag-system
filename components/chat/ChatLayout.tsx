'use client'

import { useEffect, useState } from 'react'
import { Bubble } from './Bubble'
import { Sender } from './Sender'
import { ChatSidebar } from './ChatSidebar'
import { useChatStore } from '@/store/chat'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ChatLayout() {
  const { messages, addMessage, isLoading } = useChatStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="h-full flex">
      <div className="h-full w-full p-4 min-w-0">
        <div className="h-full rounded-lg border shadow-sm bg-background flex min-w-0">
          <ChatSidebar />

          <div className="flex-1 flex flex-col border-l min-w-0">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="w-full mx-auto p-4 space-y-6">
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
                {isLoading && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/bot-avatar.svg" alt="AI" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="flex gap-1.5 h-4 items-center">
                      <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                      <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="w-full max-w-[1200px] mx-auto">
                <Sender />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 