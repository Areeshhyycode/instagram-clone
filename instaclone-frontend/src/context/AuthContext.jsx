import { createContext, useContext, useState, useEffect } from 'react'
import { AUTH_TOKEN_KEY, USER_KEY } from '../config/constants'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  // Login function
  const login = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem(AUTH_TOKEN_KEY, authToken)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
  }

  // Logout function
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  // Check if user is authenticated
  const isAuthenticated = !!token

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
