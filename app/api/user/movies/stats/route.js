
// =====================
// app/api/user/stats.js

import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import UserMovie from '../../../models/UserMovie'

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
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

    return Response.json({
      watched: watchedCount,
      watchlist: watchlistCount,
      avgRating: avgRating[0]?.avgRating || 0
    })
  } catch (error) {
    console.error('Stats error:', error)
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}