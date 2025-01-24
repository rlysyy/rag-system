import SignInForm from '@/components/auth/sign-in'
import { ThemeToggle } from '@/components/auth/theme-toggle'

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="absolute right-4 top-4 md:right-8 md:top-8 z-50">
        <ThemeToggle />
      </div>
      <div className="relative hidden h-full flex-col bg-muted p-10 dark:border-r dark:border-zinc-800/30 lg:flex">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/80 to-zinc-900/90 dark:from-black/80 dark:to-zinc-900/90">
          <img
            src="/images/factory-bg.jpg"
            alt="Smart Factory"
            className="h-full w-full object-cover opacity-30 dark:opacity-20"
          />
        </div>
      </div>
      <div className="relative flex h-full flex-col items-center justify-center lg:p-8 bg-white dark:bg-black">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[480px] px-4 md:px-8">
          <SignInForm />
        </div>
      </div>
    </div>
  )
} 