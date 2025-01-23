import { Send } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface SenderProps {
  onSend: (content: string) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function Sender({ onSend, isLoading, onCancel }: SenderProps) {
  const [input, setInput] = useState('')
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
    
    const content = input.trim()
    setInput('')
    await onSend(content)
  }

  return (
    <div className="relative w-full">
      <div className="max-w-3xl mx-auto w-full relative">
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
          className="w-full resize-none rounded-lg border border-input bg-background px-5 py-4 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden pr-16"
          style={{ minHeight: '56px', maxHeight: '200px' }}
          rows={1}
        />
        <button
          onClick={isLoading ? onCancel : handleSubmit}
          disabled={isLoading ? false : !input.trim()}
          className={`absolute right-5 bottom-4 transition-all duration-200 p-2 rounded-full flex items-center justify-center ${
            isLoading 
              ? 'bg-primary/10' 
              : input.trim() 
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                : 'hover:bg-muted'
          }`}
        >
          {isLoading ? (
            <div className="relative h-5 w-5 flex items-center justify-center">
              <div className="absolute w-1.5 h-1.5 bg-primary rounded-sm" />
              <div className="absolute inset-[-2px] border-[1.5px] border-primary/20 rounded-full" />
              <div className="absolute inset-[-2px] border-[1.5px] border-transparent border-t-primary rounded-full animate-[spin_1s_linear_infinite]" />
            </div>
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  )
} 