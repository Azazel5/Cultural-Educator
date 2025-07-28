
// ========================
// app/api/movies/search.js

import { tmdbApi } from '@/lib/tmdb'
import dbConnect from '@/lib/mongodb'
import Movie from '@/models/Movie'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return Response.json(
        { message: 'Query parameter is required' },
        { status: 400 }
      )
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

    return Response.json({ results: movies })
  } catch (error) {
    console.error('Search error:', error)
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}