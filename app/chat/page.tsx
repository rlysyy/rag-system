"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ChatLayout from '@/components/chat/ChatLayout';
import DataPage from '@/app/data/page';
import { BarChart } from 'lucide-react';

export default function ChatPage() {
  const [showDataPanel, setShowDataPanel] = useState(false);

  return (
    <div className="h-screen flex relative overflow-hidden">
      {/* 聊天主界面 */}
      <div 
        className={`flex-1 transition-all duration-300 ease-in-out ${showDataPanel ? 'w-1/2' : 'w-full'}`}
        style={{ maxWidth: showDataPanel ? '50%' : '100%' }}
      >
        <div className="h-full overflow-y-auto">
          <ChatLayout />
        </div>
      </div>

      {/* 数据面板切换按钮 */}
      <Button 
        variant="outline" 
        className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 p-2"
        onClick={() => setShowDataPanel(!showDataPanel)}
        style={{ zIndex: 1000 }} // 确保按钮在最上层
      >
        <BarChart className="h-5 w-5" />
      </Button>

      {/* 数据面板 */}
      {showDataPanel && (
        <div 
          className="absolute right-0 top-0 h-screen w-1/2 bg-background border-l overflow-y-auto transition-transform duration-300 ease-in-out"
          style={{ transform: showDataPanel ? 'translateX(0)' : 'translateX(100%)', zIndex: 500 }} // 设置较低的 z-index 以确保按钮在其上方
          onClick={(e) => e.stopPropagation()} // 防止点击穿透
        >
          <div className="p-4"> {/* 添加一些内边距以便内容不贴边 */}
            <DataPage />
          </div>
        </div>
      )}
    </div>
  );
}