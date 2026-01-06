import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from '../components/layout/Sidebar'
import CreatePostModal from '../components/post/CreatePostModal'
import EditProfileModal from '../components/profile/EditProfileModal'
import FollowersModal from '../components/profile/FollowersModal'
import DefaultAvatar from '../components/common/DefaultAvatar'
import {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  fetchProfilePostsSuccess,
  followUserSuccess,
  unfollowUserSuccess,
} from '../store/slices/userSlice'
import userService from '../services/userService'
import postService from '../services/postService'

const Profile = () => {
  const { username } = useParams()
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)
  const { profile, profilePosts, profileLoading, profileError } = useSelector((state) => state.user)

  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('posts') // posts | saved
  const [savedPosts, setSavedPosts] = useState([])
  const [savedLoading, setSavedLoading] = useState(false)

  const isOwnProfile = profile?.isOwnProfile || currentUser?.username === username

  useEffect(() => {
    if (username) {
      fetchProfile()
      fetchPosts()
      setActiveTab('posts')
      setSavedPosts([])
    }
  }, [username])

  useEffect(() => {
    if (activeTab === 'saved' && isOwnProfile) {
      fetchSavedPosts()
    }
  }, [activeTab, isOwnProfile])

  const fetchProfile = async () => {
    dispatch(fetchProfileStart())
    try {
      const data = await userService.getProfileByUsername(username)
      dispatch(fetchProfileSuccess(data))
    } catch (error) {
      dispatch(fetchProfileFailure(error.message))
    }
  }

  const fetchPosts = async () => {
    try {
      const data = await userService.getUserPosts(username)
      dispatch(fetchProfilePostsSuccess(data))
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const fetchSavedPosts = async () => {
    setSavedLoading(true)
    try {
      const data = await postService.getSavedPosts(1, 30)
      setSavedPosts(data.posts || data)
    } catch (error) {
      console.error('Error fetching saved posts:', error)
    } finally {
      setSavedLoading(false)
    }
  }

  const handleFollow = async () => {
    if (followLoading || !profile) return
    setFollowLoading(true)
    try {
      if (profile.isFollowing) {
        const response = await userService.unfollowUser(profile._id)
        dispatch(unfollowUserSuccess({
          userId: profile._id,
          followersCount: response.followersCount,
        }))
      } else {
        const response = await userService.followUser(profile._id)
        dispatch(followUserSuccess({
          userId: profile._id,
          followersCount: response.followersCount,
        }))
      }
    } catch (error) {
      console.error('Follow error:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Sidebar onCreatePost={() => setShowCreatePost(true)} />
        <main className="ml-[245px] flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </main>
      </div>
    )
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Sidebar onCreatePost={() => setShowCreatePost(true)} />
        <main className="ml-[245px] flex justify-center items-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">User not found</h2>
            <p className="text-gray-500">The user you're looking for doesn't exist.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar onCreatePost={() => setShowCreatePost(true)} />

      <main className="ml-[245px]">
        <div className="max-w-[935px] mx-auto px-5 py-8">
          {/* Profile Header */}
          <header className="flex gap-8 md:gap-20 mb-10 flex-col md:flex-row items-center md:items-start">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="w-[150px] h-[150px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[3px]">
                <div className="w-full h-full rounded-full bg-white p-[3px]">
                  {profile.profilePic && profile.profilePic.startsWith('/uploads/') ? (
                    <img
                      src={`http://localhost:8000${profile.profilePic}`}
                      alt={profile.username}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <DefaultAvatar username={profile.username || username} size="profile" />
                  )}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {/* Username & Actions */}
              <div className="flex flex-col md:flex-row items-center gap-4 mb-5">
                <h1 className="text-xl font-normal">{profile.username}</h1>
                {isOwnProfile ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEditProfile(true)}
                      className="px-4 py-1.5 bg-gray-100 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
                    >
                      Edit profile
                    </button>
                    <button className="p-1.5 hover:opacity-70 transition-opacity">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`px-6 py-1.5 rounded-lg font-semibold text-sm transition-colors ${
                        profile.isFollowing
                          ? 'bg-gray-100 hover:bg-gray-200 text-black'
                          : 'bg-[#0095F6] text-white hover:bg-[#1877F2]'
                      }`}
                    >
                      {followLoading ? '...' : profile.isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button className="px-4 py-1.5 bg-gray-100 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors">
                      Message
                    </button>
                    <button className="p-1.5 hover:opacity-70 transition-opacity">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="6" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="18" r="2" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-8 md:gap-10 mb-5">
                <div className="text-center md:text-left">
                  <span className="font-semibold">{profile.postsCount || 0}</span>{' '}
                  <span className="text-gray-600">posts</span>
                </div>
                <button onClick={() => setShowFollowers(true)} className="hover:opacity-70 transition-opacity text-center md:text-left">
                  <span className="font-semibold">{profile.followersCount || 0}</span>{' '}
                  <span className="text-gray-600">followers</span>
                </button>
                <button onClick={() => setShowFollowing(true)} className="hover:opacity-70 transition-opacity text-center md:text-left">
                  <span className="font-semibold">{profile.followingCount || 0}</span>{' '}
                  <span className="text-gray-600">following</span>
                </button>
              </div>

              {/* Name & Bio */}
              <div className="space-y-1">
                {profile.fullName && (
                  <p className="font-semibold text-sm">{profile.fullName}</p>
                )}
                {profile.bio && (
                  <p className="whitespace-pre-wrap text-sm">{profile.bio}</p>
                )}
                {profile.website && (
                  <a
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[#00376B] hover:underline"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          </header>

          {/* Tabs */}
          <div className="border-t border-gray-300">
            <div className="flex justify-center gap-12">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex items-center gap-2 py-4 text-xs font-semibold tracking-wider uppercase border-t ${
                  activeTab === 'posts'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-400'
                }`}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"/>
                </svg>
                Posts
              </button>
              {isOwnProfile && (
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`flex items-center gap-2 py-4 text-xs font-semibold tracking-wider uppercase border-t ${
                    activeTab === 'saved'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-400'
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Saved
                </button>
              )}
            </div>
          </div>

          {/* Posts Grid */}
          {activeTab === 'posts' && (
            <>
              {profilePosts.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 border-2 border-black rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-light mb-2">
                    {isOwnProfile ? 'Share Photos' : 'No Posts Yet'}
                  </h2>
                  {isOwnProfile && (
                    <p className="text-sm text-gray-500">
                      When you share photos, they will appear on your profile.
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {profilePosts.map((post) => (
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
                          {post.likesCount || post.likes?.length || 0}
                        </span>
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
                          </svg>
                          {post.commentsCount || post.comments?.length || 0}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Saved Posts Grid */}
          {activeTab === 'saved' && isOwnProfile && (
            <>
              {savedLoading ? (
                <div className="py-16 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : savedPosts.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 border-2 border-black rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-light mb-2">Save</h2>
                  <p className="text-sm text-gray-500">
                    Save photos and videos that you want to see again. No one is notified, and only you can see what you've saved.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {savedPosts.map((post) => (
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
                          {post.likesCount || post.likes?.length || 0}
                        </span>
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
                          </svg>
                          {post.commentsCount || post.comments?.length || 0}
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

      {/* Modals */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
      />

      {showEditProfile && (
        <EditProfileModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          profile={profile}
          onUpdate={fetchProfile}
        />
      )}

      {showFollowers && (
        <FollowersModal
          isOpen={showFollowers}
          onClose={() => setShowFollowers(false)}
          userId={profile._id}
          type="followers"
          title="Followers"
        />
      )}

      {showFollowing && (
        <FollowersModal
          isOpen={showFollowing}
          onClose={() => setShowFollowing(false)}
          userId={profile._id}
          type="following"
          title="Following"
        />
      )}
    </div>
  )
}

export default Profile
