import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { TOKEN_KEY } from '@/api/client'

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  hydrated: false,

  hydrate: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY)
    const userRaw = await SecureStore.getItemAsync('busbook_user')
    set({
      token: token ?? null,
      user: userRaw ? JSON.parse(userRaw) : null,
      hydrated: true,
    })
  },

  setAuth: async (user, token) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token)
    await SecureStore.setItemAsync('busbook_user', JSON.stringify(user))
    set({ user, token })
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    await SecureStore.deleteItemAsync('busbook_user')
    set({ user: null, token: null })
  },

  updateUser: async (user) => {
    await SecureStore.setItemAsync('busbook_user', JSON.stringify(user))
    set({ user })
  },
}))

export default useAuthStore