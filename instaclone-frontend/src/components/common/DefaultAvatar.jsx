// Instagram-style default avatar with person icon

const DefaultAvatar = ({
  size = 'md',
  className = ''
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
    '2xl': 'w-16 h-16',
    story: 'w-[56px] h-[56px]',
    profile: 'w-full h-full',
  }

  // Icon size based on container size
  const iconSizes = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
    story: 'w-9 h-9',
    profile: 'w-20 h-20',
  }

  return (
    <div
      className={`
        rounded-full bg-[#DBDBDB]
        flex items-center justify-center
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
    >
      {/* Person/User Icon - Instagram style */}
      <svg
        className={`${iconSizes[size] || iconSizes.md} text-white`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M12 14c-6 0-8 3-8 6v1h16v-1c0-3-2-6-8-6z" />
      </svg>
    </div>
  )
}

export default DefaultAvatar
