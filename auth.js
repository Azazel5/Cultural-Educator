// ======================
// auth.js (project root)

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          await dbConnect()
          
          const user = await User.findOne({ email: credentials.email })
          
          if (user && await user.comparePassword(credentials.password)) {
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.username,
            }
          }
          
          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.name
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub
      session.user.username = token.username
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
  },
})