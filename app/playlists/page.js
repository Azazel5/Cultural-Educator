
// ==============================================
// app/playlists/page.js

'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PlusIcon, LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

export default function Playlists() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      fetchPlaylists()
    }
  }, [status, router])

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists')
      const data = await response.json()
      setPlaylists(data.playlists || [])
    } catch (error) {
      console.error('Error fetching playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Playlists</h1>
        <Link
          href="/playlists/create"
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Playlist
        </Link>
      </div>

      {playlists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <Link
              key={playlist._id}
              href={`/playlists/${playlist._id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {playlist.name}
                </h3>
                {playlist.isPublic ? (
                  <GlobeAltIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <LockClosedIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </div>
              
              {playlist.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {playlist.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{playlist.movies?.length || 0} movies</span>
                <span>{playlist.isPublic ? 'Public' : 'Private'}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No playlists yet</h3>
          <p className="text-gray-500 mb-6">Create your first playlist to organize your movies</p>
          <Link
            href="/playlists/create"
            className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700"
          >
            Create Your First Playlist
          </Link>
        </div>
      )}
    </div>
  )
}
