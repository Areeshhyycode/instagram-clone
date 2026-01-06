import { useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { updateUser } from '../../store/slices/authSlice'
import { updateProfileSuccess } from '../../store/slices/userSlice'
import userService from '../../services/userService'

const EditProfileModal = ({ isOpen, onClose, profile, onUpdate }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || '',
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = new FormData()
      if (formData.username !== profile.username) {
        data.append('username', formData.username)
      }
      if (formData.bio !== profile.bio) {
        data.append('bio', formData.bio)
      }
      if (selectedFile) {
        data.append('profilePic', selectedFile)
      }

      const updatedProfile = await userService.editProfile(data)

      // Update auth state
      dispatch(updateUser({
        username: updatedProfile.username,
        profilePic: updatedProfile.profilePic,
        bio: updatedProfile.bio,
      }))

      // Update profile state
      dispatch(updateProfileSuccess(updatedProfile))

      onClose()

      // If username changed, navigate to new profile URL
      if (formData.username !== profile.username) {
        navigate(`/profile/${updatedProfile.username}`, { replace: true })
      } else if (onUpdate) {
        onUpdate()
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const currentProfilePic = preview || (profile?.profilePic ? `http://localhost:8000${profile.profilePic}` : null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/65" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <button onClick={onClose} className="text-sm">Cancel</button>
          <h2 className="font-semibold">Edit profile</h2>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="text-[#0095F6] font-semibold text-sm disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Done'}
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {currentProfilePic ? (
                <img
                  src={currentProfilePic}
                  alt={profile?.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-semibold text-gray-400">
                  {profile?.username?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold">{profile?.username}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[#0095F6] text-sm font-semibold"
              >
                Change profile photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-500 mb-1">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
              minLength={3}
              maxLength={30}
            />
          </div>

          {/* Bio */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-500 mb-1">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500 resize-none"
              rows={3}
              maxLength={150}
            />
            <p className="text-xs text-gray-400 text-right">{formData.bio.length}/150</p>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
        </form>
      </div>
    </div>
  )
}

export default EditProfileModal
