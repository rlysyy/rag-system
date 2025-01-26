'use client'

import { useSignUp } from '@/hooks/auth/useSignUp'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
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
        <div className="grid gap-2">
          <div className="grid gap-2">
            <Label htmlFor="name">用户名</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
            />
          </div>
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
          <div className="grid gap-2">
            <Label htmlFor="role">角色</Label>
            <Select name="role" defaultValue="USER">
              <SelectTrigger>
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
          <LoadingButton 
            type="submit"
            className="w-full"
            isLoading={isLoading}
            loadingText="注册中..."
          >
            注册
          </LoadingButton>
        </div>
      </form>
    </div>
  )
} 