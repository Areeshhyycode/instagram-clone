import { createSlice } from "@reduxjs/toolkit"
import { AUTH_TOKEN_KEY, USER_KEY } from '../../config/constants'

// LocalStorage se data load karo (agar hai toh)
const loadFromStorage = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  const user = localStorage.getItem(USER_KEY)
  return {
    token,
    user: user ? JSON.parse(user) : null,
    isAuthenticated: !!token,
  }
}

const storedData = loadFromStorage()

const initialState = {
  user: storedData.user,
  token: storedData.token,
  isAuthenticated: storedData.isAuthenticated,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login shuru
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },

    // Login success - localStorage mein bhi save karo
    loginSuccess: (state, action) => {
      state.loading = false
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.error = null
      // LocalStorage mein save karo
      localStorage.setItem(AUTH_TOKEN_KEY, action.payload.token)
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user))
    },

    // Login fail
    loginFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },

    // Logout - localStorage bhi clear karo
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
      // LocalStorage clear karo
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },

    // Error clear
    clearError: (state) => {
      state.error = null
    },

    // User update (profile update ke baad)
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem(USER_KEY, JSON.stringify(state.user))
    },
  }
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  updateUser,
} = authSlice.actions

export default authSlice.reducer