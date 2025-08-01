// ==============================================
// app/api/users/[username]/playlists/route.js

import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Playlist from '@/models/Playlist'

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

    // Get user's playlists
    const query = { userId: user._id }
    
    // If not own profile, only show public playlists
    if (!isOwnProfile) {
      query.isPublic = true
    }

    const playlists = await Playlist.find(query)
      .populate('movies', 'title posterPath')
      .sort({ createdAt: -1 })

    return Response.json({ playlists })
  } catch (error) {
    console.error('User playlists error:', error)
    return Response.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
