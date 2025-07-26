// ==============================================
// app/page.js - Homepage

'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import MovieCard from '@/components/MovieCard'
import SearchBar from '@/components/SearchBar'
import Link from 'next/link'

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendingMovies()
  }, [])

  const fetchTrendingMovies = async () => {
    try {
      const response = await fetch('/api/movies/trending')
      const data = await response.json()
      setMovies(data.results || [])
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    router.push(`/movies/search?q=${encodeURIComponent(query)}`)
  }

  const handleTrackMovie = async (tmdbId, status) => {
    if (!session) {
      alert('Please login to track movies')
      return
    }

    try {
      await fetch(`/api/movies/${tmdbId}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
    } catch (error) {
      console.error('Error tracking movie:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Track Your Movies
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover, track, and share your favorite movies with friends.
          Create playlists and build your personal movie collection.
        </p>

        <div className="flex justify-center mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {!session && (
          <div className="space-x-4">
            <Link href="/auth/signup" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700">
              Get Started
            </Link>
            <Link href="/auth/login" className="text-primary-600 hover:text-primary-700">
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* Trending Movies */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending This Week</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <MovieCard
              key={movie.tmdbId}
              movie={movie}
              onTrack={handleTrackMovie}
              onRate={() => { }}
            />
          ))}
        </div>
      </section>
    </div>
  )
}