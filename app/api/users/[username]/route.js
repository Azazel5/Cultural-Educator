// ==============================================
// app/api/users/[username]/route.js

import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(_, { params }) {
  try {
    const { username } = await params
    
    await dbConnect()

    const user = await User.findOne({ username })
      .select('-password') // Don't return password
    
    if (!user) {
      return Response.json(
        { message: 'User not found' }, 
        { status: 404 }
      )
    }

    // Return public profile info
    return Response.json({
      id: user._id,
      username: user.username,
      bio: user.bio,
      isPublic: user.isPublic,
      createdAt: user.createdAt
    })
  } catch (error) {
    console.error('User profile error:', error)
    return Response.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    )
  }
}