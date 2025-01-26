import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'

type Role = 'USER' | 'ADMIN'

const signUpSchema = z.object({
  name: z.string().min(2, '用户名至少需要 2 个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(5, '密码至少需要 5 个字符'),
  confirmPassword: z.string(),
  role: z.enum(['USER', 'ADMIN'] as const).default('USER')
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
})

export function useSignUp() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (formData: FormData) => {
    setError(null)
    setIsLoading(true)
    
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      role: (formData.get('role') as Role) || 'USER'
    }

    try {
      signUpSchema.parse(data)
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '注册失败')
      }

      router.push('/login')
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message)
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('注册失败，请重试')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    error,
    isLoading,
    handleSignUp
  }
} 