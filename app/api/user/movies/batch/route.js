
// ============================
// app/api/user/movies/batch.js

import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import UserMovie from '@/models/UserMovie'
import Movie from '@/models/Movie'

export async function POST(request) {
  try {
    const session = await auth()

    if (!session) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    const { tmdbIds } = await request.json()

    if (!Array.isArray(tmdbIds)) {
      return Response.json(
        { message: 'tmdbIds must be an array' },
        { status: 400 }
      )
    }

    // Find movies
    const movies = await Movie.find({ tmdbId: { $in: tmdbIds } })
    const movieIdMap = {}
    movies.forEach(movie => {
      movieIdMap[movie.tmdbId] = movie._id
    })

    // Find user movies
    const movieIds = Object.values(movieIdMap)
    const userMovies = await UserMovie.find({
      userId: session.user.id,
      movieId: { $in: movieIds }
    }).populate('movieId', 'tmdbId title posterPath rating')

    // Transform data
    const result = userMovies.map(userMovie => ({
      ...userMovie.toObject(),
      movie: userMovie.movieId
    }))

    return Response.json(
      { userMovies: result }
    )
  } catch (error) {
    console.error('Batch user movies error:', error)
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
