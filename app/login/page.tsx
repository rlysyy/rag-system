import Link from 'next/link'
import SignInForm from '@/components/sign-in'

export default function LoginPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4 text-center">登录</h1>
      <SignInForm />
      <div className="mt-4 text-center">
        没有账号？{' '}
        <Link href="/register" className="text-blue-500 hover:underline">
          立即注册
        </Link>
      </div>
    </div>
  )
} 