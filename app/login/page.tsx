import SignInForm from '@/components/sign-in'

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 dark:border-r dark:border-zinc-800 lg:flex">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/95 to-zinc-900/95">
          {/* 工厂背景图片 */}
          <img
            src="/images/factory-bg.jpg"
            alt="Smart Factory"
            className="h-full w-full object-cover opacity-25"
          />
        </div>
      </div>
      <div className="relative flex h-full flex-col items-center justify-center lg:p-8 dark:bg-zinc-950">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[480px] px-4 md:px-8">
          <SignInForm />
        </div>
      </div>
    </div>
  )
} 