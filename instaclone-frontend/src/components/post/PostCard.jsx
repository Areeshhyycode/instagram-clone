import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toggleLike, addComment, toggleSave } from '../../store/slices/postSlice'
import postService from '../../services/postService'
import { formatDistanceToNow } from '../../utils/dateUtils'

const PostCard = ({ post }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [commentText, setCommentText] = useState('')
  const [isLiking, setIsLiking] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showAllComments, setShowAllComments] = useState(false)

  // Check if current user liked this post
  const isLiked = post.likes?.some(
    (like) => like === user?._id || like._id === user?._id
  )

  // Check if current user saved this post
  const isSaved = post.isSaved || false

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)
    try {
      const response = await postService.toggleLike(post._id)
      dispatch(toggleLike({
        postId: post._id,
        liked: response.liked,
        likes: response.likes,
      }))
    } catch (error) {
      console.error('Like error:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const response = await postService.toggleSavePost(post._id)
      dispatch(toggleSave({
        postId: post._id,
        saved: response.saved,
      }))
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || isCommenting) return

    setIsCommenting(true)
    try {
      const newComment = await postService.addComment(post._id, commentText)
      dispatch(addComment({
        postId: post._id,
        comment: newComment,
      }))
      setCommentText('')
    } catch (error) {
      console.error('Comment error:', error)
    } finally {
      setIsCommenting(false)
    }
  }

  const displayComments = showAllComments
    ? post.comments
    : post.comments?.slice(-2)

  return (
    <article className="bg-white border border-[#DBDBDB] rounded-lg mb-4">
      {/* Header */}
      <header className="flex items-center justify-between p-3">
        <Link
          to={`/profile/${post.user?.username}`}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white p-[2px]">
              {post.user?.profilePicture ? (
                <img
                  src={post.user.profilePicture}
                  alt={post.user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
                  {post.user?.username?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <span className="font-semibold text-sm">{post.user?.username}</span>
        </Link>

        {/* More options */}
        <button className="p-2">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="6" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="18" r="2" />
          </svg>
        </button>
      </header>

      {/* Image */}
      <div className="relative aspect-square bg-black">
        <img
          src={`http://localhost:8000${post.image}`}
          alt={post.caption || 'Post'}
          className="w-full h-full object-contain"
          onDoubleClick={handleLike}
        />
      </div>

      {/* Action buttons */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            {/* Like button */}
            <button onClick={handleLike} disabled={isLiking}>
              {isLiked ? (
                <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>

            {/* Comment button */}
            <button>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>

            {/* Share button */}
            <button>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>

          {/* Save button */}
          <button onClick={handleSave} disabled={isSaving}>
            {isSaved ? (
              <svg className="w-6 h-6 text-black fill-current" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>
        </div>

        {/* Likes count */}
        <p className="font-semibold text-sm mb-1">
          {post.likes?.length || 0} likes
        </p>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm mb-1">
            <Link to={`/profile/${post.user?.username}`} className="font-semibold mr-1">
              {post.user?.username}
            </Link>
            {post.caption}
          </p>
        )}

        {/* View all comments */}
        {post.comments?.length > 2 && !showAllComments && (
          <button
            onClick={() => setShowAllComments(true)}
            className="text-sm text-gray-500 mb-1"
          >
            View all {post.comments.length} comments
          </button>
        )}

        {/* Comments */}
        <div className="space-y-1">
          {displayComments?.map((comment) => (
            <p key={comment._id} className="text-sm">
              <Link
                to={`/profile/${comment.user?.username}`}
                className="font-semibold mr-1"
              >
                {comment.user?.username}
              </Link>
              {comment.text}
            </p>
          ))}
        </div>

        {/* Timestamp */}
        <p className="text-[10px] text-gray-500 uppercase mt-2">
          {formatDistanceToNow(post.createdAt)}
        </p>
      </div>

      {/* Add comment */}
      <form
        onSubmit={handleComment}
        className="flex items-center border-t border-[#DBDBDB] px-3 py-2"
      >
        <button type="button" className="mr-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-1 outline-none text-sm"
        />
        <button
          type="submit"
          disabled={!commentText.trim() || isCommenting}
          className="text-[#0095F6] font-semibold text-sm disabled:opacity-50"
        >
          Post
        </button>
      </form>
    </article>
  )
}

export default PostCard
