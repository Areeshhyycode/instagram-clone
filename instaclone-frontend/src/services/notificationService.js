import api from './api'

const notificationService = {
  // Get all notifications (paginated)
  getNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
    let url = `/notifications?page=${page}&limit=${limit}`
    if (unreadOnly) url += '&unread=true'
    return api.get(url)
  },

  // Get unread count only
  getUnreadCount: async () => {
    return api.get('/notifications/unread-count')
  },

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    return api.put(`/notifications/read/${notificationId}`, {})
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return api.put('/notifications/read-all', {})
  },

  // Delete single notification
  deleteNotification: async (notificationId) => {
    return api.delete(`/notifications/${notificationId}`)
  },

  // Clear all notifications
  clearAllNotifications: async () => {
    return api.delete('/notifications')
  },
}

export default notificationService
