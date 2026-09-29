import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useSettingsStore } from '@/store/settings-store'
import { loadVocab } from '@/data/vocab'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Once the first paint has settled, quietly load the *other* level's vocab so
// switching level later is instant (no empty flash). Vocab only -- the grammar
// and kanji-stroke chunks are large enough that parsing them mid-session
// could itself cause a hitch, so they stay on-demand.
const prefetchOtherLevel = () => {
  const other = useSettingsStore.getState().level === 'N4' ? 'N5' : 'N4'
  loadVocab(other).catch(() => {})
}
// setTimeout rather than requestIdleCallback: iOS Safari doesn't implement it.
window.setTimeout(prefetchOtherLevel, 4000)
