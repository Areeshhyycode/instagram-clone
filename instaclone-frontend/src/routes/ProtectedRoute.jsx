import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROUTES } from '../config/constants'

// Protects routes that require authentication
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth)

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0095F6]"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Render child routes
  return <Outlet />
}

export default ProtectedRoute
