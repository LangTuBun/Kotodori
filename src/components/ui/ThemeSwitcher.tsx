import { useSettingsStore, type Theme } from "@/store/settings-store"

const OPTIONS: { value: Theme; label: string }[] = [
  { value: 'brutalism', label: 'RAW' },
  { value: 'neobrutalism', label: 'NEO' },
]

export function ThemeSwitcher() {
  const theme = useSettingsStore(s => s.theme)
  const setTheme = useSettingsStore(s => s.setTheme)

  return (
    <div role="group" aria-label="Theme" className="inline-flex border-2 border-ink rounded-[var(--radius-sm)] overflow-hidden">
      {OPTIONS.map(({ value, label }, i) => (
        <button
          key={value}
          type="button"
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className={`px-2.5 py-1 font-mono text-xs font-black uppercase tracking-wider cursor-pointer transition-colors ${
            i > 0 ? 'border-l-2 border-ink' : ''
          } ${theme === value ? 'bg-ink text-paper' : 'bg-paper hover:bg-surface'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
