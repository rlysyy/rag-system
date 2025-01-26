'use client'

import { useSignIn } from '@/hooks/auth/useSignIn'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignInForm() {
  const { error, handleSignIn } = useSignIn()
  
  return (
    <div>
      <form onSubmit={(e) => {
        e.preventDefault()
        handleSignIn(new FormData(e.currentTarget))
      }}>
        <div className="relative grid gap-4">
          <div className="relative grid gap-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your.name@company.com"
              required
            />
          </div>
          <div className="relative grid gap-2">
            <Label htmlFor="password">密码</Label>
            <Input 
              id="password"
              name="password" 
              type="password" 
              required 
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="relative w-full">
            登录
          </Button>
        </div>
      </form>
    </div>
  )
} 