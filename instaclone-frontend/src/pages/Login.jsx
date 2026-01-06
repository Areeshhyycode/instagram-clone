import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Input, Button } from '../components/common'
import AuthLayout from '../components/auth/AuthLayout'
import OrDivider from '../components/auth/OrDivider'
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice'
import { ROUTES } from '../config/constants'
import authService from '../services/authService'

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    dispatch(loginStart())
    try {
      const response = await authService.login(formData)
      // response = { user, token } (backend se)
      dispatch(loginSuccess({ user: response.user, token: response.token }))
      navigate(ROUTES.HOME)
    } catch (error) {
      dispatch(loginFailure(error.message))
      setErrors({ general: error.message || 'Invalid email or password' })
    }
  }

  const isFormValid = formData.email.trim() && formData.password

  return (
    <AuthLayout>
      {/* Main Login Box */}
      <div className="bg-white border border-[#DBDBDB] px-10 py-10">
        {/* Instagram Logo */}
        <h1 className="text-center mb-8">
          <img
            src="https://www.instagram.com/static/images/web/logged_out_wordmark.png/7a252de00b20.png"
            alt="Instagram"
            className="mx-auto h-[51px]"
          />
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[6px]">
          <Input
            type="text"
            name="email"
            placeholder="Phone number, username, or email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />

          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          {errors.general && (
            <p className="text-red-500 text-sm text-center">{errors.general}</p>
          )}

          <Button
            type="submit"
            disabled={!isFormValid}
            loading={loading}
            className="mt-2"
          >
            Log in
          </Button>
        </form>

        <OrDivider />

        {/* Facebook Login */}
        <button className="w-full flex items-center justify-center gap-2 text-[#385185] font-semibold text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Log in with Facebook
        </button>

        {/* Forgot Password */}
        <Link
          to="/forgot-password"
          className="block text-center text-xs text-[#00376B] mt-4"
        >
          Forgot password?
        </Link>
      </div>

      {/* Sign Up Box */}
      <div className="bg-white border border-[#DBDBDB] p-5 text-center text-sm">
        Don't have an account?{' '}
        <Link to={ROUTES.SIGNUP} className="text-[#0095F6] font-semibold">
          Sign up
        </Link>
      </div>

      {/* App Download */}
      <div className="text-center mt-3">
        <p className="text-sm mb-4">Get the app.</p>
        <div className="flex justify-center gap-2">
          <a href="https://apps.apple.com/app/instagram/id389801252" target="_blank" rel="noopener noreferrer">
            <img
              src="https://static.cdninstagram.com/rsrc.php/v3/yt/r/Yfc020c87j0.png"
              alt="Download on App Store"
              className="h-10"
            />
          </a>
          <a href="https://play.google.com/store/apps/details?id=com.instagram.android" target="_blank" rel="noopener noreferrer">
            <img
              src="https://static.cdninstagram.com/rsrc.php/v3/yz/r/c5Rp7Ym-Klz.png"
              alt="Get it on Google Play"
              className="h-10"
            />
          </a>
        </div>
      </div>
    </AuthLayout>
  )
}

export default Login
