import { useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import CreatePostModal from '../components/post/CreatePostModal'
import postService from '../services/postService'

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    setHasSearched(true)
    try {
      const response = await postService.searchPosts(searchQuery)
      setSearchResults(response.posts)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }

  const handleHashtagSearch = async (hashtag) => {
    setSearchQuery(hashtag)
    setSearching(true)
    setHasSearched(true)
    try {
      const response = await postService.getPostsByHashtag(hashtag.replace('#', ''))
      setSearchResults(response.posts)
    } catch (err) {
      console.error('Hashtag search error:', err)
    } finally {
      setSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setHasSearched(false)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar onCreatePost={() => setShowCreatePost(true)} />

      <main className="ml-[245px]">
        <div className="max-w-[935px] mx-auto px-5 py-8">
          {/* Search Bar */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search posts, hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-gray-100 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-300"
              />
              <svg
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </form>
          </div>

          {/* Search Results Header */}
          {searchResults.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">
                Results for "{searchQuery}" ({searchResults.length})
              </h2>
              <button
                onClick={clearSearch}
                className="text-[#0095F6] text-sm font-semibold"
              >
                Clear
              </button>
            </div>
          )}

          {/* Content */}
          {searching ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : !hasSearched ? (
            <div className="py-16 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h2 className="text-xl font-semibold mb-2">Search</h2>
              <p className="text-gray-500">Search for posts, hashtags, and more.</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-16 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p className="text-gray-500">Try searching for something else.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {searchResults.map((post) => (
                <Link
                  key={post._id}
                  to={`/p/${post._id}`}
                  className="aspect-square bg-gray-100 relative group"
                >
                  <img
                    src={`http://localhost:8000${post.image}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-semibold">
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      {post.likesCount || 0}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
                      </svg>
                      {post.commentsCount || 0}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
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