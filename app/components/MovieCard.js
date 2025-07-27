// app/components/MovieCard.js
'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { StarIcon, EyeIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutline } from '@heroicons/react/24/outline'

const MovieCard = ({ movie, userMovie, onTrack, onRate, priority = false }) => {
  const isWatched = userMovie?.status === 'watched'
  const userRating = userMovie?.userRating

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/movies/${movie.tmdbId}`}>
        <div className="relative aspect-[2/3] cursor-pointer">
          <Image
            src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : '/placeholder-movie.jpg'}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover"
            priority={priority}
          />
          {isWatched && (
            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
              <EyeIcon className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
          {movie.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <StarIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-600">
              {movie.rating?.toFixed(1) || 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onTrack(movie.tmdbId, isWatched ? null : 'watched')}
              className={`p-1 rounded ${isWatched ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
            >
              <EyeIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => onRate(movie.tmdbId)}
              className="text-gray-400 hover:text-yellow-500"
            >
              {userRating ? (
                <StarIcon className="w-5 h-5 text-yellow-500" />
              ) : (
                <StarOutline className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        
        {userRating && (
          <div className="mt-2 text-sm text-gray-600">
            Your rating: {userRating}/10
          </div>
        )}
      </div>
    </div>
  )
}

export default MovieCard