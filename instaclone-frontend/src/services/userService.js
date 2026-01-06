import api from './api'
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../config/constants'

const userService = {
  // Get profile by username
  getProfileByUsername: async (username) => {
    return api.get(`/users/profile/username/${username}`)
  },

  // Get profile by ID
  getProfileById: async (userId) => {
    return api.get(`/users/profile/${userId}`)
  },

  // Get user's posts by username
  getUserPosts: async (username, page = 1, limit = 12) => {
    return api.get(`/users/posts/${username}?page=${page}&limit=${limit}`)
  },

  // Edit profile (bio, username, profile picture)
  editProfile: async (formData) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const response = await fetch(`${API_BASE_URL}/users/profile/edit`, {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update profile')
    }
    return response.json()
  },

  // Follow a user
  followUser: async (userId) => {
    return api.post(`/users/follow/${userId}`, {})
  },

  // Unfollow a user
  unfollowUser: async (userId) => {
    return api.post(`/users/unfollow/${userId}`, {})
  },

  // Get followers list
  getFollowers: async (userId) => {
    return api.get(`/users/followers/${userId}`)
  },

  // Get following list
  getFollowing: async (userId) => {
    return api.get(`/users/following/${userId}`)
  },

  // Search users
  searchUsers: async (query, page = 1, limit = 20) => {
    return api.get(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
  },

  // Get suggested users
  getSuggestedUsers: async (limit = 10) => {
    return api.get(`/users/suggested?limit=${limit}`)
  },
}

export default userService
