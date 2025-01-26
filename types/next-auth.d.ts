import 'next-auth'

export type Role = 'USER' | 'ADMIN'

declare module 'next-auth' {
  interface User {
    role: Role
  }
  
  interface Session {
    user: User
  }

  interface JWT {
    role?: Role
  }
} 