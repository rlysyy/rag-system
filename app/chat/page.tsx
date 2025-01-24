"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ChatLayout from '@/components/chat/ChatLayout';
import DataPage from '@/app/data/page';
import { BarChart } from 'lucide-react';

export default function ChatPage() {
  const [showDataPanel, setShowDataPanel] = useState(false);

  return (
    <div className="h-screen flex">
      <div className={`flex transition-all duration-300 ${showDataPanel ? 'w-1/2' : 'w-full'}`}>
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
        <div className="w-1/2 border-l bg-background">
          <DataPage />
        </div>
      )}
    </div>
  );
}