// app/api/movies/[id]/route.js
import { tmdbApi } from '@/lib/tmdb'
import dbConnect from '@/lib/mongodb'
import Movie from '@/models/Movie'

export async function GET(request, { params }) {
  try {
    const { id } = await params  // Await params before destructuring

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
        return Response.json({ message: 'Movie not found' }, { status: 404 })
      }
    }

    return Response.json(movie)
  } catch (error) {
    console.error('Movie details error:', error)
    return Response.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    )
  }
}