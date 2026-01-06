import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  posts: [],           // feed posts array
  currentPost: null,   // single post view ke liye
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  hasMore: true,       // infinite scroll ke liye
}

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Fetch posts start
    fetchPostsStart: (state) => {
      state.loading = true
      state.error = null
    },

    // Fetch posts success
    fetchPostsSuccess: (state, action) => {
      state.loading = false
      state.posts = action.payload.posts
      state.currentPage = action.payload.currentPage
      state.totalPages = action.payload.totalPages
      state.hasMore = action.payload.currentPage < action.payload.totalPages
    },

    // Load more posts (pagination)
    loadMorePostsSuccess: (state, action) => {
      state.loading = false
      state.posts = [...state.posts, ...action.payload.posts]
      state.currentPage = action.payload.currentPage
      state.hasMore = action.payload.currentPage < action.payload.totalPages
    },

    // Fetch posts failure
    fetchPostsFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },

    // Like/Unlike post
    toggleLike: (state, action) => {
      const { postId, liked, likes } = action.payload
      const post = state.posts.find(p => p._id === postId)
      if (post) {
        post.likes = liked
          ? [...post.likes, 'currentUser']
          : post.likes.filter((_, i) => i < likes)
        post.likesCount = likes
        post.isLiked = liked
      }
    },

    // Add comment
    addComment: (state, action) => {
      const { postId, comment } = action.payload
      const post = state.posts.find(p => p._id === postId)
      if (post) {
        post.comments.push(comment)
      }
    },

    // Add new post
    addPost: (state, action) => {
      state.posts.unshift(action.payload) // new post top pe
    },

    // Delete post
    deletePost: (state, action) => {
      state.posts = state.posts.filter(p => p._id !== action.payload)
    },

    // Set current post (single view)
    setCurrentPost: (state, action) => {
      state.currentPost = action.payload
    },

    // Clear posts
    clearPosts: (state) => {
      state.posts = []
      state.currentPage = 1
      state.hasMore = true
    },
  },
})

export const {
  fetchPostsStart,
  fetchPostsSuccess,
  loadMorePostsSuccess,
  fetchPostsFailure,
  toggleLike,
  addComment,
  addPost,
  deletePost,
  setCurrentPost,
  clearPosts,
} = postSlice.actions

export default postSlice.reducer
