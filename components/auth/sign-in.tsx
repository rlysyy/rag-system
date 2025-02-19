'use client'

import { useSignIn } from '@/hooks/auth/useSignIn'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingButton } from "@/components/ui/loading-button"

export default function SignInForm() {
  const { error, isLoading, handleSignIn } = useSignIn()
  
  return (
    <div>
      <form onSubmit={(e) => {
        e.preventDefault()
        handleSignIn(new FormData(e.currentTarget))
      }}>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="邮箱"
              required
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input 
              id="password"
              name="password" 
              type="password" 
              placeholder="密码"
              required 
              autoComplete="current-password"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error === 'CredentialsSignin' || error === 'User does not exist'
                  ? '邮箱或密码错误'
                  : error}
              </AlertDescription>
            </Alert>
          )}
          <div className="pt-2">
            <LoadingButton 
              type="submit"
              className="w-full"
              isLoading={isLoading}
              loadingText="登录中..."
            >
              登录
            </LoadingButton>
          </div>
        </div>
      </form>
    </div>
  )
} 