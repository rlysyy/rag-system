import { useEffect, useState } from 'react'
import { useChatStore } from '@/store/chat'

export function TypewriterText({ content, onComplete }: {
  content: string
  onComplete?: () => void
}) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const { isTyping, stopTyping } = useChatStore()

  useEffect(() => {
    // 重置状态
    setDisplayedContent('')
    setCurrentIndex(0)
  }, [content])

  useEffect(() => {
    if (!isTyping) return

    let segments: string[]
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      const segmenter = new Intl.Segmenter('zh', { granularity: 'grapheme' })
      segments = Array.from(segmenter.segment(content)).map(s => s.segment)
    } else {
      segments = Array.from(content)
    }

    if (currentIndex < segments.length) {
      const timer = setTimeout(() => {
        const newContent = segments.slice(0, currentIndex + 1).join('')
        setDisplayedContent(newContent)
        setCurrentIndex(prev => prev + 1)
      }, 50)

      return () => clearTimeout(timer)
    } else {
      if (onComplete) onComplete()
      stopTyping()
    }
  }, [content, currentIndex, isTyping, stopTyping, onComplete])

  // 如果不在打字状态，显示完整内容
  if (!isTyping) {
    return <span>{content}</span>
  }

  // 在打字状态下显示当前内容
  return <span className="typing-content">{displayedContent}</span>
} 