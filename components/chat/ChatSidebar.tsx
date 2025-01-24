import { FC } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, MessageSquare } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { cn } from '@/lib/utils'

export function ChatSidebar() {
  const { clearMessages, currentChatId, chatHistory } = useChat()

  const handleNewChat = () => {
    clearMessages()
  }

  // 只显示最近的20条记录
  const recentHistory = chatHistory.slice(0, 20)

  return (
    <div className="w-[260px] flex flex-col h-full bg-muted/10">
      {/* 顶部按钮区 */}
      <div className="p-3">
        <Button 
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2" 
          variant="default"
        >
          <PlusCircle className="h-4 w-4" />
          新建对话
        </Button>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-1 p-2">
          {recentHistory.map((chat) => (
            <Button 
              key={chat.id}
              variant="ghost" 
              className={cn(
                "w-full justify-start gap-2 text-sm h-auto py-3 font-normal",
                chat.id === currentChatId && "bg-muted"
              )}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="truncate">{chat.title}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
} 