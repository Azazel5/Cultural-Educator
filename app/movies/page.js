// =================================================
// app/movies/page.js - Movies Browse/Discovery Page

'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import MovieCard from '../components/MovieCard'
import SearchBar from '../components/SearchBar'
import { useRouter } from 'next/navigation'

export default function MoviesPage() {
  const { data: session, _ } = useSession()
  const router = useRouter()
  const [movies, setMovies] = useState([])
  const [userMovies, setUserMovies] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('trending')

  useEffect(() => {
    fetchMovies()
  }, [activeTab, session])

  const fetchMovies = async () => {
    setLoading(true)
    try {
      const endpoint = activeTab === 'trending' ? '/api/movies/trending' : '/api/movies/popular'
      const response = await fetch(endpoint)
      const data = await response.json()
      setMovies(data.results || [])

      // Fetch user data for movies if logged in
      if (session && data.results?.length) {
        fetchUserMovies(data.results)
      }
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserMovies = async (movieList) => {
    try {
      const tmdbIds = movieList.map(movie => movie.tmdbId)
      const response = await fetch('/api/user/movies/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbIds })
      })
      const data = await response.json()
      
      const userMovieMap = {}
      data.userMovies?.forEach(userMovie => {
        userMovieMap[userMovie.movie.tmdbId] = userMovie
      })
      setUserMovies(userMovieMap)
    } catch (error) {
      console.error('Error fetching user movies:', error)
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
      
      // Update local state
      if (status === null) {
        setUserMovies(prev => {
          const updated = { ...prev }
          delete updated[tmdbId]
          return updated
        })
      } else {
        setUserMovies(prev => ({
          ...prev,
          [tmdbId]: { status, movie: { tmdbId } }
        }))
      }
    } catch (error) {
      console.error('Error tracking movie:', error)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Discover Movies</h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8">
        <button
          onClick={() => setActiveTab('trending')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === 'trending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Trending
        </button>
        <button
          onClick={() => setActiveTab('popular')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === 'popular'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Popular
        </button>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <MovieCard
              key={movie.tmdbId}
              movie={movie}
              userMovie={userMovies[movie.tmdbId]}
              onTrack={handleTrackMovie}
              onRate={() => {}}
            />
          ))}
        </div>
      )}

      {movies.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No movies found</p>
        </div>
      )}
    </div>
  )
}