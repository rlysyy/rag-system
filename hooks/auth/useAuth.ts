import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type Role = 'USER' | 'ADMIN'

export function useAuth(requiredRole?: Role) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (requiredRole && session.user.role !== requiredRole) {
      router.push('/')
    }
  }, [session, status, requiredRole, router])

  return { session, status }
} 