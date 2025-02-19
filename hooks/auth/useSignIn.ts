import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'

// 定义登录表单的验证模式
const loginSchema = z.object({
  email: z.string()
    .email('请输入有效的邮箱地址'),  // 验证邮箱格式
  password: z.string()
    .min(5, '密码至少需要 5 个字符'),  // 验证密码长度
})

export function useSignIn() {
  const router = useRouter()
  // 存储错误信息
  const [error, setError] = useState<string | null>(null)
  // 存储加载状态
  const [isLoading, setIsLoading] = useState(false)
  
  /**
   * 处理登录表单提交
   * @param formData - 表单数据对象
   */
  const handleSignIn = async (formData: FormData) => {
    // 重置错误信息
    setError(null)
    // 设置加载状态
    setIsLoading(true)
    
    // 从表单数据中提取邮箱和密码
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    try {
      // 验证表单数据
      loginSchema.parse(data)

      // 调用 NextAuth 的 signIn 方法进行登录
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,  // 禁用自动重定向
      })

      if (result?.error) {
        // 统一错误提示
        setError('邮箱或密码错误')
      } else {
        // 登录成功，重定向到首页
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      // 处理验证错误
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message)
      } else {
        // 处理其他错误
        setError('登录失败，请重试')
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
    handleSignIn // 表单提交处理函数
  }
} 