'use client'

import { FC, useState, FormEvent, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import { useChatStore } from '@/store/chat'

export function Sender() {
  const { addMessage, isLoading, stopCurrentResponse, isTyping, stopTyping } = useChatStore()
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted')  // 添加日志
    handleSend()
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
          className="resize-none pr-14 min-h-[56px] max-h-[200px] overflow-hidden py-4 leading-[1.5] text-base font-normal"
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!content.trim()}
          className="absolute right-2 top-[13px]"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  )
} 