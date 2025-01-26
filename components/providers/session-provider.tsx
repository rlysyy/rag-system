'use client'

import { SessionProvider as Provider } from 'next-auth/react'

interface SessionProviderProps {
  children: React.ReactNode
}

export default function SessionProvider({ children }: SessionProviderProps) {
  return <Provider>{children}</Provider>
} 