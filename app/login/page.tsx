import SignInForm from '@/components/auth/sign-in'
import { ThemeToggle } from '@/components/theme/theme-toggle'

export default function LoginPage() {
  return (
    <div className="relative grid min-h-screen container lg:grid-cols-2 lg:max-w-none lg:px-0">
      <div className="absolute z-50 right-4 top-4 md:right-8 md:top-8">
        <ThemeToggle />
      </div>
      <div className="relative h-full hidden lg:flex flex-col bg-muted p-10 dark:border-r dark:border-zinc-800/30">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/80 to-zinc-900/90 dark:from-black/80 dark:to-zinc-900/90">
          <img
            src="/images/factory-bg.jpg"
            alt="Smart Factory"
            className="h-full w-full object-cover opacity-30 dark:opacity-20"
          />
        </div>
      </div>
      <div className="h-full flex items-center justify-center lg:p-8 bg-white dark:bg-zinc-900/95">
        <div className="w-full max-w-[480px] px-4 md:px-8">
          <SignInForm />
        </div>
      </div>
    </div>
  )
} 