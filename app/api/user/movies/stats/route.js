
// ==============================================
// pages/api/user/stats.js

import { getSession } from 'next-auth/react'
import dbConnect from '../../../lib/mongodb'
import UserMovie from '../../../models/UserMovie'

export async function GET(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getSession({ req })
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await dbConnect()

    const [watchedCount, watchlistCount, avgRating] = await Promise.all([
      UserMovie.countDocuments({ userId: session.user.id, status: 'watched' }),
      UserMovie.countDocuments({ userId: session.user.id, status: 'watchlist' }),
      UserMovie.aggregate([
        { $match: { userId: session.user.id, userRating: { $exists: true } } },
        { $group: { _id: null, avgRating: { $avg: '$userRating' } } }
      ])
    ])

    res.status(200).json({
      watched: watchedCount,
      watchlist: watchlistCount,
      avgRating: avgRating[0]?.avgRating || 0
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}