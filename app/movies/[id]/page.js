// app/movies/[id]/page.js
'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'  // Import useParams
import Image from 'next/image'
import { StarIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutline, EyeIcon as EyeOutline } from '@heroicons/react/24/outline'

export default function MovieDetail() {
  const params = useParams()  // Get params using hook
  const id = params.id  // Extract id from params
  const { data: session } = useSession()
  const [movie, setMovie] = useState(null)
  const [userMovie, setUserMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)

  useEffect(() => {
    if (id) {
      fetchMovieDetails()
    }
  }, [id])

  const fetchMovieDetails = async () => {
    try {
      const [movieResponse, userMovieResponse] = await Promise.all([
        fetch(`/api/movies/${id}`),
        session ? fetch(`/api/movies/${id}/user`) : Promise.resolve({ json: () => null })
      ])

      const movieData = await movieResponse.json()
      const userMovieData = await userMovieResponse.json()

      setMovie(movieData)
      setUserMovie(userMovieData)
    } catch (error) {
      console.error('Error fetching movie details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTrackMovie = async (status) => {
    if (!session) {
      alert('Please login to track movies')
      return
    }

    try {
      await fetch(`/api/movies/${id}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      fetchMovieDetails()
    } catch (error) {
      console.error('Error tracking movie:', error)
    }
  }

  const handleRateMovie = async (rating) => {
    if (!session) {
      alert('Please login to rate movies')
      return
    }

    try {
      await fetch(`/api/movies/${id}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: userMovie?.status || 'watched',
          rating
        })
      })
      setShowRatingModal(false)
      fetchMovieDetails()
    } catch (error) {
      console.error('Error rating movie:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!movie) {
    return <div className="text-center py-8">Movie not found</div>
  }

  const isWatched = userMovie?.status === 'watched'
  const isInWatchlist = userMovie?.status === 'watchlist'

  return (
    <div>
      {/* Hero Section with Netflix-style gradient */}
      <div className="relative h-96 mb-8">
        {movie.backdropPath && (
          <Image
            src={`https://image.tmdb.org/t/p/w1280${movie.backdropPath}`}
            alt={movie.title}
            fill
            sizes="100vw"
            className="object-cover rounded-lg"
            priority
          />
        )}
        {/* Netflix-style gradient overlay - darker at bottom, transparent at top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-lg flex items-end">
          <div className="p-8 text-white">
            <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">{movie.title}</h1>
            <div className="flex items-center space-x-4">
              <span className="flex items-center drop-shadow-md">
                <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
                {movie.rating?.toFixed(1) || 'N/A'}
              </span>
              <span className="drop-shadow-md">{new Date(movie.releaseDate).getFullYear()}</span>
              {movie.runtime && <span className="drop-shadow-md">{movie.runtime} min</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Movie Poster */}
        <div>
          <div className="relative aspect-[2/3] mb-4">
            <Image
              src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : '/placeholder-movie.jpg'}
              alt={movie.title}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover rounded-lg"
            />
          </div>

          {/* Action Buttons */}
          {session && (
            <div className="space-y-3">
              <button
                onClick={() => handleTrackMovie(isWatched ? null : 'watched')}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-md ${isWatched
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-green-600 hover:text-white'
                  }`}
              >
                <EyeIcon className="w-5 h-5 mr-2" />
                {isWatched ? 'Watched' : 'Mark as Watched'}
              </button>

              <button
                onClick={() => handleTrackMovie(isInWatchlist ? null : 'watchlist')}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-md ${isInWatchlist
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white'
                  }`}
              >
                <ClockIcon className="w-5 h-5 mr-2" />
                {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </button>

              <button
                onClick={() => setShowRatingModal(true)}
                className="w-full flex items-center justify-center px-4 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600"
              >
                <StarIcon className="w-5 h-5 mr-2" />
                {userMovie?.userRating ? `Rated ${userMovie.userRating}/10` : 'Rate Movie'}
              </button>
            </div>
          )}
        </div>

        {/* Movie Details */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            {movie.overview || 'No overview available.'}
          </p>

          {movie.genres && movie.genres.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {userMovie?.review && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Your Review</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {userMovie.review}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Rate "{movie.title}"</h3>

            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className={`w-8 h-8 rounded ${selectedRating >= rating
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-yellow-400'
                    }`}
                >
                  {rating}
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRateMovie(selectedRating)}
                disabled={selectedRating === 0}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
              >
                Rate Movie
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}