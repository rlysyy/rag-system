"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChatLayout } from '@/components/chat/ChatLayout';
import dynamic from 'next/dynamic';
import { BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/hooks/useChat';

// 动态导入数据面板组件，避免首次加载过大
const DataPage = dynamic(() => import('@/app/data/page'), {
  ssr: false,  // 禁用服务端渲染
  loading: () => <div className="w-full h-full flex items-center justify-center">加载中...</div>
})

export default function ChatPage() {
  console.log('ChatPage rendering...')  // 添加渲染日志

  // 控制数据面板显示状态
  const [showDataPanel, setShowDataPanel] = useState(false);
  // 用于处理客户端水合
  const [mounted, setMounted] = useState(false);

  const { messages, addMessage, isLoading, currentChatId, chatHistory } = useChat();
  console.log('useChat hook result:', { messages, currentChatId, chatHistory });  // 添加 hook 结果日志

  // 确保组件只在客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    // 主布局容器
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
  );
}