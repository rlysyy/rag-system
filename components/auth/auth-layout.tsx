import Image from 'next/image'
import { ThemeToggle } from "@/components/theme/theme-toggle"

interface AuthLayoutProps {
  children: React.ReactNode
  backgroundImage?: string
  title: string
  description?: string
}

export function AuthLayout({ 
  children,
  backgroundImage = "/images/factory-bg.jpg",
  title,
  description
}: AuthLayoutProps) {
  return (
    <div className="relative grid min-h-screen container lg:grid-cols-2 lg:max-w-none lg:px-0">
      <div className="absolute z-50 top-4 right-4 md:top-8 md:right-8">
        <ThemeToggle />
      </div>

      <div className="relative h-full hidden lg:flex flex-col bg-muted p-10 dark:border-r dark:border-zinc-800/30">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/80 to-zinc-900/90 dark:from-black/80 dark:to-zinc-900/90">
          <Image
            src={backgroundImage}
            alt="Background"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover opacity-30 dark:opacity-20"
          />
        </div>
      </div>

      <div className="relative h-full flex items-center justify-center lg:p-8 bg-white dark:bg-zinc-900/95">
        <div className="w-full max-w-[480px] px-4 md:px-8">
          <div className="flex flex-col space-y-4 text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-2xl font-medium text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
} 