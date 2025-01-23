import { Loader2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface SenderProps {
  onSend: (message: string) => void;
}

export function Sender({ onSend }: SenderProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自动调整高度
  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = '0'  // 重置高度以获取正确的 scrollHeight
      const height = Math.min(textarea.scrollHeight, 200)  // 限制最大高度
      textarea.style.height = `${Math.max(48, height)}px`  // 确保最小高度
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [input])

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return
    setIsLoading(true)
    try {
      onSend(input.trim())
    } finally {
      setIsLoading(false)
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = '48px'  // 重置高度
      }
    }
  }

  const buttonPositionClass = textareaRef.current?.scrollHeight && textareaRef.current.scrollHeight > 48
    ? 'bottom-4'
    : 'top-[45%] -translate-y-1/2'

  return (
    <div className="relative w-full">
      <div className="max-w-2xl mx-auto w-full relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder="输入消息..."
          disabled={isLoading}
          className="w-full resize-none rounded-md border border-input bg-background px-4 py-3.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden pr-14"
          style={{ minHeight: '48px' }}
          rows={1}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !input.trim()}
          className={`absolute right-4 transition-all duration-200 p-1.5 rounded-full disabled:opacity-50 ${
            input.trim() ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'hover:bg-muted'
          } ${buttonPositionClass}`}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <svg 
              className="h-5 w-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M2 21l21-9L2 3v7l15 2-15 2v7z" 
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
} 