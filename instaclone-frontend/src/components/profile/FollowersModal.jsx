import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchFollowersStart,
  fetchFollowersSuccess,
  fetchFollowingStart,
  fetchFollowingSuccess,
  followUserSuccess,
  unfollowUserSuccess,
} from '../../store/slices/userSlice'
import userService from '../../services/userService'
import DefaultAvatar from '../common/DefaultAvatar'

const FollowersModal = ({ isOpen, onClose, userId, type, title }) => {
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)
  const { followers, following, followersLoading, followingLoading } = useSelector((state) => state.user)

  const [followLoadingIds, setFollowLoadingIds] = useState([])

  const users = type === 'followers' ? followers : following
  const loading = type === 'followers' ? followersLoading : followingLoading

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers()
    }
  }, [isOpen, userId, type])

  const fetchUsers = async () => {
    try {
      if (type === 'followers') {
        dispatch(fetchFollowersStart())
        const data = await userService.getFollowers(userId)
        dispatch(fetchFollowersSuccess(data))
      } else {
        dispatch(fetchFollowingStart())
        const data = await userService.getFollowing(userId)
        dispatch(fetchFollowingSuccess(data))
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleFollow = async (user) => {
    if (followLoadingIds.includes(user._id)) return

    setFollowLoadingIds([...followLoadingIds, user._id])
    try {
      if (user.isFollowing) {
        const response = await userService.unfollowUser(user._id)
        dispatch(unfollowUserSuccess({
          userId: user._id,
          followersCount: response.followersCount,
        }))
        // Update local state
        user.isFollowing = false
      } else {
        const response = await userService.followUser(user._id)
        dispatch(followUserSuccess({
          userId: user._id,
          followersCount: response.followersCount,
        }))
        // Update local state
        user.isFollowing = true
      }
    } catch (error) {
      console.error('Follow error:', error)
    } finally {
      setFollowLoadingIds(followLoadingIds.filter(id => id !== user._id))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/65" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-center px-4 py-3 border-b relative">
          <h2 className="font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No {type} yet
            </div>
          ) : (
            <div className="py-2">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-50"
                >
                  <Link
                    to={`/profile/${user.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden">
                      {user.profilePic && user.profilePic.startsWith('/uploads/') ? (
                        <img
                          src={`http://localhost:8000${user.profilePic}`}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <DefaultAvatar username={user.username} size="lg" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{user.username}</p>
                      {user.bio && (
                        <p className="text-sm text-gray-500 truncate max-w-[150px]">{user.bio}</p>
                      )}
                    </div>
                  </Link>

                  {/* Follow button (hide for own profile) */}
                  {user._id !== currentUser?._id && (
                    <button
                      onClick={() => handleFollow(user)}
                      disabled={followLoadingIds.includes(user._id)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${
                        user.isFollowing
                          ? 'bg-gray-100 hover:bg-gray-200'
                          : 'bg-[#0095F6] text-white hover:bg-[#1877F2]'
                      }`}
                    >
                      {followLoadingIds.includes(user._id)
                        ? '...'
                        : user.isFollowing
                        ? 'Following'
                        : 'Follow'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FollowersModal
