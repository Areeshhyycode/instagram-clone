const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  onClick,
  className = '',
  ...props
}) => {
  const baseStyles = `
    font-semibold text-sm rounded-lg py-[7px] px-4
    transition-all duration-200 ease-in-out
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'cursor-not-allowed' : 'cursor-pointer'}
  `

  const variants = {
    primary: `
      ${disabled || loading
        ? 'bg-[#B2DFFC] text-white'
        : 'bg-[#0095F6] hover:bg-[#1877F2] text-white'
      }
    `,
    secondary: `
      bg-transparent text-[#0095F6] hover:text-[#00376B]
    `,
    outline: `
      border border-[#DBDBDB] bg-white text-[#262626] hover:bg-gray-50
    `,
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
