// ===========================
// app/components/SearchBar.js

'use client'

import React, { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const SearchBar = ({ onSearch, placeholder = "Search movies..." }) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md flex">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      <button
        type="submit"
        className="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
      >
        Search
      </button>
    </form>
  )
}

export default SearchBar