// ===================================================
// app/components/Navigation.js - Navigation Component

'use client'

import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { FilmIcon } from '@heroicons/react/24/outline'

export default function Navigation() {
  const { data: session, status } = useSession()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <FilmIcon className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">MovieTracker</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="animate-pulse">Loading...</div>
            ) : session ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-primary-600">
                  Dashboard
                </Link>
                <Link href="/movies" className="text-gray-700 hover:text-primary-600">
                  Movies
                </Link>
                <Link href="/playlists" className="text-gray-700 hover:text-primary-600">
                  Playlists
                </Link>
                <Link href={`/profile/${session.user.username}`} className="text-gray-700 hover:text-primary-600">
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-700 hover:text-primary-600">
                  Login
                </Link>
                <Link href="/auth/signup" className="text-gray-700 hover:text-primary-600">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
