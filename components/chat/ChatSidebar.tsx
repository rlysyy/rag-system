'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { PlusCircle, MessageSquare, Info } from 'lucide-react'
import { useChatStore } from '@/store/chat'
import { cn } from '@/lib/utils'

export function ChatSidebar() {
  const { 
    chatHistory, 
    currentChatId, 
    clearMessages, 
    loadChat,
    isLoading,
    isTyping
  } = useChatStore()
  const { data: session } = useSession()

  const isResponding = isLoading || isTyping
  
  const handleNewChat = async () => {
    if (isResponding) return
    await clearMessages()
  }

  const handleSelectChat = async (chatId: string) => {
    if (isResponding) return
    await loadChat(chatId, session)
  }

  const formatDate = (timestamp: string | Date) => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
      if (isNaN(date.getTime())) {
        return '无效日期'
      }
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Date formatting error:', error)
      return '无效日期'
    }
  }

  return (
    <div className="w-64 border-r bg-muted/10 flex flex-col h-full">
      <div className="p-4 border-b">
        <Button 
          onClick={handleNewChat}
          className="w-full" 
          variant="default"
          disabled={isResponding}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          新建对话
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="space-y-0.5 p-2">
          {chatHistory
            .sort((a, b) => {
              const timeA = new Date(a.timestamp).getTime()
              const timeB = new Date(b.timestamp).getTime()
              
              if (isNaN(timeA)) return 1
              if (isNaN(timeB)) return -1
              
              return timeB - timeA
            })
            .slice(0, 20)
            .map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                disabled={isResponding}
                className={cn(
                  "w-full px-3 py-2 rounded-md text-left transition-colors",
                  "hover:bg-muted/60",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  chat.id === currentChatId ? "bg-muted" : "bg-transparent",
                  "flex items-center gap-3",
                  isResponding && "opacity-50 cursor-not-allowed"
                )}
              >
                <MessageSquare className="h-4 w-4 shrink-0 opacity-60" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate font-medium">
                    {chat.title || '新对话'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {formatDate(chat.timestamp)}
                  </p>
                </div>
              </button>
            ))}
        </div>
      </div>

      <div className="p-4 border-t">
        <div className="relative py-2">
          <div className="absolute inset-y-0 left-0 w-[30%] bg-gradient-to-r from-muted/30 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-[30%] bg-gradient-to-l from-muted/30 to-transparent" />
          <p className="text-center text-xs text-muted-foreground">
            最近 20 条对话
          </p>
        </div>
      </div>
    </div>
  )
} 