import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Locale } from "@/lib/i18n"

export type Theme = 'brutalism' | 'neobrutalism'

interface SettingsStore {
  lang: Locale
  setLang: (lang: Locale) => void
  toggleLang: () => void
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      lang: 'vi',
      setLang: (lang) => set({ lang }),
      toggleLang: () => set({ lang: get().lang === 'vi' ? 'en' : 'vi' }),
      theme: 'brutalism',
      setTheme: (theme) => {
        document.documentElement.dataset.theme = theme
        set({ theme })
      },
      toggleTheme: () => {
        const theme = get().theme === 'brutalism' ? 'neobrutalism' : 'brutalism'
        document.documentElement.dataset.theme = theme
        set({ theme })
      },
    }),
    {
      name: 'kotodori-settings',
      onRehydrateStorage: () => (state) => {
        if (state) document.documentElement.dataset.theme = state.theme
      },
    }
  )
)
