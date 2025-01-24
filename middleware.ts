import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

// 使用命名导出
export async function middleware(request: NextRequest) {
  // 测试阶段：直接放行所有请求?
  return NextResponse.next()

  // 以下是原有的登录验证逻辑，暂时注释掉
  /*
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  const { pathname } = request.nextUrl

  // 如果用户未登录且访问受保护的路由，重定向到登录页
  if (!token && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 如果用户已登录且访问登录页或注册页，重定向到首页
  if (token && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
  */
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // 保护所有页面，排除静态资源
}
