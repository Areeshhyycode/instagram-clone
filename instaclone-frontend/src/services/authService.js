import api from './api'

// Authentication related API calls
const authService = {
  // Login user
  login: async (credentials) => {
    // credentials = { email, password }
    return api.post('/auth/login', credentials)
  },

  // Register new user
  register: async (userData) => {
    // userData = { email, fullName, username, password }
    return api.post('/auth/register', userData)
  },

  // Get current user profile
  getMe: async () => {
    return api.get('/auth/me')
  },

  // Logout (if you have server-side logout)
  logout: async () => {
    return api.post('/auth/logout', {})
  },

  // Forgot password
  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email })
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    return api.post('/auth/reset-password', { token, newPassword })
  },
}

export default authService
