import axios from 'axios'
import useAuthStore from '@/store/authStore'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Attach token to every request
client.interceptors.request.use(config => {
  const token = localStorage.getItem('busbook_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors globally
client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      try {
        useAuthStore.getState().clearAuth()
      } catch (e) {
        localStorage.removeItem('busbook_token')
      }
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

export default client