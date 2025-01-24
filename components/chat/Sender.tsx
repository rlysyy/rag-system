import { FC, useState, FormEvent, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import { useChatStore } from '@/store/chat'

export function Sender() {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { addMessage, isLoading } = useChatStore()

  // 自动调整高度
  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const height = Math.min(textarea.scrollHeight, 200) // 最大高度200px
      textarea.style.height = `${Math.max(56, height)}px` // 最小高度56px
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [content])

  const handleSend = () => {
    if (!content.trim() || isLoading) return
    
    addMessage({
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    })
    setContent('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <form onSubmit={(e: FormEvent) => { e.preventDefault(); handleSend() }} className="p-4">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          disabled={isLoading}
          className="resize-none pr-14 min-h-[56px] max-h-[200px] overflow-hidden py-4 leading-[1.5] text-base font-normal"
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !content.trim()}
          className="absolute right-2 top-[50%] -translate-y-[50%] rounded-full w-10 h-10 p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
} 