// app/api/movies/trending/route.js

import { tmdbApi } from '@/lib/tmdb'
import dbConnect from '@/lib/mongodb'
import Movie from '@/models/Movie'

export async function GET() {
  try {
    console.log("Trending API called - App Router version")
    const tmdbResults = await tmdbApi.getTrendingMovies()

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
          rating: tmdbMovie.vote_average
        })
        await movie.save()
      }

      movies.push(movie)
    }

    return Response.json({ results: movies })
  } catch (error) {
    console.error('Trending movies error:', error)
    return Response.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    )
  }
}