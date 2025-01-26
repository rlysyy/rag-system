'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export function AdminLink() {
  const { data: session } = useSession()

  if (session?.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <Link 
      href="/admin" 
      className="text-blue-600 hover:text-blue-800"
    >
      管理后台
    </Link>
  )
} 