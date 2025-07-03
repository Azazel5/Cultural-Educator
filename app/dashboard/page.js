
// ==============================================
// app/dashboard/page.js
'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import MovieCard from '../components/MovieCard'
import { FilmIcon, EyeIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    watched: 0,
    watchlist: 0,
    avgRating: 0
  })
  const [recentMovies, setRecentMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status, router])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, moviesResponse] = await Promise.all([
        fetch('/api/user/stats'),
        fetch('/api/user/movies?limit=6')
      ])

      const statsData = await statsResponse.json()
      const moviesData = await moviesResponse.json()

      setStats(statsData)
      setRecentMovies(moviesData.movies || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTrackMovie = async (tmdbId, status) => {
    try {
      await fetch(`/api/movies/${tmdbId}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      fetchDashboardData()
    } catch (error) {
      console.error('Error tracking movie:', error)
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {session.user.username}!
        </h1>
        <p className="text-gray-600">Here's your movie tracking summary</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <EyeIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Movies Watched</p>
              <p className="text-2xl font-bold text-gray-900">{stats.watched}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Watchlist</p>
              <p className="text-2xl font-bold text-gray-900">{stats.watchlist}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <StarIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.avgRating ? stats.avgRating.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Movies */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          <button
            onClick={() => router.push('/movies')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View All
          </button>
        </div>

        {recentMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentMovies.map((userMovie) => (
              <MovieCard
                key={userMovie.movie.tmdbId}
                movie={userMovie.movie}
                userMovie={userMovie}
                onTrack={handleTrackMovie}
                onRate={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <FilmIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No movies yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start tracking movies to see them here.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/movies')}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Browse Movies
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}