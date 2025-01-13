'use client'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { z } from 'zod'

// 定义登录表单的验证规则
const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(5, '密码至少需要 5 个字符'),
})

export default function SignInForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() //阻止表单的默认提交行为（即阻止页面刷新）
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    try {
      // 验证表单数据
      loginSchema.parse(data)

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/')
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message) // 显示第一个验证错误
      } else {
        setError('登录失败，请重试')
      }
    }
  }

  return (
    <Card className="w-[350px] mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-center">登录</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="请输入邮箱" 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="请输入密码"
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full">
            登录
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 