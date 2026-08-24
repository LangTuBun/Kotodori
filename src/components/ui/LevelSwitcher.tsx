import { useSettingsStore, type Level } from "@/store/settings-store"

const OPTIONS: { value: Level; label: string }[] = [
  { value: 'N5', label: 'N5' },
  { value: 'N4', label: 'N4' },
  { value: 'all', label: 'N5+N4' },
]

export function LevelSwitcher() {
  const { level, setLevel } = useSettingsStore()

  return (
    <div role="group" aria-label="JLPT level" className="inline-flex border-2 border-ink rounded-[var(--radius-sm)] overflow-hidden">
      {OPTIONS.map(({ value, label }, i) => (
        <button
          key={value}
          type="button"
          aria-pressed={level === value}
          onClick={() => setLevel(value)}
          className={`px-2.5 py-1 font-mono text-xs font-black uppercase tracking-wider cursor-pointer transition-colors ${
            i > 0 ? 'border-l-2 border-ink' : ''
          } ${level === value ? 'bg-ink text-paper' : 'bg-paper hover:bg-surface'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
