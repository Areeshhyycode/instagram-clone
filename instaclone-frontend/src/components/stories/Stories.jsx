import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchStoriesFeedStart,
  fetchStoriesFeedSuccess,
  fetchStoriesFeedFailure,
  setCurrentStoryUser,
} from '../../store/slices/storySlice'
import storyService from '../../services/storyService'
import StoryViewer from './StoryViewer'
import CreateStoryModal from './CreateStoryModal'
import DefaultAvatar from '../common/DefaultAvatar'

const Stories = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { storiesFeed, feedLoading } = useSelector((state) => state.stories)

  const [showViewer, setShowViewer] = useState(false)
  const [currentUserIndex, setCurrentUserIndex] = useState(0)
  const [showCreateStory, setShowCreateStory] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    dispatch(fetchStoriesFeedStart())
    try {
      const response = await storyService.getStoriesFeed()
      dispatch(fetchStoriesFeedSuccess(response))
    } catch (error) {
      // If backend route doesn't exist yet, use empty array
      console.log('Stories feed not available yet:', error.message)
      dispatch(fetchStoriesFeedSuccess([]))
    }
  }

  const handleStoryClick = (userStories, index) => {
    setCurrentUserIndex(index)
    dispatch(setCurrentStoryUser(userStories.user._id))
    setShowViewer(true)
  }

  const handleNextUser = () => {
    if (currentUserIndex < storiesFeed.length - 1) {
      const nextIndex = currentUserIndex + 1
      setCurrentUserIndex(nextIndex)
      dispatch(setCurrentStoryUser(storiesFeed[nextIndex].user._id))
    } else {
      setShowViewer(false)
    }
  }

  const handlePrevUser = () => {
    if (currentUserIndex > 0) {
      const prevIndex = currentUserIndex - 1
      setCurrentUserIndex(prevIndex)
      dispatch(setCurrentStoryUser(storiesFeed[prevIndex].user._id))
    }
  }

  const handleCreateStory = () => {
    setShowCreateStory(true)
  }

  // Find own stories in feed
  const myStoriesInFeed = storiesFeed.find(s => s.user._id === user?._id)

  return (
    <>
      <div className="bg-white border border-[#DBDBDB] rounded-lg p-4 mb-6">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {/* Your Story (always first) */}
          <button
            onClick={myStoriesInFeed ? () => handleStoryClick(myStoriesInFeed, storiesFeed.indexOf(myStoriesInFeed)) : handleCreateStory}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div className={`w-16 h-16 rounded-full p-[3px] ${
              myStoriesInFeed?.hasUnviewed
                ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'
                : 'bg-gray-200'
            }`}>
              <div className="w-full h-full rounded-full bg-white p-[2px]">
                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center relative overflow-hidden">
                  {user?.profilePic && user.profilePic.startsWith('/uploads/') ? (
                    <img
                      src={`http://localhost:8000${user.profilePic}`}
                      alt="Your story"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <DefaultAvatar username={user?.username} size="story" />
                  )}
                  {/* Add story button */}
                  {!myStoriesInFeed && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0095F6] rounded-full border-2 border-white flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <span className="text-xs w-16 truncate text-center">Your story</span>
          </button>

          {/* Other users' stories */}
          {storiesFeed
            .filter(s => s.user._id !== user?._id)
            .map((userStories, index) => (
              <button
                key={userStories.user._id}
                onClick={() => handleStoryClick(userStories, storiesFeed.indexOf(userStories))}
                className="flex flex-col items-center gap-1 flex-shrink-0"
              >
                <div className={`w-16 h-16 rounded-full p-[3px] ${
                  userStories.hasUnviewed
                    ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'
                    : 'bg-gray-300'
                }`}>
                  <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                    {userStories.user.profilePic && userStories.user.profilePic.startsWith('/uploads/') ? (
                      <img
                        src={`http://localhost:8000${userStories.user.profilePic}`}
                        alt={userStories.user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <DefaultAvatar username={userStories.user.username} size="story" />
                    )}
                  </div>
                </div>
                <span className="text-xs w-16 truncate text-center">
                  {userStories.user.username}
                </span>
              </button>
            ))}

          {/* Loading placeholder */}
          {feedLoading && (
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0 animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-gray-200" />
                  <div className="w-12 h-2 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Story Viewer */}
      {showViewer && storiesFeed[currentUserIndex] && (
        <StoryViewer
          userStories={storiesFeed[currentUserIndex]}
          onClose={() => setShowViewer(false)}
          onNextUser={currentUserIndex < storiesFeed.length - 1 ? handleNextUser : null}
          onPrevUser={currentUserIndex > 0 ? handlePrevUser : null}
        />
      )}

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={showCreateStory}
        onClose={() => setShowCreateStory(false)}
        onSuccess={fetchStories}
      />
    </>
  )
}

export default Stories
