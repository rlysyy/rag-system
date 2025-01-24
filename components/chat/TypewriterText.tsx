import { useEffect, useState } from 'react'
import { useChatStore } from '@/store/chat'

export function TypewriterText({ content, onComplete }: {
  content: string
  onComplete?: () => void
}) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const { isLoading, isTyping, stopTyping } = useChatStore()

  useEffect(() => {
    let segments: string[]
    
    // 检查浏览器是否支持 Intl.Segmenter
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const segmenter = new Intl.Segmenter('zh', { granularity: 'grapheme' })
      segments = Array.from(segmenter.segment(content)).map(s => s.segment)
    } else {
      // 降级方案：使用 Array.from
      segments = Array.from(content)
    }
    
    if (currentIndex < segments.length && !isLoading && isTyping) {
      const timer = setTimeout(() => {
        setDisplayedContent(prev => prev + segments[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 50)

      return () => clearTimeout(timer)
    } else {
      if (onComplete) onComplete()
      if (isTyping) {
        stopTyping()
        // 更新消息内容为当前已显示的内容
        useChatStore.getState().updateLastMessage(displayedContent)
      }
    }
  }, [content, currentIndex, onComplete, isLoading, isTyping, stopTyping, displayedContent])

  // 总是返回当前已显示的内容
  return <span>{displayedContent}</span>
} 