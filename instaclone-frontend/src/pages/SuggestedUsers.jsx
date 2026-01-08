import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import DefaultAvatar from '../components/common/DefaultAvatar';

const SuggestedUsers = () => {
  const navigate = useNavigate();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState([]);

  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  const fetchSuggestedUsers = async () => {
    try {
      const response = await userService.getSuggestedUsers(20);
      setSuggestedUsers(response.users || []);
    } catch (error) {
      console.log('Error fetching suggested users:', error);
      setSuggestedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    if (followingIds.includes(userId)) return;

    setFollowingIds([...followingIds, userId]);
    try {
      await userService.followUser(userId);
      // Optionally remove the user from suggestions after following
      setSuggestedUsers(suggestedUsers.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Follow error:', error);
      setFollowingIds(followingIds.filter(id => id !== userId));
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b sticky top-0 bg-white z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold">Suggested for you</h1>
      </div>

      {/* Suggested Users List */}
      <div className="divide-y">
        {loading ? (
          // Loading skeleton
          [...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded" />
            </div>
          ))
        ) : suggestedUsers.length > 0 ? (
          suggestedUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              {/* User Info */}
              <div
                onClick={() => navigate(`/profile/${user.username}`)}
                className="flex items-center gap-3 flex-1 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-200">
                  {user.profilePic && user.profilePic.startsWith('/uploads/') ? (
                    <img
                      src={`http://localhost:8000${user.profilePic}`}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <DefaultAvatar size="profile" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{user.username}</p>
                  <p className="text-xs text-gray-500">
                    {user.fullName || user.username}
                  </p>
                  {user.mutualFollowers > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Followed by {user.mutualFollowers} {user.mutualFollowers === 1 ? 'person' : 'people'} you follow
                    </p>
                  )}
                </div>
              </div>

              {/* Follow Button */}
              <button
                onClick={() => handleFollow(user._id)}
                disabled={followingIds.includes(user._id)}
                className="px-6 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {followingIds.includes(user._id) ? 'Following...' : 'Follow'}
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-center">No suggestions available</p>
            <p className="text-gray-400 text-sm text-center mt-1">
              Check back later for new suggestions
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestedUsers;
