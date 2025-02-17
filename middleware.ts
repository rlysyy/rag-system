import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

// 使用命名导出
export async function middleware(request: NextRequest) {
  console.log('Middleware called:', request.url)  // 添加日志

  // 以下是原有的登录验证逻辑
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
    // 直接从 token 中获取角色信息
    if (token.role !== 'ADMIN') {
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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // 添加你想要中间件处理的路径
    '/api/chat/:path*',
  ],
}
