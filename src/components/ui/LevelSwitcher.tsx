import { useSettingsStore, type Level } from "@/store/settings-store"

const OPTIONS: { value: Level; label: string }[] = [
  { value: 'N5', label: 'N5' },
  { value: 'N4', label: 'N4' },
  { value: 'all', label: 'N5+N4' },
]

export function LevelSwitcher() {
  const { level, setLevel } = useSettingsStore()

  return (
    <div role="group" aria-label="JLPT level" className="inline-flex bg-surface rounded-[9px] p-0.5 gap-0.5">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={level === value}
          onClick={() => setLevel(value)}
          className={`px-2.5 py-1 rounded-[7px] text-xs cursor-pointer transition-[color,background-color,box-shadow,transform] duration-200 active:scale-95 ${level === value ? 'bg-[var(--tori-seg-pill)] text-ink font-semibold shadow-[0_1px_3px_rgb(0_0_0/0.12)]' : 'font-medium text-muted hover:text-ink'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
