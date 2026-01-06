import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Input, Button } from '../components/common'
import AuthLayout from '../components/auth/AuthLayout'
import OrDivider from '../components/auth/OrDivider'
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice'
import { ROUTES, VALIDATION } from '../config/constants'
import authService from '../services/authService'

const Signup = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!VALIDATION.EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'Enter a valid email'
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < VALIDATION.USERNAME_MIN) {
      newErrors.username = `Username must be at least ${VALIDATION.USERNAME_MIN} characters`
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < VALIDATION.PASSWORD_MIN) {
      newErrors.password = `Password must be at least ${VALIDATION.PASSWORD_MIN} characters`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    dispatch(loginStart())
    try {
      const response = await authService.register(formData)
      // response = { user, token } (backend se)
      dispatch(loginSuccess({ user: response.user, token: response.token }))
      navigate(ROUTES.HOME)
    } catch (error) {
      dispatch(loginFailure(error.message))
      setErrors({ general: error.message || 'Something went wrong. Please try again.' })
    }
  }

  const isFormValid =
    formData.email.trim() &&
    formData.fullName.trim() &&
    formData.username.trim() &&
    formData.password

  return (
    <AuthLayout>
      {/* Main Signup Box */}
      <div className="bg-white border border-[#DBDBDB] px-10 py-10">
        {/* Instagram Logo */}
        <h1 className="text-center mb-3">
          <img
            src="https://www.instagram.com/static/images/web/logged_out_wordmark.png/7a252de00b20.png"
            alt="Instagram"
            className="mx-auto h-[51px]"
          />
        </h1>

        {/* Tagline */}
        <p className="text-center text-[#8E8E8E] font-semibold text-[17px] mb-4 leading-5">
          Sign up to see photos and videos from your friends.
        </p>

        {/* Facebook Signup Button */}
        <button className="w-full bg-[#0095F6] text-white font-semibold text-sm py-[7px] rounded-lg flex items-center justify-center gap-2 hover:bg-[#1877F2] transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Log in with Facebook
        </button>

        <OrDivider />

        <form onSubmit={handleSubmit} className="flex flex-col gap-[6px]">
          <Input
            type="email"
            name="email"
            placeholder="Mobile Number or Email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />

          <Input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
          />

          <Input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
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

          {/* Terms & Conditions */}
          <p className="text-[#8E8E8E] text-xs text-center mt-2 leading-4">
            People who use our service may have uploaded your contact information to Instagram.{' '}
            <a href="#" className="text-[#00376B]">Learn More</a>
          </p>

          <p className="text-[#8E8E8E] text-xs text-center leading-4 mt-2">
            By signing up, you agree to our{' '}
            <a href="#" className="text-[#00376B]">Terms</a>,{' '}
            <a href="#" className="text-[#00376B]">Privacy Policy</a> and{' '}
            <a href="#" className="text-[#00376B]">Cookies Policy</a>.
          </p>

          <Button
            type="submit"
            disabled={!isFormValid}
            loading={loading}
            className="mt-3"
          >
            Sign up
          </Button>
        </form>
      </div>

      {/* Login Box */}
      <div className="bg-white border border-[#DBDBDB] p-5 text-center text-sm">
        Have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-[#0095F6] font-semibold">
          Log in
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

export default Signup
