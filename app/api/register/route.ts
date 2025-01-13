import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    // 确保请求体是 JSON 格式
    if (!request.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json(
        { message: '请求头 Content-Type 必须为 application/json' },
        { status: 400 }
      )
    }

    // 读取并解析请求体
    const requestBody = await request.text() // 先以文本形式读取请求体
    console.log('Raw request body:', requestBody) // 打印原始请求体

    const { email, password, name } = JSON.parse(requestBody) // 解析 JSON
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

    return NextResponse.json({ message: '注册成功' }, { status: 201 })
  } catch (err: any) { // 显式声明 err 类型为 any
    console.error('Error during registration:', err.message || err) // 确保 err 是有效的对象
    return NextResponse.json(
      { message: '服务器错误，请重试' },
      { status: 500 }
    )
  }
}