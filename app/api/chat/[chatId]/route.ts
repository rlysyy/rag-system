import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    // 删除聊天及其所有相关消息
    await prisma.$transaction([
      prisma.message.deleteMany({
        where: {
          sessionId: params.chatId
        }
      }),
      prisma.chatSession.delete({
        where: { 
          id: params.chatId 
        }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting chat:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 