import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
  // 解析请求体获取必需参数
  const { userId, title } = await req.json()
  
  // 验证必需参数
  if (!userId || !title) {
    return new NextResponse('Missing parameters', { status: 400 })
  }

  try {
    // 在数据库中创建新会话
    const newSession = await prisma.chatSession.create({
      data: {
        userId,
        title,
        lastMessage: ''  // 初始化最后消息为空
      }
    })
    return NextResponse.json(newSession)
  } catch (error) {
    console.error('Failed to create session:', error)
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    )
  }
} 