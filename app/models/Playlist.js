
// ==============================================
// models/Playlist.js

import mongoose from 'mongoose'

const PlaylistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  movies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

export default mongoose.models.Playlist || mongoose.model('Playlist', PlaylistSchema)