import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"

/**
 * 获取指定会话的消息列表
 * @route GET /api/chat/messages
 * @param req - 请求对象，需要包含 sessionId 查询参数
 * @returns 返回指定会话的所有消息，按时间升序排序
 */
export async function GET(request: NextRequest) {
  console.log('\n=== API Route GET /api/chat/messages ===')
  console.log('Request URL:', request.url)
  
  // 使用 NextRequest 的 searchParams
  const sessionId = request.nextUrl.searchParams.get('sessionId')
  console.log('Session ID:', sessionId)
  
  if (!sessionId) {
    console.log('Error: Missing sessionId')
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  }

  try {
    console.log('Querying database...')
    const messages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' }
    })
    console.log(`Found ${messages.length} messages`)
    
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

/**
 * 创建新消息
 * @route POST /api/chat/messages
 * @param req - 请求对象，body 需要包含 sessionId 和 message 对象
 * @returns 返回保存的消息
 */
export async function POST(req: Request) {
  console.log('POST /api/chat/messages called')
  const session = await auth()
  
  if (!session?.user?.id) {
    console.log('No session found:', session)
    return new NextResponse('Unauthorized: No valid session', { status: 401 })
  }

  try {
    const { sessionId, message } = await req.json()
    console.log('Received message:', { sessionId, message, userId: session.user.id })

    // 验证会话所有权
    const validSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id
      }
    })

    console.log('Valid session check:', { validSession, sessionId, userId: session.user.id })

    if (!validSession) {
      // 如果会话不存在，自动创建一个
      const newSession = await prisma.chatSession.create({
        data: {
          id: sessionId,
          userId: session.user.id,
          title: message.content.slice(0, 30),
          lastMessage: message.content
        }
      })
      console.log('Created new session:', newSession)
    }

    // 保存消息
    const savedMessage = await prisma.message.create({
      data: {
        sessionId,
        role: message.role,        // 消息角色：user 或 assistant
        content: message.content,  // 消息内容
        references: message.references || {}  // 可选的引用内容
      }
    })

    return NextResponse.json(savedMessage)
  } catch (error: any) {
    console.error('Message save failed:', error)
    return new NextResponse('Failed to save message: ' + error.message, { status: 500 })
  }
} 