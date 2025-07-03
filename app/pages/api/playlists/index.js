
// ==============================================
// pages/api/playlists/index.js

import { getSession } from 'next-auth/react'
import dbConnect from '../../../lib/mongodb'
import Playlist from '../../../models/Playlist'

export default async function handler(req, res) {
  const session = await getSession({ req })
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  await dbConnect()

  switch (req.method) {
    case 'GET':
      try {
        const playlists = await Playlist.find({ userId: session.user.id })
          .populate('movies', 'title posterPath')
          .sort({ createdAt: -1 })
        
        res.status(200).json({ playlists })
      } catch (error) {
        console.error('Get playlists error:', error)
        res.status(500).json({ message: 'Internal server error' })
      }
      break

    case 'POST':
      try {
        const { name, description, isPublic } = req.body

        if (!name) {
          return res.status(400).json({ message: 'Playlist name is required' })
        }

        const playlist = new Playlist({
          userId: session.user.id,
          name,
          description,
          isPublic: isPublic || false,
          movies: []
        })

        await playlist.save()
        res.status(201).json({ playlist })
      } catch (error) {
        console.error('Create playlist error:', error)
        res.status(500).json({ message: 'Internal server error' })
      }
      break

    default:
      res.status(405).json({ message: 'Method not allowed' })
  }
}