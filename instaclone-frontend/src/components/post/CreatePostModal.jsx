import { useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { addPost } from '../../store/slices/postSlice'
import postService from '../../services/postService'

const CreatePostModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const fileInputRef = useRef(null)

  const [step, setStep] = useState(1) // 1: select, 2: preview, 3: caption
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
      setStep(2)
      setError('')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
      setStep(2)
      setError('')
    } else {
      setError('Please drop an image file')
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('caption', caption)

      const newPost = await postService.createPost(formData)
      dispatch(addPost(newPost))
      handleClose()
    } catch (err) {
      setError(err.message || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setSelectedFile(null)
    setPreview(null)
    setCaption('')
    setError('')
    onClose()
  }

  const goBack = () => {
    if (step === 2) {
      setSelectedFile(null)
      setPreview(null)
      setStep(1)
    } else if (step === 3) {
      setStep(2)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/65"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl overflow-hidden w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#DBDBDB]">
          {step > 1 ? (
            <button onClick={goBack}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div className="w-6" />
          )}
          <h2 className="font-semibold">
            {step === 1 && 'Create new post'}
            {step === 2 && 'Crop'}
            {step === 3 && 'Create new post'}
          </h2>
          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="text-[#0095F6] font-semibold"
            >
              Next
            </button>
          )}
          {step === 3 && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="text-[#0095F6] font-semibold disabled:opacity-50"
            >
              {loading ? 'Sharing...' : 'Share'}
            </button>
          )}
          {step === 1 && <div className="w-6" />}
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {/* Step 1: Select file */}
          {step === 1 && (
            <div
              className="h-[400px] flex flex-col items-center justify-center gap-4 p-8"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xl">Drag photos and videos here</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#0095F6] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#1877F2] transition-colors"
              >
                Select from computer
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
          )}

          {/* Step 2: Preview */}
          {step === 2 && preview && (
            <div className="h-[400px] bg-black flex items-center justify-center">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}

          {/* Step 3: Caption */}
          {step === 3 && (
            <div className="flex h-[400px]">
              {/* Image preview */}
              <div className="w-1/2 bg-black flex items-center justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Caption input */}
              <div className="w-1/2 p-4">
                <textarea
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={2200}
                  className="w-full h-40 resize-none outline-none text-sm"
                />
                <div className="text-right text-xs text-gray-400">
                  {caption.length}/2,200
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

export default CreatePostModal
