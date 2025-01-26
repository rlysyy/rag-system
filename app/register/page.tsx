import SignUpForm from '@/components/auth/sign-up'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function RegisterPage() {
  return (
    <AuthLayout
      title="创建账户"
      description="智能工厂知识库系统"
    >
      <SignUpForm />
    </AuthLayout>
  )
} 