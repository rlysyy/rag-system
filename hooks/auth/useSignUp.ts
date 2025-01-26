import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'

// 定义角色类型
type Role = 'USER' | 'ADMIN'

// 定义注册表单的验证模式
const signUpSchema = z.object({
  name: z.string()
    .min(2, '用户名至少需要 2 个字符'),  // 验证用户名长度
  email: z.string()
    .email('请输入有效的邮箱地址'),      // 验证邮箱格式
  password: z.string()
    .min(5, '密码至少需要 5 个字符'),    // 验证密码长度
  confirmPassword: z.string(),           // 确认密码字段
  role: z.enum(['USER', 'ADMIN'] as const)
    .default('USER')                     // 角色字段，默认为普通用户
}).refine(
  // 自定义验证：确保两次输入的密码一致
  (data) => data.password === data.confirmPassword,
  {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],           // 将错误信息关联到确认密码字段
  }
)

export function useSignUp() {
  const router = useRouter()
  // 存储错误信息
  const [error, setError] = useState<string | null>(null)
  // 存储加载状态
  const [isLoading, setIsLoading] = useState(false)

  /**
   * 处理注册表单提交
   * @param formData - 表单数据对象
   */
  const handleSignUp = async (formData: FormData) => {
    // 重置错误信息
    setError(null)
    // 设置加载状态
    setIsLoading(true)
    
    // 从表单数据中提取所有字段
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      role: (formData.get('role') as Role) || 'USER'  // 如果未选择角色，默认为普通用户
    }

    try {
      // 验证表单数据
      signUpSchema.parse(data)
      
      // 发送注册请求
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 只发送必要的数据，不包含确认密码
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role
        }),
      })

      if (!response.ok) {
        // 如果服务器返回错误，抛出异常
        const error = await response.json()
        throw new Error(error.message || '注册失败')
      }

      // 注册成功，重定向到登录页
      router.push('/login')
    } catch (error) {
      // 处理验证错误
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message)
      } else if (error instanceof Error) {
        // 处理服务器返回的错误
        setError(error.message)
      } else {
        // 处理其他未知错误
        setError('注册失败，请重试')
      }
    } finally {
      // 无论成功失败，都关闭加载状态
      setIsLoading(false)
    }
  }

  // 返回状态和处理函数
  return {
    error,      // 错误信息
    isLoading,  // 加载状态
    handleSignUp // 表单提交处理函数
  }
} 