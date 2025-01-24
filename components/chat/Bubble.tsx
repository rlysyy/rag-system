import { FC, useState } from 'react'
import { Message } from '@/types/chat'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TypewriterText } from './TypewriterText'

export function Bubble({ message, isLast }: { 
  message: Message
  isLast?: boolean 
}) {
  const isUser = message.role === 'user'
  const references = message.references || []
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  
  const handleOpenDocument = (fileId: string, fileName: string) => {
    const ext = fileName.split('.').pop()
    const url = `http://localhost/document/${fileId}?ext=${ext}&prefix=document`
    window.open(url, '_blank')
  }

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
            <p className="whitespace-pre-wrap break-words">
              {isUser || !isLast ? (
                message.content
              ) : (
                <TypewriterText 
                  content={message.content} 
                  onComplete={() => setIsTypingComplete(true)}
                />
              )}
            </p>
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
      {!isUser && references.length > 0 && isTypingComplete && (
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