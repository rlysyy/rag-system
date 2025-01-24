"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChatLayout } from '@/components/chat/ChatLayout';
import dynamic from 'next/dynamic';
import { BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

// 动态导入数据面板组件
const DataPage = dynamic(() => import('@/app/data/page'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center">加载中...</div>
})

export default function ChatPage() {
  const [showDataPanel, setShowDataPanel] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-screen flex overflow-hidden">
      {/* 聊天区域 */}
      <div className={cn(
        "transition-[width] duration-300 ease-in-out min-w-0",
        showDataPanel ? "w-[50%]" : "w-full"
      )}>
        <ChatLayout />
      </div>

      {/* 数据面板切换按钮 */}
      <Button 
        variant="outline" 
        className={cn(
          "fixed right-4 top-1/2 -translate-y-1/2 z-50 p-2 transition-transform duration-300",
          showDataPanel && "translate-x-0"
        )}
        onClick={() => setShowDataPanel(!showDataPanel)}
      >
        <BarChart className="h-5 w-5" />
      </Button>

      {/* 数据面板 */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-[50%] border-l bg-background custom-scrollbar transition-transform duration-300 ease-in-out",
        showDataPanel ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="min-w-0 h-full">
          {showDataPanel && <DataPage />}
        </div>
      </div>
    </div>
  );
}