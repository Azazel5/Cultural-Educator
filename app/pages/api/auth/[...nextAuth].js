
// ==============================================
// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import dbConnect from '../../../lib/mongodb'
import User from '../../../models/User'

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        await dbConnect()
        
        const user = await User.findOne({ email: credentials.email })
        
        if (user && await user.comparePassword(credentials.password)) {
          return {
            id: user._id,
            email: user.email,
            username: user.username,
          }
        }
        return null
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
  }
})
