// app/layout.js

import './globals.css'
import Navigation from './components/Navigation'
import { AuthProvider } from './components/AuthProvider'

export const metadata = {
  title: 'MovieTracker - Track Your Favorite Movies',
  description: 'Discover, track, and share your favorite movies with friends',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}