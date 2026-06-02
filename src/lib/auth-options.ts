import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUserFromSheet } from './google-sheets'

// Default hash of '123456' — only used on first login before user sets own password
const DEFAULT_HASH = '$2a$10$rUxzBjBUoehXMg0nMnP8guLi.PECDYHPM9B9ZuvJ8bGGqJLwNnq6i'

const USERS = [
  { id: 'nurshandi', name: 'Nurshandi', email: 'nurshandyd@gmail.com' },
  { id: 'lulu',      name: 'Lulu',      email: 'luluprimadita@gmail.com' },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = USERS.find(u => u.email === credentials.email)
        if (!user) return null

        const sheetUser = await getUserFromSheet(credentials.email)

        const hash = sheetUser?.passwordHash ?? DEFAULT_HASH
        const mustChangePassword = sheetUser ? sheetUser.mustChangePassword : true

        const valid = await bcrypt.compare(credentials.password, hash)
        if (!valid) return null

        return { id: user.id, name: user.name, email: user.email, mustChangePassword } as never
      },
    }),
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.mustChangePassword = (user as { mustChangePassword?: boolean }).mustChangePassword
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.name = token.name
        ;(session.user as { mustChangePassword?: boolean }).mustChangePassword = token.mustChangePassword as boolean | undefined
      }
      return session
    },
  },
}
