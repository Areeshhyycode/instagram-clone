import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROUTES } from '../../config/constants'
import DefaultAvatar from '../common/DefaultAvatar'

const MobileBottomNav = ({ onCreatePost }) => {
  const { user } = useSelector((state) => state.auth)

  const navItems = [
    {
      path: ROUTES.HOME,
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
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      path: ROUTES.EXPLORE,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      path: ROUTES.MESSAGES,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ]

  return (
    <>
      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#DBDBDB] z-50">
        <ul className="flex justify-around items-center h-[50px]">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className="flex items-center justify-center p-2"
              >
                {({ isActive }) => (
                  <>
                    {isActive && item.iconFilled ? item.iconFilled : item.icon}
                  </>
                )}
              </NavLink>
            </li>
          ))}

          {/* Create Post Button */}
          <li>
            <button
              onClick={onCreatePost}
              className="flex items-center justify-center p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </li>

          {/* Profile */}
          <li>
            <NavLink
              to={`${ROUTES.PROFILE}/${user?.username || ''}`}
              className="flex items-center justify-center p-2"
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
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Mobile Header - Shows only on mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-[#DBDBDB] px-4 py-2 z-50 flex justify-between items-center h-[50px]">
        <img
          src="https://www.instagram.com/static/images/web/logged_out_wordmark.png/7a252de00b20.png"
          alt="Instagram"
          className="h-[29px]"
        />
        <div className="flex gap-4 items-center">
          <NavLink to={ROUTES.NOTIFICATIONS}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </NavLink>
        </div>
      </header>
    </>
  )
}

export default MobileBottomNav
