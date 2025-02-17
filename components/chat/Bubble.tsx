import { useState, useEffect } from 'react'
import { Message } from '@/types/chat'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'
import { TypewriterText } from './TypewriterText'
import { useChatStore } from '@/store/chat'
import Image from 'next/image'

interface DocumentReference {
  file_link: string;
  file_name: string;
}

export function Bubble({ message, isLast, isNewResponse }: { 
  message: Message
  isLast?: boolean 
  isNewResponse?: boolean
}) {
  const isUser = message.role === 'user'
  const references = message.references || []
  const { isTyping, isLoading } = useChatStore()
  
  // 移动这些状态判断到 useEffect 之前
  const isLoadingMessage = !isUser && (
    message.content === '' ||
    message.content.includes('running') ||
    message.content.includes('生成回答')
  )
  const showLoading = isLast && isLoading && !isTyping && !message.content  // 只在没有内容时显示加载动画
  const shouldShowTyping = !isUser && isLast && !isLoadingMessage && isTyping
  
  const [isTypingComplete, setIsTypingComplete] = useState(true)
  
  useEffect(() => {
    if (shouldShowTyping) {
      setIsTypingComplete(false)
    } else {
      setIsTypingComplete(true)
    }
  }, [shouldShowTyping])

  const handleDocumentClick = async (reference: DocumentReference) => {
    try {
      // 构建完整的文件 URL
      const baseUrl = process.env.NEXT_PUBLIC_SDC_Document_URL
      const url = `${baseUrl}${reference.file_link}`
      
      // 在新窗口打开文件
      window.open(url, '_blank')
    } catch (error) {
      console.error('Failed to open document:', error)
      alert('打开文档失败，请稍后重试')
    }
  }

  const getFileIcon = (ext: string): string => {
    const getIconPath = (fileType: string) => `/icons/file-types/${fileType}.svg`
    
    switch(ext.toLowerCase()) {
      case 'pdf': 
        return getIconPath('pdf')
      case 'doc':
      case 'docx': 
        return getIconPath('doc')
      case 'xlsx':
      case 'xls': 
        return getIconPath('xlsx')
      case 'csv': 
        return getIconPath('csv')
      case 'txt': 
        return getIconPath('txt')
      default:
        return getIconPath('default')
    }
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

      {/* 引用文件列表 - 只在非用户消息、有引用、且打字完成时显示 */}
      {!isUser && message.references && message.references.length > 0 && (
        <div className="pl-11">
          <div className="w-[calc(100%-84px)] flex flex-col gap-2">
            {message.references.map((reference, index) => {
              const ext = reference.file_name.split('.').pop() || ''
              const uniqueKey = `${reference.file_name}-${reference.file_link}-${index}`
              
              return (
                <Button
                  key={uniqueKey}
                  variant="outline"
                  className="w-full h-auto p-3 flex items-center gap-3 text-left bg-background hover:bg-background/80"
                  onClick={() => handleDocumentClick(reference)}
                >
                  <div className="w-8 h-8 relative shrink-0">
                    <Image 
                      src={getFileIcon(ext)} 
                      alt={`${ext.toUpperCase()} file`}
                      width={32}
                      height={32}
                      className="object-contain" 
                    />
                  </div>
                  <span className="truncate text-sm flex-1">{reference.file_name}</span>
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
} 