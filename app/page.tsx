import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center space-y-6 max-w-5xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          智能设备维护系统
        </h1>
        
        <p className="text-lg leading-8 text-gray-600">
          基于检索增强生成的智能问答系统，为您提供准确、可靠的信息服务。
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/chat">
            <Button size="lg">
              开始使用
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg">
              了解更多
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
