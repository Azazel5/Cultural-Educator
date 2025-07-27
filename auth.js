// auth.js (create this file in your project root)
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // For now, return mock user to test
        if (credentials.email === 'test@test.com' && credentials.password === 'password') {
          return {
            id: '1',
            email: 'test@test.com',
            name: 'Test User',
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
  },
})