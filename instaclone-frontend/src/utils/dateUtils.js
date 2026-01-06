// Format date to "X time ago" format
export const formatDistanceToNow = (date) => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now - past) / 1000)

  if (diffInSeconds < 60) {
    return 'just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`
  }

  // If older than 4 weeks, show the date
  return past.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}
