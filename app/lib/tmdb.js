
// app/lib/tmdb.js

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export const tmdbApi = {
  getTrendingMovies: async () => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
      )

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`)
      }

      const data = await response.json()  // Only call .json() once
      return data
    } catch (error) {
      console.error('TMDB getTrendingMovies error:', error)
      throw error
    }
  },

  searchMovies: async (query) => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
      )

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('TMDB searchMovies error:', error)
      throw error
    }
  },

  getMovie: async (id) => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
      )

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('TMDB getMovie error:', error)
      throw error
    }
  },

  getPopularMovies: async (page = 1) => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`
      )

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('TMDB getPopularMovies error:', error)
      throw error
    }
  }
}