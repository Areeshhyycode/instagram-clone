import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from '../components/layout/Sidebar'
import MobileBottomNav from '../components/layout/MobileBottomNav'
import DefaultAvatar from '../components/common/DefaultAvatar'
import {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  markAsReadSuccess,
  markAllAsReadSuccess,
  deleteNotificationSuccess,
} from '../store/slices/notificationSlice'
import notificationService from '../services/notificationService'
import { formatDistanceToNow } from '../utils/dateUtils'

const Notifications = () => {
  const dispatch = useDispatch()
  const { notifications, unreadCount, loading, error } = useSelector(
    (state) => state.notifications
  )

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    dispatch(fetchNotificationsStart())
    try {
      const response = await notificationService.getNotifications()
      dispatch(fetchNotificationsSuccess(response))
    } catch (err) {
      dispatch(fetchNotificationsFailure(err.message))
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId)
      dispatch(markAsReadSuccess(notificationId))
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      dispatch(markAllAsReadSuccess())
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId)
      dispatch(deleteNotificationSuccess(notificationId))
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your post.'
      case 'comment':
        return `commented: "${notification.comment?.text?.slice(0, 30)}${
          notification.comment?.text?.length > 30 ? '...' : ''
        }"`
      case 'follow':
        return 'started following you.'
      default:
        return 'interacted with you.'
    }
  }

  const getNotificationLink = (notification) => {
    switch (notification.type) {
      case 'like':
      case 'comment':
        return `/p/${notification.post?._id}`
      case 'follow':
        return `/profile/${notification.sender?.username}`
      default:
        return '#'
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-[50px] md:pb-0 pt-[50px] md:pt-0">
      <Sidebar />
      <MobileBottomNav />

      <main className="md:ml-[245px]">
        <div className="max-w-[600px] mx-auto px-4 md:px-5 py-4 md:py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Notifications</h1>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[#0095F6] text-sm font-semibold"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchNotifications}
                className="mt-4 text-[#0095F6] font-semibold"
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-2 border-black rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Activity On Your Posts</h2>
              <p className="text-gray-500">
                When someone likes or comments on your posts, you'll see it here.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#DBDBDB] rounded-lg divide-y divide-[#DBDBDB]">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`flex items-center gap-3 p-4 hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                >
                  {/* Sender Avatar */}
                  <Link
                    to={`/profile/${notification.sender?.username}`}
                    className="flex-shrink-0"
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden">
                      {notification.sender?.profilePic && notification.sender.profilePic.startsWith('/uploads/') ? (
                        <img
                          src={`http://localhost:8000${notification.sender.profilePic}`}
                          alt={notification.sender.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <DefaultAvatar username={notification.sender?.username} size="lg" />
                      )}
                    </div>
                  </Link>

                  {/* Notification Content */}
                  <Link
                    to={getNotificationLink(notification)}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm">
                      <span className="font-semibold">{notification.sender?.username}</span>{' '}
                      {getNotificationText(notification)}
                      <span className="text-gray-400 ml-1">
                        {formatDistanceToNow(notification.createdAt)}
                      </span>
                    </p>
                  </Link>

                  {/* Post Thumbnail (if applicable) */}
                  {notification.post?.image && (
                    <Link
                      to={`/p/${notification.post._id}`}
                      className="flex-shrink-0"
                    >
                      <img
                        src={`http://localhost:8000${notification.post.image}`}
                        alt=""
                        className="w-11 h-11 object-cover"
                      />
                    </Link>
                  )}

                  {/* Follow button (for follow notifications) */}
                  {notification.type === 'follow' && (
                    <button className="px-4 py-1.5 bg-[#0095F6] text-white rounded-lg text-sm font-semibold hover:bg-[#1877F2]">
                      Follow
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(notification._id)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Notifications
