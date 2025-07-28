
// ======================
// app/api/user/movies.js

import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import UserMovie from '../../../models/UserMovie'

export async function GET(request) {
  try {
    const session = await auth()

    if (!session) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    const { limit = 20, status } = await request.json()

    const query = { userId: session.user.id }
    if (status) {
      query.status = status
    }

    const userMovies = await UserMovie.find(query)
      .populate('movieId', 'tmdbId title posterPath rating')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))

    // Transform data to match frontend expectations
    const movies = userMovies.map(userMovie => ({
      ...userMovie.toObject(),
      movie: userMovie.movieId
    }))

    return Response.json({ movies })
  } catch (error) {
    console.error('User movies error:', error)

    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
