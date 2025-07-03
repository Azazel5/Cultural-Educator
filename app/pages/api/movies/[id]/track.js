
// ==============================================
// pages/api/movies/[id]/track.js

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

    const { id: tmdbId } = req.query
    const { status, rating } = req.body

    // Find the movie
    const movie = await Movie.findOne({ tmdbId: parseInt(tmdbId) })
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' })
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

    res.status(200).json({ message: 'Movie tracking updated' })
  } catch (error) {
    console.error('Track movie error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}