import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Locale } from "@/lib/i18n"

export type Level = 'N5' | 'N4' | 'all'
export type Paper = 'washi' | 'sumi' | 'gold'
export type Density = 'compact' | 'normal' | 'sparse'

interface SettingsStore {
  lang: Locale
  setLang: (lang: Locale) => void
  toggleLang: () => void
  level: Level
  setLevel: (level: Level) => void
  paper: Paper
  setPaper: (paper: Paper) => void
  density: Density
  setDensity: (density: Density) => void
  typeSans: boolean
  setTypeSans: (typeSans: boolean) => void
}

const PAPER_CLASS: Record<Paper, string> = {
  washi: '', sumi: 'theme-sumi', gold: 'theme-gold',
}
const ALL_PAPER_CLASSES = Object.values(PAPER_CLASS).filter(Boolean)

function applyPaper(paper: Paper) {
  const h = document.documentElement
  h.classList.add('theme-transition')
  h.classList.remove(...ALL_PAPER_CLASSES)
  const cls = PAPER_CLASS[paper]
  if (cls) h.classList.add(cls)
  window.setTimeout(() => h.classList.remove('theme-transition'), 260)
}

function applyDensity(density: Density) {
  const h = document.documentElement
  h.classList.remove('density-compact', 'density-sparse')
  if (density !== 'normal') h.classList.add('density-' + density)
}

function applyTypeSans(typeSans: boolean) {
  document.documentElement.classList.toggle('type-sans', typeSans)
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      lang: 'vi',
      setLang: (lang) => set({ lang }),
      toggleLang: () => set({ lang: get().lang === 'vi' ? 'en' : 'vi' }),
      level: 'N5',
      setLevel: (level) => set({ level }),
      paper: 'washi',
      setPaper: (paper) => {
        applyPaper(paper)
        set({ paper })
      },
      density: 'normal',
      setDensity: (density) => {
        applyDensity(density)
        set({ density })
      },
      typeSans: false,
      setTypeSans: (typeSans) => {
        applyTypeSans(typeSans)
        set({ typeSans })
      },
    }),
    {
      name: 'tori-settings',
      // Themes were trimmed to three; anyone who had picked a removed one
      // (matcha, sakura, dusk...) falls back to Washi instead of keeping a
      // paper id that no longer maps to any CSS.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<SettingsStore>
        const paper = saved.paper && saved.paper in PAPER_CLASS ? saved.paper : 'washi'
        return { ...current, ...saved, paper }
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return
        applyPaper(state.paper)
        applyDensity(state.density)
        applyTypeSans(state.typeSans)
      },
    }
  )
)
