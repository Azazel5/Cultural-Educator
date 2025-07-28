
// ==============================================
// app/api/movies/[id]/track.js

import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import UserMovie from '@/models/UserMovie'
import Movie from '@/models/Movie'


export async function POST(request, { params }) {
  try {
    const session = await auth()

    if (!session) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    const { id: tmdbId } = await params
    const { status, rating } = await request.json()

    // Find the movie
    const movie = await Movie.findOne({ tmdbId: parseInt(tmdbId) })

    if (!movie) {
      return Response.json(
        { message: 'Movie not found' },
        { status: 404 }
      )
    }

    if (status === null) {
      // Remove tracking
      await UserMovie.findOneAndDelete({
        userId: session.user.id,
        movieId: movie._id
      })
    } else {
      // Add or update tracking
      const updateData = {
        status,
        ...(rating && { userRating: rating }),
        ...(status === 'watched' && { watchedDate: new Date() })
      }

      await UserMovie.findOneAndUpdate(
        { userId: session.user.id, movieId: movie._id },
        updateData,
        { upsert: true, new: true }
      )
    }

    return Response.json(
      { message: 'Movie tracking updated' },
    )
  } catch (error) {
    console.error('Track movie error:', error)
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}