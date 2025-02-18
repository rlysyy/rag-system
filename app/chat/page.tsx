"use client";

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ChatLayout } from '@/components/chat/ChatLayout'
import { BarChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/chat'
import { chatService } from '@/services/chatService'
import dynamic from 'next/dynamic'
import { storage } from '@/lib/storage'
import { STORAGE_KEYS } from '@/constants/storage'

// 动态导入数据面板组件
const DataPage = dynamic(() => import('@/app/data/page'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center">加载中...</div>
})

export default function ChatPage() {
  const { data: session } = useSession()
  const { chatHistory, setChatHistory, loadChat } = useChatStore()
  
  // 控制数据面板显示状态
  const [showDataPanel, setShowDataPanel] = useState(false)

  // 初始化：从数据库加载用户的聊天历史和最后的会话
  useEffect(() => {
    async function loadUserData() {
      if (session?.user?.id) {
        try {
          const dbSessions = await chatService.db.loadUserSessions(session.user.id)
          if (dbSessions?.length > 0) {
            setChatHistory(dbSessions)
            // 获取最后一次会话ID
            const lastChatId = storage.get(STORAGE_KEYS.LAST_CHAT_ID)
            if (lastChatId) {
              await loadChat(lastChatId, session)
            }
          }
        } catch (error) {
          console.error('Failed to load user sessions:', error)
        }
      }
    }

    // 如果chatHistory为空，则加载用户数据
    if (chatHistory.length === 0) {
      loadUserData()
    }
  }, [session, chatHistory.length, setChatHistory, loadChat])

  return (
    <div className="h-screen flex overflow-hidden">
      {/* 聊天区域容器 */}
      <div className="w-full">
        <div className={cn(
          "w-full h-full transition-transform duration-300 ease-in-out",
          showDataPanel && "!w-[50vw]"  // 当数据面板显示时调整宽度
        )}>
          <ChatLayout />
        </div>
      </div>

      {/* 数据面板切换按钮 */}
      <Button 
        variant="outline" 
        className={cn(
          "fixed right-4 top-1/2 -translate-y-1/2 z-50 p-2 transition-transform duration-300 mr-2",
          showDataPanel && "translate-x-0"
        )}
        onClick={() => setShowDataPanel(!showDataPanel)}
      >
        <BarChart className="h-5 w-5" />
      </Button>

      {/* 数据面板 */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-[50%] border-l bg-white",
        "custom-scrollbar transition-transform duration-300 ease-in-out transform shadow-lg",
        showDataPanel ? "translate-x-0" : "translate-x-full"  // 控制面板滑入滑出
      )}>
        <div className="min-w-0 h-full bg-gray-50/50">
          {showDataPanel && (
            <div className="light p-6">
              <DataPage />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}