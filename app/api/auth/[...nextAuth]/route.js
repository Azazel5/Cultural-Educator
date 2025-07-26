// app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import User from '@/models/User'
import dbConnect from '@/lib/mongodb'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
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
              username: user.username,
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
        token.username = user.username
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
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }