// Check if profilePic is a valid local upload path
export const isValidProfilePic = (profilePic) => {
  return profilePic && profilePic.startsWith('/uploads/')
}

// Get full URL for profile picture
export const getProfilePicUrl = (profilePic) => {
  if (!isValidProfilePic(profilePic)) return null
  return `http://localhost:8000${profilePic}`
}
