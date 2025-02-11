import { useEffect, useState, useRef } from 'react'
import { useChatStore } from '@/store/chat'

export function TypewriterText({ content, onComplete }: {
  content: string
  onComplete?: () => void
}) {
  const [displayedContent, setDisplayedContent] = useState('')
  const { isTyping, stopTyping } = useChatStore()
  const contentRef = useRef(content)
  const currentIndexRef = useRef(0)

  useEffect(() => {
    if (!content) {
      setDisplayedContent('')
      return
    }
    if (!isTyping) {
      setDisplayedContent(content)
      onComplete?.()
      return
    }

    // 如果内容变长了，继续打字效果
    if (content.length > contentRef.current.length) {
      contentRef.current = content
      
      const typeNextChar = () => {
        if (currentIndexRef.current < content.length) {
          setDisplayedContent(content.slice(0, currentIndexRef.current + 1))
          currentIndexRef.current += 1
          
          // 继续打字
          setTimeout(typeNextChar, 30)
        } else {
          stopTyping()
          onComplete?.()
        }
      }

      // 从当前位置继续打字
      setTimeout(typeNextChar, 30)
    }
  }, [content, isTyping, onComplete, stopTyping])

  return <span className="typing-content">{displayedContent}</span>
} 