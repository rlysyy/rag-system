'use client'

import { useState, FormEvent, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Square } from 'lucide-react'
import { useChatStore } from '@/store/chat'
import type { Message } from '@/types/chat'
import { useSession } from 'next-auth/react'

/**
 * 消息发送组件
 * 包含文本输入区域和发送按钮
 */
export function Sender() {
  // 从 store 获取状态和方法
  const { addMessage, isLoading, isTyping, stopGeneration } = useChatStore()
  // 从 session 获取用户信息
  const { data: session } = useSession()
  
  // 本地状态
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /**
   * 自动调整文本区域高度
   * 最小高度 56px，最大高度 200px
   */
  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const height = Math.min(textarea.scrollHeight, 200) // 最大高度200px
      textarea.style.height = `${Math.max(56, height)}px` // 最小高度56px
    }
  }

  // 监听内容变化，调整高度
  useEffect(() => {
    adjustHeight()
  }, [content])

  /**
   * 发送消息处理函数
   */
  const handleSend = () => {
    if (!content.trim() || isLoading) return
    
    const message: Message = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }
    
    addMessage(message, session)
    setContent('')
  }

  /**
   * 键盘事件处理
   * Enter 发送，Shift+Enter 换行
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  /**
   * 停止生成处理函数
   */
  const handleStop = (e: React.MouseEvent) => {
    e.preventDefault()
    stopGeneration()
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
          className="resize-none pr-24 min-h-[56px] max-h-[200px] overflow-hidden py-4 leading-[1.5] text-base font-normal"
          rows={1}
        />
        <div className="absolute right-2 top-[10px] flex gap-2">
          {(isLoading || isTyping) ? (
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleStop}
                className="rounded-full relative z-10 bg-background hover:bg-background/80 text-primary hover:text-primary/80"
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!content.trim()}
              className="rounded-full hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </form>
  )
} 