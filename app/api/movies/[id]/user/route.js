
// ==============================================
// pages/api/movies/[id]/user.js

import { getSession } from 'next-auth/react'
import dbConnect from '@/lib/mongodb'
import UserMovie from '@/models/UserMovie'
import Movie from '@/models/Movie'

export async function GET(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getSession({ req })
    if (!session) {
      return res.status(200).json(null)
    }

    await dbConnect()

    const { id: tmdbId } = req.query

    const movie = await Movie.findOne({ tmdbId: parseInt(tmdbId) })
    if (!movie) {
      return res.status(200).json(null)
    }

    const userMovie = await UserMovie.findOne({
      userId: session.user.id,
      movieId: movie._id
    })

    res.status(200).json(userMovie)
  } catch (error) {
    console.error('User movie data error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}