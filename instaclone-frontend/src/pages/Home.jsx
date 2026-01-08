import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from '../components/layout/Sidebar'
import MobileBottomNav from '../components/layout/MobileBottomNav'
import Stories from '../components/stories/Stories'
import PostCard from '../components/post/PostCard'
import Suggestions from '../components/sidebar/Suggestions'
import CreatePostModal from '../components/post/CreatePostModal'
import {
  fetchPostsStart,
  fetchPostsSuccess,
  fetchPostsFailure,
} from '../store/slices/postSlice'
import postService from '../services/postService'

const Home = () => {
  const dispatch = useDispatch()
  const { posts, loading, error } = useSelector((state) => state.posts)
  const [showCreatePost, setShowCreatePost] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    dispatch(fetchPostsStart())
    try {
      const response = await postService.getFeed()
      dispatch(fetchPostsSuccess(response))
    } catch (err) {
      dispatch(fetchPostsFailure(err.message))
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-[50px] md:pb-0 pt-[50px] md:pt-0">
      {/* Sidebar */}
      <Sidebar onCreatePost={() => setShowCreatePost(true)} />

      {/* Mobile Navigation */}
      <MobileBottomNav onCreatePost={() => setShowCreatePost(true)} />

      {/* Main Content */}
      <main className="md:ml-[245px] flex justify-center">
        <div className="flex flex-col md:flex-row gap-0 md:gap-8 pt-0 md:pt-8 px-0 md:px-4 w-full md:w-auto">
          {/* Feed */}
          <div className="w-full md:w-[470px]">
            {/* Stories */}
            <Stories />

            {/* Posts */}
            {loading && posts.length === 0 ? (
              <div className="space-y-4">
                {/* Loading skeleton for posts */}
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white border border-[#DBDBDB] rounded-lg overflow-hidden animate-pulse">
                    {/* Header skeleton */}
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200" />
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-24" />
                      </div>
                    </div>
                    {/* Image skeleton */}
                    <div className="w-full aspect-square bg-gray-200" />
                    {/* Actions skeleton */}
                    <div className="p-3 space-y-2">
                      <div className="flex gap-4">
                        <div className="w-6 h-6 bg-gray-200 rounded" />
                        <div className="w-6 h-6 bg-gray-200 rounded" />
                        <div className="w-6 h-6 bg-gray-200 rounded" />
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-20" />
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white border border-[#DBDBDB] rounded-lg p-8 text-center">
                {/* Error state illustration */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-red-500 mb-2">{error}</p>
                <p className="text-gray-500 text-sm mb-4">Something went wrong while loading your feed</p>
                <button
                  onClick={fetchPosts}
                  className="bg-[#0095F6] hover:bg-[#1877F2] transition-colors text-white px-6 py-2 rounded-lg font-semibold text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white border border-[#DBDBDB] rounded-lg p-8 text-center">
                {/* Empty state illustration */}
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Welcome to Instagram Clone!</h2>
                <p className="text-[#8E8E8E] mb-4 max-w-xs mx-auto">
                  Follow people to see their photos and videos in your feed.
                </p>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="bg-[#0095F6] hover:bg-[#1877F2] transition-colors text-white px-6 py-2 rounded-lg font-semibold text-sm"
                >
                  Create Your First Post
                </button>
              </div>
            ) : (
              <div>
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar - Suggestions (Hidden on mobile) */}
          <div className="hidden lg:block">
            <Suggestions />
          </div>
        </div>
      </main>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
      />
    </div>
  )
}

export default Home
