'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  if (status === 'authenticated' && session.user.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">访问被拒绝</h1>
        <p className="mt-2">您没有访问此页面的权限</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">管理员仪表板</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">当前用户信息：</h2>
          <p>邮箱: {session.user.email}</p>
          <p>角色: {session.user.role}</p>
          <p>ID: {session.user.id}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">管理员功能：</h2>
          <ul className="list-disc list-inside">
            <li>用户管理</li>
            <li>系统设置</li>
            <li>数据统计</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 