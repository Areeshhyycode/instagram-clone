import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  // Profile data
  profile: null,
  profilePosts: [],
  profileLoading: false,
  profileError: null,

  // Followers/Following lists
  followers: [],
  following: [],
  followersLoading: false,
  followingLoading: false,

  // Search results
  searchResults: [],
  searchLoading: false,

  // Suggested users
  suggestedUsers: [],
  suggestedLoading: false,

  // Pagination
  postsPage: 1,
  postsTotalPages: 1,
  hasMorePosts: true,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Profile actions
    fetchProfileStart: (state) => {
      state.profileLoading = true
      state.profileError = null
    },
    fetchProfileSuccess: (state, action) => {
      state.profileLoading = false
      state.profile = action.payload
    },
    fetchProfileFailure: (state, action) => {
      state.profileLoading = false
      state.profileError = action.payload
    },
    clearProfile: (state) => {
      state.profile = null
      state.profilePosts = []
      state.postsPage = 1
      state.hasMorePosts = true
    },

    // Profile posts
    fetchProfilePostsSuccess: (state, action) => {
      state.profilePosts = action.payload.posts
      state.postsPage = action.payload.currentPage
      state.postsTotalPages = action.payload.totalPages
      state.hasMorePosts = action.payload.currentPage < action.payload.totalPages
    },
    loadMoreProfilePostsSuccess: (state, action) => {
      state.profilePosts = [...state.profilePosts, ...action.payload.posts]
      state.postsPage = action.payload.currentPage
      state.hasMorePosts = action.payload.currentPage < action.payload.totalPages
    },

    // Follow/Unfollow
    followUserSuccess: (state, action) => {
      if (state.profile) {
        state.profile.isFollowing = true
        state.profile.followersCount = action.payload.followersCount
      }
      // Update in search results
      const searchUser = state.searchResults.find(u => u._id === action.payload.userId)
      if (searchUser) searchUser.isFollowing = true
      // Update in suggested
      state.suggestedUsers = state.suggestedUsers.filter(u => u._id !== action.payload.userId)
    },
    unfollowUserSuccess: (state, action) => {
      if (state.profile) {
        state.profile.isFollowing = false
        state.profile.followersCount = action.payload.followersCount
      }
      // Update in search results
      const searchUser = state.searchResults.find(u => u._id === action.payload.userId)
      if (searchUser) searchUser.isFollowing = false
    },

    // Followers list
    fetchFollowersStart: (state) => {
      state.followersLoading = true
    },
    fetchFollowersSuccess: (state, action) => {
      state.followersLoading = false
      state.followers = action.payload.followers
    },

    // Following list
    fetchFollowingStart: (state) => {
      state.followingLoading = true
    },
    fetchFollowingSuccess: (state, action) => {
      state.followingLoading = false
      state.following = action.payload.following
    },

    // Search users
    searchUsersStart: (state) => {
      state.searchLoading = true
    },
    searchUsersSuccess: (state, action) => {
      state.searchLoading = false
      state.searchResults = action.payload.users
    },
    clearSearchResults: (state) => {
      state.searchResults = []
    },

    // Suggested users
    fetchSuggestedStart: (state) => {
      state.suggestedLoading = true
    },
    fetchSuggestedSuccess: (state, action) => {
      state.suggestedLoading = false
      // Handle both array directly or {users: []} format
      state.suggestedUsers = Array.isArray(action.payload)
        ? action.payload
        : (action.payload?.users || [])
    },

    // Profile edit
    updateProfileSuccess: (state, action) => {
      state.profile = { ...state.profile, ...action.payload }
    },
  },
})

export const {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  clearProfile,
  fetchProfilePostsSuccess,
  loadMoreProfilePostsSuccess,
  followUserSuccess,
  unfollowUserSuccess,
  fetchFollowersStart,
  fetchFollowersSuccess,
  fetchFollowingStart,
  fetchFollowingSuccess,
  searchUsersStart,
  searchUsersSuccess,
  clearSearchResults,
  fetchSuggestedStart,
  fetchSuggestedSuccess,
  updateProfileSuccess,
} = userSlice.actions

export default userSlice.reducer
