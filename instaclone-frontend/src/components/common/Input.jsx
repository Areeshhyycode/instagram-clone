import { useState } from 'react'

const Input = ({
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  error,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="relative w-full">
      <div
        className={`
          relative bg-[#FAFAFA] border rounded-[3px]
          ${error ? 'border-red-500' : isFocused ? 'border-gray-400' : 'border-[#DBDBDB]'}
        `}
      >
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full bg-transparent text-xs px-2 py-[9px] outline-none
            text-[#262626] placeholder-[#8E8E8E]
            ${isPassword && value ? 'pr-14' : 'pr-2'}
          `}
          {...props}
        />

        {/* Show/Hide password button */}
        {isPassword && value && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#262626]"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  )
}

export default Input
