import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { getApiBaseUrl } from '@/config/server'

export const TOKEN_KEY = 'busbook_token'

const client = axios.create({
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

client.interceptors.request.use(async (config) => {
  config.baseURL = await getApiBaseUrl()

  const token = await SecureStore.getItemAsync(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let onUnauthorized = null
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync(TOKEN_KEY)
      if (onUnauthorized) onUnauthorized()
    }
    return Promise.reject(error)
  }
)

export default client