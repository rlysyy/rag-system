import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"

/**
 * 获取指定会话的消息列表
 * @route GET /api/chat/messages
 * @param req - 请求对象，需要包含 sessionId 查询参数
 * @returns 返回指定会话的所有消息，按时间升序排序
 */
export async function GET(req: Request) {
  // 从 URL 中获取会话 ID
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')
  
  // 验证必需参数
  if (!sessionId) {
    return new NextResponse('Missing sessionId', { status: 400 })
  }

  try {
    // 查询数据库获取消息列表，按创建时间升序排序
    const messages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    )
  }
}

/**
 * 创建新消息
 * @route POST /api/chat/messages
 * @param req - 请求对象，body 需要包含 sessionId 和 message 对象
 * @returns 返回保存的消息
 */
export async function POST(req: Request) {
  console.log('Received message request')  // 添加日志
  const session = await auth()
  if (!session?.user?.id) {
    console.log('No session found')  // 添加日志
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { sessionId, message } = await req.json()
  console.log('Message data:', { sessionId, message })  // 添加日志
  
  try {
    // 验证会话所有权，确保用户只能在自己的会话中发送消息
    const validSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id
      }
    })

    if (!validSession) {
      return new NextResponse('Invalid session', { status: 400 })
    }

    // 保存消息到数据库
    const savedMessage = await prisma.message.create({
      data: {
        sessionId,
        role: message.role,        // 消息角色：user 或 assistant
        content: message.content,  // 消息内容
        references: message.references || {}  // 可选的引用内容
      }
    })

    return NextResponse.json(savedMessage)
  } catch (error) {
    console.error('Message save failed:', error)
    return new NextResponse('Database error', { status: 500 })
  }
} 