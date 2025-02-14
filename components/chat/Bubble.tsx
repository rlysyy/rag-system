import { useState } from 'react'
import { Message } from '@/types/chat'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TypewriterText } from './TypewriterText'
import { useChatStore } from '@/store/chat'

export function Bubble({ message, isLast, isNewResponse }: { 
  message: Message
  isLast?: boolean 
  isNewResponse?: boolean
}) {
  const isUser = message.role === 'user'
  const references = message.references || []
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const { isTyping, isLoading } = useChatStore()
  
  // 检查是否是 loading 状态的消息
  const isLoadingMessage = !isUser && (
    message.content === '' ||
    message.content.includes('running') ||
    message.content.includes('生成回答')
  )

  // 如果不是最后一条消息，且是 loading 状态，不显示
  if (isLoadingMessage && !isLast) {
    return null
  }

  // 如果是最后一条消息，且正在加载，显示 loading 动画
  const showLoading = isLast && isLoading && !isTyping
  
  // 如果是 AI 消息且是最新响应，显示打字效果
  const shouldShowTyping = !isUser && isLast && !isLoadingMessage && isTyping

  const handleOpenDocument = (fileId: string, fileName: string) => {
    const ext = fileName.split('.').pop()
    const url = `http://localhost/document/${fileId}?ext=${ext}&prefix=document`
    window.open(url, '_blank')
  }

  // console.log('Rendering Bubble:', {
  //   messageContent: message.content,
  //   isLast,
  //   isNewResponse,
  //   shouldShowTyping,
  //   isTyping: useChatStore.getState().isTyping
  // })

  return (
    <div className="space-y-2">
      <div className={cn(
        "flex w-full",
        isUser ? "justify-end pl-10" : "justify-start pr-10"
      )}>
        <div className={cn(
          "flex items-start gap-3",
          isUser ? "max-w-[80%]" : "w-[calc(100%-44px)]"
        )}>
          {!isUser && (
            <Avatar className="h-8 w-8 mt-0.5 flex-shrink-0">
              <AvatarImage src="/avatars/bot-avatar.svg" alt="AI" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
          )}

          <div className={cn(
            "rounded-lg px-4 py-2.5 text-sm w-full",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            {showLoading ? (
              <div className="flex gap-1.5 h-4 items-center">
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words">
                {!shouldShowTyping ? (
                  message.content
                ) : (
                  <TypewriterText 
                    content={message.content} 
                    onComplete={() => setIsTypingComplete(true)}
                  />
                )}
              </p>
            )}
          </div>

          {isUser && (
            <Avatar className="h-8 w-8 mt-0.5 flex-shrink-0">
              <AvatarImage src="/avatars/user-avatar.svg" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>

      {/* 引用文件列表 */}
      {!isUser && references.length > 0 && (!isNewResponse || isTypingComplete) && (
        <div className="pl-11">
          <div className="w-[calc(100%-84px)] flex flex-col gap-2">
            {references.map((file, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full h-auto p-2 flex items-center gap-2 text-left bg-background hover:bg-background/80"
                onClick={() => handleOpenDocument(file.id, file.name)}
              >
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-xs">{file.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 