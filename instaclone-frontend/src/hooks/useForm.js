import { useState } from 'react'

// Custom hook for form handling
const useForm = (initialValues, validate) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e, onSubmit) => {
    e.preventDefault()

    // Validate if validation function provided
    if (validate) {
      const validationErrors = validate(values)
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }
    }

    setLoading(true)
    try {
      await onSubmit(values)
    } catch (error) {
      setErrors({ general: error.message })
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
  }

  return {
    values,
    errors,
    loading,
    handleChange,
    handleSubmit,
    setErrors,
    reset,
  }
}

export default useForm
