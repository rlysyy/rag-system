import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user = null

         if (!credentials?.email || !credentials?.password) {
          throw new Error('请输入邮箱和密码')
        }

        user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          throw new Error('用户不存�?)
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password || ''
        )

        if (!isValidPassword) {
          throw new Error('密码错误')
        }

        return { ...user, id: user.id.toString() }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id // 将用�?ID 写入 token
        token.email = user.email // 将用户邮箱写�?token
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string // �?token 中的用户 ID 写入 session
      session.user.email = token.email as string // �?token 中的用户邮箱写入 session
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
})
