import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface BubbleProps {
  content: string;
  role: 'user' | 'assistant';
  avatar?: string;
  isLoading?: boolean;
}

export function Bubble({ content, role, avatar, isLoading }: BubbleProps) {
  const isUser = role === 'user'
  
  return (
    <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="h-8 w-8 mt-1">
        {isUser ? (
          <>
            <AvatarImage src="/user-avatar.png" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="/bot-avatar.png" alt="AI" />
            <AvatarFallback>AI</AvatarFallback>
          </>
        )}
      </Avatar>
      <div
        className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm ${
          isUser
            ? 'bg-primary/10 text-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {isLoading ? (
          <div className="flex gap-1.5 h-4 items-center">
            <div className="w-1 h-1 bg-current rounded-full animate-bounce-fast" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-current rounded-full animate-bounce-fast" style={{ animationDelay: '200ms' }} />
            <div className="w-1 h-1 bg-current rounded-full animate-bounce-fast" style={{ animationDelay: '400ms' }} />
          </div>
        ) : (
          content
        )}
      </div>
    </div>
  )
} 