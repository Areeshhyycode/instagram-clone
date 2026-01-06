import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchSuggestedStart,
  fetchSuggestedSuccess,
  followUserSuccess,
} from '../../store/slices/userSlice'
import userService from '../../services/userService'
import { ROUTES } from '../../config/constants'

const Suggestions = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { suggestedUsers, suggestedLoading } = useSelector((state) => state.user)

  const [followLoadingIds, setFollowLoadingIds] = useState([])

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    dispatch(fetchSuggestedStart())
    try {
      const response = await userService.getSuggestedUsers(5)
      dispatch(fetchSuggestedSuccess(response))
    } catch (error) {
      // If backend route doesn't exist yet, use empty array
      console.log('Suggested users not available yet:', error.message)
      dispatch(fetchSuggestedSuccess([]))
    }
  }

  const handleFollow = async (userId) => {
    if (followLoadingIds.includes(userId)) return

    setFollowLoadingIds([...followLoadingIds, userId])
    try {
      const response = await userService.followUser(userId)
      dispatch(followUserSuccess({
        userId,
        followersCount: response.followersCount,
      }))
    } catch (error) {
      console.error('Follow error:', error)
    } finally {
      setFollowLoadingIds(followLoadingIds.filter(id => id !== userId))
    }
  }

  return (
    <div className="w-[320px] ml-16 pt-8">
      {/* Current user */}
      <div className="flex items-center justify-between mb-5">
        <Link to={`/profile/${user?.username}`} className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden">
            {user?.profilePic ? (
              <img
                src={`http://localhost:8000${user.profilePic}`}
                alt={user?.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-gray-500">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-sm">{user?.username}</p>
            <p className="text-sm text-gray-500">{user?.fullName || user?.username}</p>
          </div>
        </Link>
        <button className="text-xs text-[#0095F6] font-semibold">
          Switch
        </button>
      </div>

      {/* Suggestions header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-500">Suggested for you</span>
        <Link to={ROUTES?.EXPLORE || '/explore'} className="text-xs font-semibold">
          See All
        </Link>
      </div>

      {/* Suggestions list */}
      <div className="space-y-3">
        {suggestedLoading ? (
          // Loading skeleton
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-24 mb-1" />
                <div className="h-2 bg-gray-200 rounded w-16" />
              </div>
            </div>
          ))
        ) : suggestedUsers.length === 0 ? (
          <p className="text-sm text-gray-500">No suggestions available</p>
        ) : (
          suggestedUsers.map((suggestion) => (
            <div key={suggestion._id} className="flex items-center justify-between">
              <Link to={`/profile/${suggestion.username}`} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                  {suggestion.profilePic ? (
                    <img
                      src={`http://localhost:8000${suggestion.profilePic}`}
                      alt={suggestion.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-400">
                      {suggestion.username?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">{suggestion.username}</p>
                  <p className="text-xs text-gray-500">
                    {suggestion.mutualFollowers > 0
                      ? `${suggestion.mutualFollowers} mutual follower${suggestion.mutualFollowers > 1 ? 's' : ''}`
                      : 'Suggested for you'}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => handleFollow(suggestion._id)}
                disabled={followLoadingIds.includes(suggestion._id)}
                className="text-xs text-[#0095F6] font-semibold disabled:opacity-50"
              >
                {followLoadingIds.includes(suggestion._id) ? '...' : 'Follow'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer links */}
      <div className="mt-8 text-xs text-gray-400">
        <div className="flex flex-wrap gap-x-1 gap-y-1 mb-4">
          <a href="#" className="hover:underline">About</a> ·
          <a href="#" className="hover:underline">Help</a> ·
          <a href="#" className="hover:underline">Press</a> ·
          <a href="#" className="hover:underline">API</a> ·
          <a href="#" className="hover:underline">Jobs</a> ·
          <a href="#" className="hover:underline">Privacy</a> ·
          <a href="#" className="hover:underline">Terms</a> ·
          <a href="#" className="hover:underline">Locations</a> ·
          <a href="#" className="hover:underline">Language</a>
        </div>
        <p>© 2024 INSTAGRAM CLONE</p>
      </div>
    </div>
  )
}

export default Suggestions
