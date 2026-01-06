import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  nextStory,
  prevStory,
  resetStoryViewer,
  markStoryViewed,
} from '../../store/slices/storySlice'
import storyService from '../../services/storyService'
import DefaultAvatar from '../common/DefaultAvatar'

const StoryViewer = ({ userStories, onClose, onNextUser, onPrevUser }) => {
  const dispatch = useDispatch()
  const { currentStoryIndex } = useSelector((state) => state.stories)
  const { user: currentUser } = useSelector((state) => state.auth)

  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const stories = userStories?.stories || []
  const currentStory = stories[currentStoryIndex]
  const user = userStories?.user

  // Auto-advance timer
  useEffect(() => {
    if (!currentStory || isPaused) return

    const duration = 5000 // 5 seconds per story
    const interval = 50 // Update every 50ms
    const increment = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext()
          return 0
        }
        return prev + increment
      })
    }, interval)

    return () => clearInterval(timer)
  }, [currentStory, isPaused, currentStoryIndex])

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0)
    if (currentStory) {
      markAsViewed()
    }
  }, [currentStoryIndex, currentStory?._id])

  const markAsViewed = async () => {
    if (!currentStory || currentStory.viewed) return
    if (currentStory.user?._id === currentUser?._id) return // Don't mark own stories

    try {
      await storyService.viewStory(currentStory._id)
      dispatch(markStoryViewed({
        storyId: currentStory._id,
        userId: user._id,
      }))
    } catch (error) {
      console.error('Error marking story as viewed:', error)
    }
  }

  const handleNext = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      dispatch(nextStory())
    } else if (onNextUser) {
      onNextUser()
    } else {
      onClose()
    }
  }, [currentStoryIndex, stories.length, onNextUser, onClose])

  const handlePrev = useCallback(() => {
    if (currentStoryIndex > 0) {
      dispatch(prevStory())
    } else if (onPrevUser) {
      onPrevUser()
    }
  }, [currentStoryIndex, onPrevUser])

  const handleClose = () => {
    dispatch(resetStoryViewer())
    onClose()
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext()
      else if (e.key === 'ArrowLeft') handlePrev()
      else if (e.key === 'Escape') handleClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev])

  if (!currentStory) return null

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white z-10"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Story Container */}
      <div
        className="relative w-full max-w-[420px] h-[90vh] max-h-[750px] bg-black rounded-lg overflow-hidden"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Progress bars */}
        <div className="absolute top-2 left-2 right-2 z-10 flex gap-1">
          {stories.map((story, index) => (
            <div
              key={story._id}
              className="flex-1 h-[2px] bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-50"
                style={{
                  width:
                    index < currentStoryIndex
                      ? '100%'
                      : index === currentStoryIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-4 right-4 z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {user?.profilePic && user.profilePic.startsWith('/uploads/') ? (
              <img
                src={`http://localhost:8000${user.profilePic}`}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <DefaultAvatar username={user?.username} size="sm" />
            )}
          </div>
          <span className="text-white font-semibold text-sm">{user?.username}</span>
          <span className="text-white/70 text-xs">
            {new Date(currentStory.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Story Image */}
        <img
          src={`http://localhost:8000${currentStory.image}`}
          alt=""
          className="w-full h-full object-contain"
        />

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <p className="text-white text-sm text-center bg-black/50 px-4 py-2 rounded-lg">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Navigation areas */}
        <div className="absolute inset-0 flex">
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={handlePrev}
          />
          <div className="w-1/3 h-full" />
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={handleNext}
          />
        </div>
      </div>

      {/* Previous user arrow */}
      {onPrevUser && (
        <button
          onClick={onPrevUser}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next user arrow */}
      {onNextUser && (
        <button
          onClick={onNextUser}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default StoryViewer
