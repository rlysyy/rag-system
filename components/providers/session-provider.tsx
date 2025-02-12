'use client'

import { SessionProvider as Provider } from 'next-auth/react'

interface SessionProviderProps {
  children: React.ReactNode
}

export default function SessionProvider({ children }: SessionProviderProps) {
  console.log('SessionProvider rendering...')  // Provider 渲染日志
  return <Provider>{children}</Provider>
} 