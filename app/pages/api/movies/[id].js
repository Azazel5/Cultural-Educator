
// ==============================================
// pages/api/movies/[id].js

import { tmdbApi } from '../../../lib/tmdb'
import dbConnect from '../../../lib/mongodb'
import Movie from '../../../models/Movie'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { id } = req.query
    
    await dbConnect()

    // Try to find in local database first
    let movie = await Movie.findOne({ tmdbId: parseInt(id) })

    if (!movie) {
      // Fetch from TMDB if not found locally
      const tmdbMovie = await tmdbApi.getMovie(id)
      
      if (tmdbMovie.id) {
        movie = new Movie({
          tmdbId: tmdbMovie.id,
          title: tmdbMovie.title,
          overview: tmdbMovie.overview,
          releaseDate: tmdbMovie.release_date,
          posterPath: tmdbMovie.poster_path,
          backdropPath: tmdbMovie.backdrop_path,
          genres: tmdbMovie.genres?.map(g => g.name) || [],
          runtime: tmdbMovie.runtime,
          rating: tmdbMovie.vote_average
        })
        await movie.save()
      } else {
        return res.status(404).json({ message: 'Movie not found' })
      }
    }

    res.status(200).json(movie)
  } catch (error) {
    console.error('Movie details error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}