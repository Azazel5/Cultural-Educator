// ==========================
// app/api/playlists/route.js

import { auth } from '@/auth'
import dbConnect from '@/lib/mongodb'
import Playlist from '@/models/Playlist'

export async function GET() {
  const session = await auth()
  
  if (!session) {
    return Response.json(
      { message: 'Unauthorized' }, 
      { status: 401 }
    )
  }

  await dbConnect()
  
  const playlists = await Playlist.find({ userId: session.user.id })
    .populate('movies', 'title posterPath')
    .sort({ createdAt: -1 })
  
  return Response.json({ playlists })
}

export async function POST(request) {
  const session = await auth()
  
  if (!session) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { name, description, isPublic } = await request.json()

  if (!name) {
    return Response.json({ message: 'Playlist name is required' }, { status: 400 })
  }

  await dbConnect()

  const playlist = new Playlist({
    userId: session.user.id,
    name,
    description,
    isPublic: isPublic || false,
    movies: []
  })

  await playlist.save()
  return Response.json({ playlist }, { status: 201 })
}