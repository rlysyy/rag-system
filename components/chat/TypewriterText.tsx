import { useEffect, useState } from 'react'

export function TypewriterText({ content, onComplete }: {
  content: string
  onComplete?: () => void
}) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // 使用 Intl.Segmenter 来正确分割包括 emoji 在内的所有字符
    const segmenter = new Intl.Segmenter('zh', { granularity: 'grapheme' })
    const segments = Array.from(segmenter.segment(content)).map(s => s.segment)
    
    if (currentIndex < segments.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(prev => prev + segments[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 50)

      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [content, currentIndex, onComplete])

  return <span>{displayedContent}</span>
} 