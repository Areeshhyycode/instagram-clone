// App-wide constants

export const APP_NAME = 'Instagram'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PROFILE: '/profile',
  EXPLORE: '/explore',
  SEARCH: '/search',
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',
}

export const AUTH_TOKEN_KEY = 'insta_auth_token'
export const USER_KEY = 'insta_user'

export const VALIDATION = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 30,
  PASSWORD_MIN: 6,
  PASSWORD_MAX: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}
