import api from './api'
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../config/constants'

const postService = {
  // Get feed posts with pagination and sorting
  // sort: 'latest' | 'oldest' | 'popular'
  // type: 'following' | 'all'
  getFeed: async (page = 1, limit = 10, sort = 'latest', type = 'following') => {
    return api.get(`/posts/feed?page=${page}&limit=${limit}&sort=${sort}&type=${type}`)
  },

  // Get single post by ID
  getPost: async (postId) => {
    return api.get(`/posts/${postId}`)
  },

  // Create new post (with image upload)
  createPost: async (formData) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create post')
    }
    return response.json()
  },

  // Like/Unlike a post
  toggleLike: async (postId) => {
    return api.post(`/posts/like/${postId}`, {})
  },

  // Add comment to a post
  addComment: async (postId, text) => {
    return api.post(`/posts/comment/${postId}`, { text })
  },

  // Delete a post
  deletePost: async (postId) => {
    return api.delete(`/posts/${postId}`)
  },

  // Search posts by caption
  searchPosts: async (query, page = 1, limit = 20) => {
    return api.get(`/posts/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
  },

  // Search posts by hashtag
  getPostsByHashtag: async (hashtag, page = 1, limit = 20) => {
    return api.get(`/posts/hashtag/${encodeURIComponent(hashtag)}?page=${page}&limit=${limit}`)
  },

  // Get explore posts (trending or random)
  // type: 'trending' | 'random'
  getExplorePosts: async (type = 'trending', page = 1, limit = 20) => {
    return api.get(`/posts/explore?type=${type}&page=${page}&limit=${limit}`)
  },

  // Get trending hashtags
  getTrendingHashtags: async (limit = 10) => {
    return api.get(`/posts/trending-hashtags?limit=${limit}`)
  },

  // Save/Unsave post (bookmark)
  toggleSavePost: async (postId) => {
    return api.post(`/posts/save/${postId}`, {})
  },

  // Get saved posts
  getSavedPosts: async (page = 1, limit = 10) => {
    return api.get(`/posts/saved/all?page=${page}&limit=${limit}`)
  },
}

export default postService
