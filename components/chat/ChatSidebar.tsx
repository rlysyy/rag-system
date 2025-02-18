'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useChatStore } from '@/store/chat'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'

export function ChatSidebar() {
  const { 
    chatHistory, 
    currentChatId, 
    clearMessages, 
    loadChat,
    isLoading,
    isTyping,
    updateChatTitle,
    deleteChat,
    setChatHistory
  } = useChatStore()
  const { data: session } = useSession()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [isExpanded, setIsExpanded] = useState(true)

  const isResponding = isLoading || isTyping // 是否正在响应
  
  // 新建对话
  const handleNewChat = async () => {
    if (isResponding) return
    await clearMessages()
  }

  // 选择对话
  const handleSelectChat = async (chatId: string) => {
    if (isResponding) return
    await loadChat(chatId, session)
  }

  // 重命名对话
  const handleEdit = (id: string, title: string) => {
    setEditingId(id)
    setEditingTitle(title)
  }

  // 保存重命名
  const handleSave = async (id: string) => {
    if (editingTitle.trim()) {
      await updateChatTitle(id, editingTitle.trim())
      setEditingId(null)
    }
  }

  // 删除对话
  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个对话吗？')) {
      await deleteChat(id)
    }
  }

  return (
    <div className="relative h-full flex">
      <div className={cn(
        "h-full bg-background border-r transition-all duration-300",
        isExpanded ? "w-64" : "w-0"
      )}>
        <div className={cn(
          "h-full flex flex-col",
          !isExpanded && "hidden"
        )}>
          <div className="p-4 border-b">
            <Button 
              onClick={handleNewChat}
              className="w-full bg-primary hover:bg-primary/90" 
              disabled={isResponding}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              新建对话
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto p-2">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group relative flex items-center rounded-lg mb-1 transition-colors",
                  chat.id === currentChatId 
                    ? "bg-primary/10"
                    : "bg-transparent hover:bg-primary/5",
                  isResponding && "opacity-50 cursor-not-allowed"
                )}
              >
                {editingId === chat.id ? (
                  <div className="flex-1 flex items-center gap-2 p-2">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="h-8 bg-white"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave(chat.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                    />
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleSave(chat.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="flex-1 justify-start px-3 py-2 text-sm font-normal truncate rounded-lg"
                      onClick={() => handleSelectChat(chat.id)}
                      disabled={isResponding}
                    >
                      {chat.title || '新对话'}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => handleEdit(chat.id, chat.title || '新对话')}>
                          <Pencil className="h-4 w-4 mr-2" />
                          重命名
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(chat.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="relative py-2">
              <div className="absolute inset-y-0 left-0 w-[30%] bg-gradient-to-r from-muted/30 to-transparent" />
              <div className="absolute inset-y-0 right-0 w-[30%] bg-gradient-to-l from-muted/30 to-transparent" />
              <p className="text-center text-xs text-muted-foreground">
                最近 20 条对话
              </p>
            </div>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-1/2 -translate-y-1/2 -right-4 h-8 w-8",
          "rounded-full border shadow-md bg-background",
          "hover:bg-accent hover:text-accent-foreground",
          "transition-transform duration-300"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
} 