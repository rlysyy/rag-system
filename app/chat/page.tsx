"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChatLayout } from '@/components/chat/ChatLayout';
import DataPage from '@/app/data/page';
import { BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const [showDataPanel, setShowDataPanel] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-screen flex">
      {/* 聊天区域 */}
      <div className={cn(
        "transition-all duration-300 min-w-0",
        showDataPanel ? "w-[50%]" : "w-full"
      )}>
        <ChatLayout />
      </div>

      {/* 数据面板切换按钮 */}
      <Button 
        variant="outline" 
        className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 p-2"
        onClick={() => setShowDataPanel(!showDataPanel)}
      >
        <BarChart className="h-5 w-5" />
      </Button>

      {/* 数据面板 */}
      {showDataPanel && (
        <div className="w-[50%] border-l bg-background custom-scrollbar">
          <div className="min-w-0">
            <DataPage />
          </div>
        </div>
      )}
    </div>
  );
}