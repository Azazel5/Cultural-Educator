
// ==============================================
// app/movies/search/page.js
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import MovieCard from '../../components/MovieCard'
import SearchBar from '../../components/SearchBar'

export default function SearchMovies() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [movies, setMovies] = useState([])
  const [userMovies, setUserMovies] = useState({})
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const searchQuery = searchParams.get('q')
    if (searchQuery) {
      setQuery(searchQuery)
      searchMovies(searchQuery)
    }
  }, [searchParams])

  const searchMovies = async (searchQuery) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/movies/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setMovies(data.results || [])

      if (session) {
        fetchUserMovies(data.results || [])
      }
    } catch (error) {
      console.error('Error searching movies:', error)
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

  const handleSearch = (newQuery) => {
    router.push(`/movies/search?q=${encodeURIComponent(newQuery)}`)
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Movies</h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      {query && (
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Searching...' : `Results for "${query}"`}
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : movies.length > 0 ? (
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
      ) : query && !loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No movies found for "{query}"</p>
        </div>
      ) : null}
    </div>
  )
}
