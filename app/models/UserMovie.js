
// ==============================================
// models/UserMovie.js

import mongoose from 'mongoose'

const UserMovieSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  status: {
    type: String,
    enum: ['watched', 'watchlist', 'watching'],
    required: true
  },
  userRating: {
    type: Number,
    min: 1,
    max: 10
  },
  watchedDate: Date,
  review: String
}, {
  timestamps: true
})

UserMovieSchema.index({ userId: 1, movieId: 1 }, { unique: true })

export default mongoose.models.UserMovie || mongoose.model('UserMovie', UserMovieSchema)