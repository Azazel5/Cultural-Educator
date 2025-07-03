// ==============================================
// app/components/AuthProvider.js - Client Component for Auth

'use client'

import { SessionProvider } from 'next-auth/react'

export function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}