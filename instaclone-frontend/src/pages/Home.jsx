import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from '../components/layout/Sidebar'
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
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Sidebar */}
      <Sidebar onCreatePost={() => setShowCreatePost(true)} />

      {/* Main Content */}
      <main className="ml-[245px] flex justify-center">
        <div className="flex gap-8 pt-8 px-4">
          {/* Feed */}
          <div className="w-[470px]">
            {/* Stories */}
            <Stories />

            {/* Posts */}
            {loading && posts.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="bg-white border border-[#DBDBDB] rounded-lg p-8 text-center">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={fetchPosts}
                  className="mt-4 text-[#0095F6] font-semibold"
                >
                  Try again
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white border border-[#DBDBDB] rounded-lg p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">Welcome to Instagram Clone!</h2>
                <p className="text-[#8E8E8E] mb-4">
                  No posts yet. Create your first post or follow people to see their posts.
                </p>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="bg-[#0095F6] text-white px-6 py-2 rounded-lg font-semibold text-sm"
                >
                  Create Post
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

          {/* Right Sidebar - Suggestions */}
          <Suggestions />
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
