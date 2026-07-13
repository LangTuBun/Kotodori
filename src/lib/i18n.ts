import en from "@/locales/en.json"
import vi from "@/locales/vi.json"

export type Locale = 'en' | 'vi'

const dict: Record<Locale, unknown> = { en, vi }

function lookup(obj: unknown, path: string[]): string | undefined {
  let cur: unknown = obj
  for (const key of path) {
    if (typeof cur !== 'object' || cur === null) return undefined
    cur = (cur as Record<string, unknown>)[key]
  }
  return typeof cur === 'string' ? cur : undefined
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name) => {
    const value = vars[name]
    return value === undefined ? match : String(value)
  })
}

// Dot-path lookup (e.g. "review.rating.again") into the active locale, falling
// back to Vietnamese (the only fully-populated locale today), then to the raw
// key itself so a missing translation is visible instead of silently blank.
export function t(lang: Locale, key: string, vars?: Record<string, string | number>): string {
  const path = key.split('.')
  const raw = lookup(dict[lang], path) ?? lookup(dict.vi, path) ?? key
  return interpolate(raw, vars)
}

// Vocab/grammar content fields use { vi, en } — en is "" (present, not
// undefined) on essentially all entries today, so this must be a truthy
// check (||), not ?? — otherwise English mode would render blank content.
export function localize(meanings: { vi: string; en: string } | undefined | null, lang: Locale): string {
  if (!meanings) return ''
  return meanings[lang] || meanings.vi
}
