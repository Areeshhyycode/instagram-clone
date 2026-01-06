import { useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { createStorySuccess } from '../../store/slices/storySlice'
import storyService from '../../services/storyService'

const CreateStoryModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const fileInputRef = useRef(null)

  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState('')
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

  const handleSubmit = async () => {
    if (!selectedFile) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      if (caption.trim()) {
        formData.append('caption', caption.trim())
      }

      const newStory = await storyService.createStory(formData)
      dispatch(createStorySuccess(newStory))

      if (onSuccess) onSuccess()
      handleClose()
    } catch (err) {
      setError(err.message || 'Failed to create story')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setPreview(null)
    setCaption('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/65" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl overflow-hidden w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <button onClick={handleClose} className="text-sm">Cancel</button>
          <h2 className="font-semibold">Create Story</h2>
          {preview && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="text-[#0095F6] font-semibold text-sm disabled:opacity-50"
            >
              {loading ? 'Sharing...' : 'Share'}
            </button>
          )}
          {!preview && <div className="w-12" />}
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {!preview ? (
            // Select file
            <div className="h-[400px] flex flex-col items-center justify-center gap-4 p-8">
              <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xl">Add to your story</p>
              <p className="text-gray-500 text-sm">Stories disappear after 24 hours</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#0095F6] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-[#1877F2]"
              >
                Select Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          ) : (
            // Preview and caption
            <div className="flex h-[400px]">
              {/* Image preview */}
              <div className="w-1/2 bg-black flex items-center justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Caption */}
              <div className="w-1/2 p-4 flex flex-col">
                <textarea
                  placeholder="Add a caption (optional)..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={500}
                  className="flex-1 resize-none outline-none text-sm"
                />
                <div className="text-right text-xs text-gray-400">
                  {caption.length}/500
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default CreateStoryModal
