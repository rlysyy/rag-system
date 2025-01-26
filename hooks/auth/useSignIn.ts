import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(5, '密码至少需要 5 个字符'),
})

export function useSignIn() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  
  const handleSignIn = async (formData: FormData) => {
    setError(null)
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    try {
      loginSchema.parse(data)
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        const user = await fetch('/api/auth/user').then(res => res.json())
        if (user.role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message)
      } else {
        setError('登录失败，请重试')
      }
    }
  }

  return {
    error,
    handleSignIn
  }
} 