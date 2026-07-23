import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: false,

      toggleTheme: () => {
        const next = !get().isDark
        document.documentElement.classList.toggle('dark', next)
        set({ isDark: next })
      },

      initTheme: () => {
        const { isDark } = get()
        document.documentElement.classList.toggle('dark', isDark)
      },
    }),
    { name: 'busbook_theme' }
  )
)

export default useThemeStore