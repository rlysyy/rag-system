'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { z } from 'zod'

const signUpSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(5, '密码至少需要 5 个字符'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
})

export default function SignUpForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }

    try {
      signUpSchema.parse(data)
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
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
    }
  }

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">创建账户</h1>
        <p className="text-2xl font-medium text-muted-foreground">
          智能工厂知识库系统
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your.name@company.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">密码</Label>
            <Input 
              id="password"
              name="password" 
              type="password" 
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
            <Input 
              id="confirmPassword"
              name="confirmPassword" 
              type="password" 
              required 
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full">
            注册
          </Button>
        </div>
      </form>
    </div>
  )
} 