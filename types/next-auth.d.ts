import 'next-auth'

declare module 'next-auth' {
  interface User {
    role: 'USER' | 'ADMIN'
  }
  
  interface Session {
    user: User
  }
} 