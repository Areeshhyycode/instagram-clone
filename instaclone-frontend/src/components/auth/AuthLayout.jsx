// Layout wrapper for Login/Signup pages

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-[350px] flex flex-col gap-3">
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
