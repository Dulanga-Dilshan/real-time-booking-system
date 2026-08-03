import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: false,
      toggleTheme: () => set({ isDark: !get().isDark }),
    }),
    {
      name: 'busbook_theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

export default useThemeStore