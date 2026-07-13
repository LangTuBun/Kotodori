import { useTranslation } from "@/lib/useTranslation"
import type { Locale } from "@/lib/i18n"

const OPTIONS: { value: Locale; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'vi', label: 'VI' },
]

export function LanguageSwitcher() {
  const { lang, setLang } = useTranslation()

  return (
    <div role="group" aria-label="Language" className="inline-flex border-2 border-ink">
      {OPTIONS.map(({ value, label }, i) => (
        <button
          key={value}
          type="button"
          aria-pressed={lang === value}
          onClick={() => setLang(value)}
          className={`px-2.5 py-1 text-xs font-black uppercase tracking-wider cursor-pointer transition-colors ${
            i > 0 ? 'border-l-2 border-ink' : ''
          } ${lang === value ? 'bg-ink text-paper' : 'bg-paper hover:bg-surface'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
