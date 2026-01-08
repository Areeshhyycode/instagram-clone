import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import MobileBottomNav from '../components/layout/MobileBottomNav'
import CreatePostModal from '../components/post/CreatePostModal'
import postService from '../services/postService'
import userService from '../services/userService'

const Explore = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [userResults, setUserResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [trendingHashtags, setTrendingHashtags] = useState([])
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [activeTab, setActiveTab] = useState('trending') // trending | random
  const [searchType, setSearchType] = useState('all') // all | posts | users

  useEffect(() => {
    fetchExplorePosts()
  }, [activeTab])

  const fetchExplorePosts = async () => {
    setLoading(true)
    try {
      const response = await postService.getExplorePosts(activeTab)
      setPosts(response.posts)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrendingHashtags = async () => {
    try {
      const response = await postService.getTrendingHashtags()
      setTrendingHashtags(response.hashtags)
    } catch (err) {
      console.error('Error fetching hashtags:', err)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      // Search both posts and users
      const [postsRes, usersRes] = await Promise.all([
        postService.searchPosts(searchQuery),
        userService.searchUsers(searchQuery)
      ])
      setSearchResults(postsRes.posts || [])
      setUserResults(usersRes.users || [])
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearching(false)
    }
  }

  const handleHashtagClick = async (hashtag) => {
    setSearchQuery(hashtag)
    setSearching(true)
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
    setUserResults([])
    setSearchType('all')
  }

  const displayPosts = searchResults.length > 0 ? searchResults : posts
  const hasSearchResults = searchResults.length > 0 || userResults.length > 0

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-[50px] md:pb-0 pt-[50px] md:pt-0">
      <Sidebar onCreatePost={() => setShowCreatePost(true)} />
      <MobileBottomNav onCreatePost={() => setShowCreatePost(true)} />

      <main className="md:ml-[245px]">
        <div className="max-w-[935px] mx-auto px-4 md:px-5 py-4 md:py-8">
          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                activeTab === 'trending'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveTab('random')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                activeTab === 'random'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Discover
            </button>
          </div>

          {/* Trending Hashtags */}
          {trendingHashtags.length > 0 && !searchResults.length && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Trending</h3>
              <div className="flex flex-wrap gap-2">
                {trendingHashtags.map((tag) => (
                  <button
                    key={tag.hashtag}
                    onClick={() => handleHashtagClick(tag.hashtag)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
                  >
                    {tag.hashtag}
                    <span className="text-gray-400 ml-1">{tag.postCount}</span>
                  </button>
                ))}
              </div>
            </div>
          )}


          {/* Search Results Header */}
          {hasSearchResults && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">
                  Results for "{searchQuery}"
                </h2>
                <button
                  onClick={clearSearch}
                  className="text-[#0095F6] text-sm font-semibold"
                >
                  Clear
                </button>
              </div>
              {/* Search Type Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setSearchType('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    searchType === 'all' ? 'bg-black text-white' : 'bg-gray-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSearchType('users')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    searchType === 'users' ? 'bg-black text-white' : 'bg-gray-100'
                  }`}
                >
                  Users ({userResults.length})
                </button>
                <button
                  onClick={() => setSearchType('posts')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    searchType === 'posts' ? 'bg-black text-white' : 'bg-gray-100'
                  }`}
                >
                  Posts ({searchResults.length})
                </button>
              </div>
            </div>
          )}

          {/* User Results */}
          {hasSearchResults && (searchType === 'all' || searchType === 'users') && userResults.length > 0 && (
            <div className="mb-6">
              {searchType === 'all' && <h3 className="font-semibold mb-3">Users</h3>}
              <div className="bg-white border border-[#DBDBDB] rounded-lg divide-y">
                {userResults.slice(0, searchType === 'all' ? 5 : undefined).map((user) => (
                  <Link
                    key={user._id}
                    to={`/profile/${user.username}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50"
                  >
                    <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden">
                      {user.profilePic ? (
                        <img
                          src={`http://localhost:8000${user.profilePic}`}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-gray-400">
                          {user.username?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{user.username}</p>
                      {user.bio && (
                        <p className="text-sm text-gray-500 truncate">{user.bio}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{user.followersCount} followers</span>
                  </Link>
                ))}
              </div>
              {searchType === 'all' && userResults.length > 5 && (
                <button
                  onClick={() => setSearchType('users')}
                  className="text-[#0095F6] text-sm font-semibold mt-2"
                >
                  See all users
                </button>
              )}
            </div>
          )}

          {/* Posts Header for search */}
          {hasSearchResults && (searchType === 'all' || searchType === 'posts') && searchResults.length > 0 && searchType === 'all' && (
            <h3 className="font-semibold mb-3">Posts</h3>
          )}

          {/* Posts Grid */}
          {(searchType !== 'users') && (
            <>
              {loading || searching ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : error ? (
                <div className="py-16 text-center">
                  <p className="text-red-500">{error}</p>
                  <button
                    onClick={fetchExplorePosts}
                    className="mt-4 text-[#0095F6] font-semibold"
                  >
                    Try again
                  </button>
                </div>
              ) : displayPosts.length === 0 ? (
                <div className="py-16 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h2 className="text-xl font-semibold mb-2">No posts found</h2>
                  <p className="text-gray-500">Try searching for something else.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-0.5 md:gap-1">
                  {displayPosts.map((post) => (
                    <Link
                      key={post._id}
                      to={`/profile/${post.user?.username || post.user}`}
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
            </>
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

export default Explore
