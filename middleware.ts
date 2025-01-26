import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

// 使用命名导出
export async function middleware(request: NextRequest) {
  // 测试阶段：直接放行所有请求?
  // return NextResponse.next()

  // 以下是原有的登录验证逻辑，暂时注释掉
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  const { pathname } = request.nextUrl

  // 管理员路由保护
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // 验证是否是管理员
    const user = await fetch(`${request.url}/api/auth/user`).then(res => res.json())
    if (user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 普通路由保护
  if (!token && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 已登录用户重定向
  if (token && (pathname.startsWith('/login'))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)']
}
