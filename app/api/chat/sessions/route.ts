import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"

/**
 * 获取聊天会话列表
 * @route GET /api/chat/sessions
 * @param req - 请求对象，需要包含 userId 查询参数
 * @returns 返回指定用户的所有聊天会话
 */
export async function GET(req: Request) {
  // 从 URL 中获取用户 ID
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  
  // 验证必需参数W
  if (!userId) {
    return new NextResponse('Missing userId', { status: 400 })
  }

  try {
    // 查询数据库获取会话列表，按更新时间降序排序
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    })
    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Failed to fetch sessions:', error)
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    )
  }
}

/**
 * 创建新的聊天会话
 * @route POST /api/chat/sessions
 * @param req - 请求对象，body 需要包含 userId 和 title
 * @returns 返回新创建的会话信息
 */
export async function POST(req: Request) {
  console.log('POST /api/chat/sessions called') // 添加日志
  
  const session = await auth()
  console.log('Auth session:', session) // 添加日志
  
  if (!session?.user?.id) {
    console.log('No auth session found') // 添加日志
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const body = await req.json()
    console.log('Request body:', body) // 添加日志
    
    const { title } = body
    if (!title) {
      return new NextResponse('Missing title', { status: 400 })
    }

    const chatSession = await prisma.chatSession.create({
      data: {
        userId: session.user.id,
        title,
        lastMessage: title // 添加初始最后消息
      }
    })
    
    console.log('Created session:', chatSession) // 添加日志
    return NextResponse.json(chatSession)
  } catch (error: any) {
    console.error('Failed to create session:', error)
    return new NextResponse(
      `Failed to create session: ${error.message}`, 
      { status: 500 }
    )
  }
} 