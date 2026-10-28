import { useTranslation } from "@/lib/useTranslation"
import type { Locale } from "@/lib/i18n"

const OPTIONS: { value: Locale; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'vi', label: 'VI' },
]

export function LanguageSwitcher() {
  const { lang, setLang } = useTranslation()

  return (
    <div role="group" aria-label="Language" className="inline-flex bg-surface rounded-[9px] p-0.5 gap-0.5">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={lang === value}
          onClick={() => setLang(value)}
          className={`px-2.5 py-1 rounded-[7px] text-xs cursor-pointer transition-[color,background-color,box-shadow,transform] duration-200 active:scale-95 ${lang === value ? 'bg-[var(--tori-seg-pill)] text-ink font-semibold shadow-[0_1px_3px_rgb(0_0_0/0.12)]' : 'font-medium text-muted hover:text-ink'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
