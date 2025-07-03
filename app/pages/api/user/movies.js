
// ==============================================
// pages/api/user/movies.js

import { getSession } from 'next-auth/react'
import dbConnect from '../../../lib/mongodb'
import UserMovie from '../../../models/UserMovie'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getSession({ req })
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await dbConnect()

    const { limit = 20, status } = req.query
    
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

    res.status(200).json({ movies })
  } catch (error) {
    console.error('User movies error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
