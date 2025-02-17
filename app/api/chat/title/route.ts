import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const { chatId, title } = await request.json()

    const updatedChat = await prisma.chatSession.update({
      where: {
        id: chatId
      },
      data: {
        title
      }
    })

    return NextResponse.json(updatedChat)
  } catch (error) {
    console.error('Error updating chat title:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 