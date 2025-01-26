'use client'

import { useSignUp } from '@/hooks/auth/useSignUp'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingButton } from "@/components/ui/loading-button"

export default function SignUpForm() {
  const { error, isLoading, handleSignUp } = useSignUp()

  return (
    <div>
      <form onSubmit={(e) => {
        e.preventDefault()
        handleSignUp(new FormData(e.currentTarget))
      }}>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-24">
              <Label htmlFor="name" className="block text-right">用户名</Label>
            </div>
            <Input
              id="name"
              name="name"
              type="text"
              className="flex-1"
              required
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24">
              <Label htmlFor="email" className="block text-right">电子邮箱</Label>
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              className="flex-1"
              placeholder="your.name@company.com"
              required
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24">
              <Label htmlFor="password" className="block text-right">登录密码</Label>
            </div>
            <Input 
              id="password"
              name="password" 
              type="password"
              className="flex-1"
              required 
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24">
              <Label htmlFor="confirmPassword" className="block text-right">确认密码</Label>
            </div>
            <Input 
              id="confirmPassword"
              name="confirmPassword" 
              type="password"
              className="flex-1"
              required 
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-24">
              <Label htmlFor="role" className="block text-right">用户角色</Label>
            </div>
            <Select name="role" defaultValue="USER">
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="选择角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">普通用户</SelectItem>
                <SelectItem value="ADMIN">管理员</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="pt-2 pl-28">
            <LoadingButton 
              type="submit"
              className="w-[calc(100%-1rem)]"
              isLoading={isLoading}
              loadingText="注册中..."
            >
              注册
            </LoadingButton>
          </div>
        </div>
      </form>
    </div>
  )
} 