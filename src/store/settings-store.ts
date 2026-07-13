import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Locale } from "@/lib/i18n"

interface SettingsStore {
  lang: Locale
  setLang: (lang: Locale) => void
  toggleLang: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      lang: 'vi',
      setLang: (lang) => set({ lang }),
      toggleLang: () => set({ lang: get().lang === 'vi' ? 'en' : 'vi' }),
    }),
    { name: 'kotodori-settings' }
  )
)
