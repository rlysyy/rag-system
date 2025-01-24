import { useEffect, useState } from 'react'

export function TypewriterText({ content, onComplete }: {
  content: string
  onComplete?: () => void
}) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(prev => prev + content[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 50) // 从30ms调整到50ms，使打字速度更自然

      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [content, currentIndex, onComplete])

  return <span>{displayedContent}</span>
} 