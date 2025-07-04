
// ==============================================
// pages/api/movies/search.js

import { tmdbApi } from '../../../lib/tmdb'
import dbConnect from '../../../lib/mongodb'
import Movie from '../../../models/Movie'

export async function GET(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { q: query } = req.query

    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' })
    }

    // Search TMDB
    const tmdbResults = await tmdbApi.searchMovies(query)

    await dbConnect()

    // Cache movies in database
    const movies = []
    for (const tmdbMovie of tmdbResults.results) {
      let movie = await Movie.findOne({ tmdbId: tmdbMovie.id })

      if (!movie) {
        movie = new Movie({
          tmdbId: tmdbMovie.id,
          title: tmdbMovie.title,
          overview: tmdbMovie.overview,
          releaseDate: tmdbMovie.release_date,
          posterPath: tmdbMovie.poster_path,
          backdropPath: tmdbMovie.backdrop_path,
          genres: tmdbMovie.genre_ids, // You'd need to map these
          rating: tmdbMovie.vote_average
        })
        await movie.save()
      }

      movies.push(movie)
    }

    res.status(200).json({ results: movies })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}