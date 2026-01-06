import api from './api'
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../config/constants'

const storyService = {
  // Create new story (with image upload)
  createStory: async (formData) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const response = await fetch(`${API_BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create story')
    }
    return response.json()
  },

  // Get stories feed (grouped by user)
  getStoriesFeed: async () => {
    return api.get('/stories/feed')
  },

  // Get my stories
  getMyStories: async () => {
    return api.get('/stories/my')
  },

  // Get stories by user ID
  getUserStories: async (userId) => {
    return api.get(`/stories/user/${userId}`)
  },

  // Get single story
  getStory: async (storyId) => {
    return api.get(`/stories/${storyId}`)
  },

  // Mark story as viewed
  viewStory: async (storyId) => {
    return api.post(`/stories/view/${storyId}`, {})
  },

  // Get story viewers (only for own stories)
  getStoryViewers: async (storyId) => {
    return api.get(`/stories/views/${storyId}`)
  },

  // Delete story
  deleteStory: async (storyId) => {
    return api.delete(`/stories/${storyId}`)
  },
}

export default storyService
