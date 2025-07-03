
// ==============================================
// models/Movie.js

import mongoose from 'mongoose'

const MovieSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  overview: String,
  releaseDate: Date,
  posterPath: String,
  backdropPath: String,
  genres: [String],
  runtime: Number,
  rating: Number,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

export default mongoose.models.Movie || mongoose.model('Movie', MovieSchema)
