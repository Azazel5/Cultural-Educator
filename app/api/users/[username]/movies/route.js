// ========================================
// app/api/users/[username]/movies/route.js

import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import UserMovie from '@/models/UserMovie'

export async function GET(request, { params }) {
  try {
    const { username } = await params
    const session = await auth()
    
    await dbConnect()

    // Find the user
    const user = await User.findOne({ username })
    if (!user) {
      return Response.json(
        { message: 'User not found' }, 
        { status: 404 }
      )
    }

    // Check if profile is public or if it's the user's own profile
    const isOwnProfile = session?.user?.id === user._id.toString()
    if (!user.isPublic && !isOwnProfile) {
      return Response.json(
        { message: 'Profile is private' }, 
        { status: 403 }
      )
    }

    // Get user's movies
    const userMovies = await UserMovie.find({ userId: user._id })
      .populate('movieId', 'tmdbId title posterPath rating')
      .sort({ createdAt: -1 })

    // Transform data
    const movies = userMovies.map(userMovie => ({
      ...userMovie.toObject(),
      movie: userMovie.movieId
    }))

    // Calculate average rating
    const ratedMovies = userMovies.filter(m => m.userRating)
    const avgRating = ratedMovies.length > 0 
      ? ratedMovies.reduce((sum, m) => sum + m.userRating, 0) / ratedMovies.length 
      : 0

    return Response.json({ 
      movies, 
      avgRating,
      totalCount: movies.length
    })
  } catch (error) {
    console.error('User movies error:', error)
    return Response.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    )
  }
}