import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    // 确保请求体是 JSON 格式
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json(
        { message: '请求头 Content-Type 必须为 application/json' },
        { status: 400 }
      )
    }

    // 读取并解析请求体
    const data = await req.json()
    console.log('Raw request body:', data) // 打印原始请求体

    const { email, password, name } = data
    console.log('Parsed request body:', { email, name }) // 打印解析后的数据

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    // 创建新用户
    const user = await prisma.user.create({
      data: {
        email,
        password,
        name,
      },
    })

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error during registration:', error instanceof Error ? error.message : error) // 确保 err 是有效的对象
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}