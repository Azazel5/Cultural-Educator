
// ==============================================
// pages/api/user/movies/batch.js

import { getSession } from 'next-auth/react'
import dbConnect from '../../../../lib/mongodb'
import UserMovie from '../../../../models/UserMovie'
import Movie from '../../../../models/Movie'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getSession({ req })
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await dbConnect()

    const { tmdbIds } = req.body

    if (!Array.isArray(tmdbIds)) {
      return res.status(400).json({ message: 'tmdbIds must be an array' })
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

    res.status(200).json({ userMovies: result })
  } catch (error) {
    console.error('Batch user movies error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
