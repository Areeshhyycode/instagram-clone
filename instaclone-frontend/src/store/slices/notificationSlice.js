import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  // Pagination
  currentPage: 1,
  totalPages: 1,
  hasMore: true,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Fetch notifications
    fetchNotificationsStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchNotificationsSuccess: (state, action) => {
      state.loading = false
      state.notifications = action.payload.notifications
      state.unreadCount = action.payload.unreadCount
      state.currentPage = action.payload.currentPage
      state.totalPages = action.payload.totalPages
      state.hasMore = action.payload.currentPage < action.payload.totalPages
    },
    fetchNotificationsFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },

    // Load more notifications
    loadMoreNotificationsSuccess: (state, action) => {
      state.notifications = [...state.notifications, ...action.payload.notifications]
      state.currentPage = action.payload.currentPage
      state.hasMore = action.payload.currentPage < action.payload.totalPages
    },

    // Update unread count
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload
    },

    // Mark single notification as read
    markAsReadSuccess: (state, action) => {
      const notification = state.notifications.find(n => n._id === action.payload)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },

    // Mark all as read
    markAllAsReadSuccess: (state) => {
      state.notifications.forEach(n => {
        n.read = true
      })
      state.unreadCount = 0
    },

    // Delete notification
    deleteNotificationSuccess: (state, action) => {
      const notification = state.notifications.find(n => n._id === action.payload)
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
      state.notifications = state.notifications.filter(n => n._id !== action.payload)
    },

    // Clear all notifications
    clearAllNotificationsSuccess: (state) => {
      state.notifications = []
      state.unreadCount = 0
    },

    // Add new notification (for real-time updates)
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload)
      state.unreadCount += 1
    },
  },
})

export const {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  loadMoreNotificationsSuccess,
  setUnreadCount,
  markAsReadSuccess,
  markAllAsReadSuccess,
  deleteNotificationSuccess,
  clearAllNotificationsSuccess,
  addNotification,
} = notificationSlice.actions

export default notificationSlice.reducer
