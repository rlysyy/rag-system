import SignInForm from '@/components/auth/sign-in'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function LoginPage() {
  return (
    <AuthLayout
      title="欢迎使用"
      description="智能工厂知识库系统"
    >
      <SignInForm />
    </AuthLayout>
  )
} 