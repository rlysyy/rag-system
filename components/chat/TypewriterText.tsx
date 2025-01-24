import { useEffect, useState } from 'react'

export function TypewriterText({ content, onComplete }: {
  content: string
  onComplete?: () => void
}) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // 将字符串转换为数组，正确处理 emoji
    const characters = Array.from(content)
    
    if (currentIndex < characters.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(prev => prev + characters[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 50)

      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [content, currentIndex, onComplete])

  return <span>{displayedContent}</span>
} 