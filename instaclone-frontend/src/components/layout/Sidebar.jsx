import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { ROUTES } from '../../config/constants'
import DefaultAvatar from '../common/DefaultAvatar'

const Sidebar = ({ onCreatePost }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const navItems = [
    {
      path: ROUTES.HOME,
      label: 'Home',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      iconFilled: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      ),
    },
    {
      path: ROUTES.SEARCH,
      label: 'Search',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      path: ROUTES.EXPLORE,
      label: 'Explore',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      path: ROUTES.MESSAGES,
      label: 'Messages',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      path: ROUTES.NOTIFICATIONS,
      label: 'Notifications',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
  ]

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[245px] bg-white border-r border-[#DBDBDB] py-6 px-3 flex-col">
      {/* Logo */}
      <div className="px-3 mb-5">
        <img
          src="https://www.instagram.com/static/images/web/logged_out_wordmark.png/7a252de00b20.png"
          alt="Instagram"
          className="h-[29px] mt-4 mb-4"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-3 rounded-lg transition-colors hover:bg-gray-100 ${
                    isActive ? 'font-bold' : ''
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && item.iconFilled ? item.iconFilled : item.icon}
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}

          {/* Create Post Button */}
          <li>
            <button
              onClick={onCreatePost}
              className="w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-colors hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Profile at bottom */}
      <NavLink
        to={`${ROUTES.PROFILE}/${user?.username || ''}`}
        className={({ isActive }) =>
          `flex items-center gap-4 px-3 py-3 rounded-lg transition-colors hover:bg-gray-100 ${
            isActive ? 'font-bold' : ''
          }`
        }
      >
        <div className="w-6 h-6 rounded-full bg-gray-300 overflow-hidden">
          {user?.profilePic ? (
            <img
              src={user.profilePic.startsWith('http') ? user.profilePic : `http://localhost:8000${user.profilePic}`}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <DefaultAvatar username={user?.username} size="xs" />
          )}
        </div>
        <span>Profile</span>
      </NavLink>

      {/* More Menu */}
      <div className="relative">
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-colors hover:bg-gray-100 mt-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>More</span>
        </button>

        {/* Dropdown Menu */}
        {showMoreMenu && (
          <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-xl shadow-lg border border-[#DBDBDB] overflow-hidden">
            <button
              onClick={() => {
                dispatch(logout())
                navigate(ROUTES.LOGIN)
                setShowMoreMenu(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
