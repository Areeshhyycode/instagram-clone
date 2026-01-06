import { API_BASE_URL, AUTH_TOKEN_KEY } from '../config/constants'

// Create a base API instance with common configuration
const api = {
  // Get auth token from localStorage
  getToken: () => localStorage.getItem(AUTH_TOKEN_KEY),

  // Common headers
  getHeaders: () => ({
    'Content-Type': 'application/json',
    ...(api.getToken() && { Authorization: `Bearer ${api.getToken()}` }),
  }),

  // GET request
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: api.getHeaders(),
    })
    if (!response.ok) throw new Error(response.statusText)
    return response.json()
  },

  // POST request
  post: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: api.getHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || response.statusText)
    }
    return response.json()
  },

  // PUT request
  put: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: api.getHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error(response.statusText)
    return response.json()
  },

  // DELETE request
  delete: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: api.getHeaders(),
    })
    if (!response.ok) throw new Error(response.statusText)
    return response.json()
  },
}

export default api
