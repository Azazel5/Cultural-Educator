// ==============================================
// app/profile/[username]/page.js - User Profile Page

'use client'

import { useSession } from 'next-auth/react'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import MovieCard from '../../components/MovieCard'
import { UserIcon, EyeIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
    const params = useParams()
    const username = params.username
    const { data: session, _ } = useSession()
    const [profile, setProfile] = useState(null)
    const [movies, setMovies] = useState([])
    const [playlists, setPlaylists] = useState([])
    const [stats, setStats] = useState({ watched: 0, avgRating: 0, playlists: 0 })
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('watched')

    useEffect(() => {
        if (username) {
            fetchProfile()
        }
    }, [username])

    const fetchProfile = async () => {
        setLoading(true)
        try {
            // Fetch user profile
            const profileResponse = await fetch(`/api/users/${username}`)
            if (!profileResponse.ok) {
                throw new Error('User not found')
            }
            const profileData = await profileResponse.json()
            setProfile(profileData)

            // Fetch user's movies and playlists if profile is public
            if (profileData.isPublic || session?.user?.username === username) {
                const [moviesResponse, playlistsResponse] = await Promise.all([
                    fetch(`/api/users/${username}/movies`),
                    fetch(`/api/users/${username}/playlists`)
                ])

                if (moviesResponse.ok) {
                    const moviesData = await moviesResponse.json()
                    setMovies(moviesData.movies || [])
                    setStats({
                        watched: moviesData.movies?.filter(m => m.status === 'watched').length || 0,
                        avgRating: moviesData.avgRating || 0,
                        playlists: moviesData.playlistCount || 0
                    })
                }

                if (playlistsResponse.ok) {
                    const playlistsData = await playlistsResponse.json()
                    setPlaylists(playlistsData.playlists || [])
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">User not found</h3>
                <p className="mt-1 text-sm text-gray-500">
                    The user you're looking for doesn't exist.
                </p>
            </div>
        )
    }

    if (!profile.isPublic && session?.user?.username !== username) {
        return (
            <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Private Profile</h3>
                <p className="mt-1 text-sm text-gray-500">
                    This user's profile is private.
                </p>
            </div>
        )
    }

    const watchedMovies = movies.filter(m => m.status === 'watched')
    const watchlistMovies = movies.filter(m => m.status === 'watchlist')

    return (
        <div>
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-start space-x-6">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-10 h-10 text-white" />
                    </div>

                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
                        {profile.bio && (
                            <p className="text-gray-600 mt-2">{profile.bio}</p>
                        )}

                        {/* Stats */}
                        <div className="flex space-x-6 mt-4">
                            <div className="text-center">
                                <div className="flex items-center justify-center space-x-1">
                                    <EyeIcon className="w-4 h-4 text-green-500" />
                                    <span className="text-lg font-semibold">{stats.watched}</span>
                                </div>
                                <span className="text-sm text-gray-500">Watched</span>
                            </div>

                            <div className="text-center">
                                <div className="flex items-center justify-center space-x-1">
                                    <StarIcon className="w-4 h-4 text-yellow-500" />
                                    <span className="text-lg font-semibold">
                                        {stats.avgRating ? stats.avgRating.toFixed(1) : 'N/A'}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-500">Avg Rating</span>
                            </div>

                            <div className="text-center">
                                <div className="flex items-center justify-center space-x-1">
                                    <ClockIcon className="w-4 h-4 text-blue-500" />
                                    <span className="text-lg font-semibold">{playlists.length}</span>
                                </div>
                                <span className="text-sm text-gray-500">Playlists</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6">
                <button
                    onClick={() => setActiveTab('watched')}
                    className={`px-4 py-2 rounded-md font-medium ${activeTab === 'watched'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Watched ({watchedMovies.length})
                </button>
                <button
                    onClick={() => setActiveTab('watchlist')}
                    className={`px-4 py-2 rounded-md font-medium ${activeTab === 'watchlist'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Watchlist ({watchlistMovies.length})
                </button>
                <button
                    onClick={() => setActiveTab('playlists')}
                    className={`px-4 py-2 rounded-md font-medium ${activeTab === 'playlists'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Playlists ({playlists.length})
                </button>
            </div>

            {/* Content */}
            {activeTab === 'watched' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {watchedMovies.map((userMovie) => (
                        <MovieCard
                            key={userMovie.movie.tmdbId}
                            movie={userMovie.movie}
                            userMovie={userMovie}
                            onTrack={() => { }}
                            onRate={() => { }}
                        />
                    ))}
                </div>
            )}

            {activeTab === 'watchlist' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {watchlistMovies.map((userMovie) => (
                        <MovieCard
                            key={userMovie.movie.tmdbId}
                            movie={userMovie.movie}
                            userMovie={userMovie}
                            onTrack={() => { }}
                            onRate={() => { }}
                        />
                    ))}
                </div>
            )}

            {activeTab === 'playlists' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {playlists.map((playlist) => (
                        <div key={playlist._id} className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {playlist.name}
                            </h3>
                            {playlist.description && (
                                <p className="text-gray-600 text-sm mb-4">{playlist.description}</p>
                            )}
                            <div className="text-sm text-gray-500">
                                {playlist.movies?.length || 0} movies
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty States */}
            {activeTab === 'watched' && watchedMovies.length === 0 && (
                <div className="text-center py-12">
                    <EyeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No watched movies</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {session?.user?.username === username
                            ? "You haven't watched any movies yet."
                            : "This user hasn't watched any movies yet."}
                    </p>
                </div>
            )}

            {activeTab === 'watchlist' && watchlistMovies.length === 0 && (
                <div className="text-center py-12">
                    <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No watchlist items</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {session?.user?.username === username
                            ? "Your watchlist is empty."
                            : "This user's watchlist is empty."}
                    </p>
                </div>
            )}

            {activeTab === 'playlists' && playlists.length === 0 && (
                <div className="text-center py-12">
                    <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No playlists</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {session?.user?.username === username
                            ? "You haven't created any playlists yet."
                            : "This user hasn't created any playlists yet."}
                    </p>
                </div>
            )}
        </div>
    )
}