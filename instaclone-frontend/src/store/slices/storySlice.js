import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Stories feed (grouped by user)
  storiesFeed: [],
  feedLoading: false,
  feedError: null,

  // My stories
  myStories: [],
  myStoriesLoading: false,

  // Currently viewing story
  currentStoryUser: null,  // Which user's stories are being viewed
  currentStoryIndex: 0,    // Which story in that user's list

  // Story viewers (for own stories)
  storyViewers: [],
  viewersLoading: false,

  // Create story
  createLoading: false,
  createError: null,
}

const storySlice = createSlice({
  name: 'stories',
  initialState,
  reducers: {
    // Fetch stories feed
    fetchStoriesFeedStart: (state) => {
      state.feedLoading = true
      state.feedError = null
    },
    fetchStoriesFeedSuccess: (state, action) => {
      state.feedLoading = false
      state.storiesFeed = action.payload
    },
    fetchStoriesFeedFailure: (state, action) => {
      state.feedLoading = false
      state.feedError = action.payload
    },

    // My stories
    fetchMyStoriesStart: (state) => {
      state.myStoriesLoading = true
    },
    fetchMyStoriesSuccess: (state, action) => {
      state.myStoriesLoading = false
      state.myStories = action.payload
    },

    // View story - mark as viewed
    markStoryViewed: (state, action) => {
      const { storyId, userId } = action.payload
      // Update in feed
      const userStories = state.storiesFeed.find(s => s.user._id === userId)
      if (userStories) {
        const story = userStories.stories.find(s => s._id === storyId)
        if (story) {
          story.viewed = true
        }
        // Check if all stories are viewed
        userStories.hasUnviewed = userStories.stories.some(s => !s.viewed)
      }
    },

    // Current story navigation
    setCurrentStoryUser: (state, action) => {
      state.currentStoryUser = action.payload
      state.currentStoryIndex = 0
    },
    nextStory: (state) => {
      state.currentStoryIndex += 1
    },
    prevStory: (state) => {
      if (state.currentStoryIndex > 0) {
        state.currentStoryIndex -= 1
      }
    },
    resetStoryViewer: (state) => {
      state.currentStoryUser = null
      state.currentStoryIndex = 0
    },

    // Story viewers
    fetchStoryViewersStart: (state) => {
      state.viewersLoading = true
    },
    fetchStoryViewersSuccess: (state, action) => {
      state.viewersLoading = false
      state.storyViewers = action.payload.viewers
    },

    // Create story
    createStoryStart: (state) => {
      state.createLoading = true
      state.createError = null
    },
    createStorySuccess: (state, action) => {
      state.createLoading = false
      state.myStories.unshift(action.payload)
      // Also add to feed
      const myStoriesInFeed = state.storiesFeed.find(s => s.user._id === action.payload.user._id)
      if (myStoriesInFeed) {
        myStoriesInFeed.stories.unshift(action.payload)
      }
    },
    createStoryFailure: (state, action) => {
      state.createLoading = false
      state.createError = action.payload
    },

    // Delete story
    deleteStorySuccess: (state, action) => {
      const storyId = action.payload
      // Remove from my stories
      state.myStories = state.myStories.filter(s => s._id !== storyId)
      // Remove from feed
      state.storiesFeed.forEach(userStories => {
        userStories.stories = userStories.stories.filter(s => s._id !== storyId)
      })
      // Remove empty user entries
      state.storiesFeed = state.storiesFeed.filter(s => s.stories.length > 0)
    },
  },
})

export const {
  fetchStoriesFeedStart,
  fetchStoriesFeedSuccess,
  fetchStoriesFeedFailure,
  fetchMyStoriesStart,
  fetchMyStoriesSuccess,
  markStoryViewed,
  setCurrentStoryUser,
  nextStory,
  prevStory,
  resetStoryViewer,
  fetchStoryViewersStart,
  fetchStoryViewersSuccess,
  createStoryStart,
  createStorySuccess,
  createStoryFailure,
  deleteStorySuccess,
} = storySlice.actions

export default storySlice.reducer
