import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import MobileBottomNav from '../components/layout/MobileBottomNav'
import CreatePostModal from '../components/post/CreatePostModal'
import userService from '../services/userService'
import DefaultAvatar from '../components/common/DefaultAvatar'

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [userResults, setUserResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [isFocused, setIsFocused] = useState(false)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Debounced search - searches as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setUserResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const response = await userService.searchUsers(searchQuery)
        setUserResults(response.users || [])
      } catch (err) {
        console.error('Search error:', err)
        setUserResults([])
      } finally {
        setSearching(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [searchQuery])

  const clearSearch = () => {
    setSearchQuery('')
    setUserResults([])
  }

  const handleUserClick = (user) => {
    // Add to recent searches
    const updated = [user, ...recentSearches.filter(u => u._id !== user._id)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const removeFromRecent = (e, userId) => {
    e.preventDefault()
    e.stopPropagation()
    const updated = recentSearches.filter(u => u._id !== userId)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const clearAllRecent = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  return (
    <div className="min-h-screen bg-white md:bg-[#FAFAFA] pb-[60px] md:pb-0">
      <Sidebar onCreatePost={() => setShowCreatePost(true)} />
      <MobileBottomNav onCreatePost={() => setShowCreatePost(true)} />

      <main className="md:ml-[245px]">
        <div className="max-w-[600px] mx-auto">
          {/* Mobile Header with Search */}
          <div className="sticky top-0 bg-white z-20 border-b md:border-none">
            <div className="px-4 py-3 md:py-6">
              <h1 className="hidden md:block text-2xl font-semibold mb-6">Search</h1>

              {/* Search Input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  className="w-full bg-[#EFEFEF] rounded-lg py-2 md:py-2.5 pl-10 pr-10 text-sm focus:outline-none placeholder-gray-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-400 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 md:px-0">
            {/* Loading */}
            {searching && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
              </div>
            )}

            {/* Search Results */}
            {!searching && searchQuery && userResults.length > 0 && (
              <div className="py-2">
                {userResults.map((user) => (
                  <Link
                    key={user._id}
                    to={`/profile/${user.username}`}
                    onClick={() => handleUserClick(user)}
                    className="flex items-center gap-3 py-2 md:py-3 px-2 md:px-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden flex-shrink-0">
                      {user.profilePic && user.profilePic.startsWith('/uploads/') ? (
                        <img
                          src={`http://localhost:8000${user.profilePic}`}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <DefaultAvatar size="lg" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{user.username}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.fullName || user.username}
                        {user.followersCount > 0 && ` • ${user.followersCount} followers`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* No Results */}
            {!searching && searchQuery && userResults.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-500 text-sm">No results found.</p>
              </div>
            )}

            {/* Recent Searches - Show when not searching */}
            {!searchQuery && recentSearches.length > 0 && (
              <div className="py-2">
                <div className="flex items-center justify-between px-2 md:px-4 mb-2">
                  <h2 className="font-semibold text-base">Recent</h2>
                  <button
                    onClick={clearAllRecent}
                    className="text-[#0095F6] text-sm font-semibold hover:text-[#1877F2]"
                  >
                    Clear all
                  </button>
                </div>
                {recentSearches.map((user) => (
                  <Link
                    key={user._id}
                    to={`/profile/${user.username}`}
                    className="flex items-center gap-3 py-2 md:py-3 px-2 md:px-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden flex-shrink-0">
                      {user.profilePic && user.profilePic.startsWith('/uploads/') ? (
                        <img
                          src={`http://localhost:8000${user.profilePic}`}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <DefaultAvatar size="lg" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{user.username}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.fullName || user.username}
                      </p>
                    </div>
                    <button
                      onClick={(e) => removeFromRecent(e, user._id)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </Link>
                ))}
              </div>
            )}

            {/* Empty State - No recent searches */}
            {!searchQuery && recentSearches.length === 0 && (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-black flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Search for people</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
      />
    </div>
  )
}

export default Search
