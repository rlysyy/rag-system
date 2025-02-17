import { useState, useEffect } from 'react'
import { Message } from '@/types/chat'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'
import { TypewriterText } from './TypewriterText'
import { useChatStore } from '@/store/chat'
import { 
  FileText,
  FilePdf, 
  FileDoc, 
  FileXls, 
  FileCsv,
  File 
} from "@phosphor-icons/react"

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
  const showLoading = isLast && isLoading && !isTyping
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

  const getFileIcon = (ext: string) => {
    const iconProps = {
      size: 20,
      weight: "fill" as const,
      className: cn("shrink-0", {
        "text-red-500": ext.toLowerCase() === 'pdf',
        "text-green-600": ['xlsx', 'xls'].includes(ext.toLowerCase()),
        "text-green-500": ext.toLowerCase() === 'csv',
        "text-blue-600": ['doc', 'docx'].includes(ext.toLowerCase()),
        "text-gray-600": ext.toLowerCase() === 'txt',
        "text-gray-500": !['pdf', 'xlsx', 'xls', 'csv', 'doc', 'docx', 'txt'].includes(ext.toLowerCase()) // 只在没有匹配其他类型时使用默认颜色
      })
    }

    switch(ext.toLowerCase()) {
      case 'pdf': return <FilePdf {...iconProps} />
      case 'xlsx':
      case 'xls': return <FileXls {...iconProps} />
      case 'csv': return <FileCsv {...iconProps} />
      case 'doc':
      case 'docx': return <FileDoc {...iconProps} />
      case 'txt': return <FileText {...iconProps} />
      default: return <File {...iconProps} />
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
                  className="w-full h-auto p-2 flex items-center gap-2 text-left bg-background hover:bg-background/80"
                  onClick={() => handleDocumentClick(reference)}
                >
                  {getFileIcon(ext)}
                  <span className="truncate text-xs">{reference.file_name}</span>
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
} 