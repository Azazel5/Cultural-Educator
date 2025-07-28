
// =============================
// app/api/movies/[id]/user.js

import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import UserMovie from '@/models/UserMovie'
import Movie from '@/models/Movie'

export async function GET(_, { params }) {
  try {
    const session = await auth()

    if (!session) {
      return Response.json(null)
    }

    await dbConnect()

    const { id: tmdbId } = await params

    const movie = await Movie.findOne({ tmdbId: parseInt(tmdbId) })
    if (!movie) {
      return Response.json(null)
    }

    const userMovie = await UserMovie.findOne({
      userId: session.user.id,
      movieId: movie._id
    })

    return Response.json(userMovie)
  } catch (error) {
    console.error('User movie data error:', error)

    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}