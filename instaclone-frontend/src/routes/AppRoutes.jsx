import { Routes, Route, Navigate } from 'react-router-dom'
import { Login, Signup, Home } from '../pages'
import Profile from '../pages/Profile'
import Explore from '../pages/Explore'
import Search from '../pages/Search'
import Notifications from '../pages/Notifications'
import Messages from '../pages/Messages'
import ChatScreen from '../pages/ChatScreen'
import SuggestedUsers from '../pages/SuggestedUsers'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import { ROUTES } from '../config/constants'

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - Only accessible when NOT logged in */}
      <Route element={<PublicRoute />}>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.SIGNUP} element={<Signup />} />
      </Route>

      {/* Protected Routes - Only accessible when logged in */}
      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path={ROUTES.EXPLORE} element={<Explore />} />
        <Route path={ROUTES.SEARCH} element={<Search />} />
        <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/suggested" element={<SuggestedUsers />} />
        <Route path="/messages/:chatId" element={<ChatScreen />} />
        <Route path="/suggested-users" element={<SuggestedUsers />} />
      </Route>

      {/* Redirect unknown routes to home */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}

export default AppRoutes
