import { useCallback } from "react"
import { useSettingsStore } from "@/store/settings-store"
import { t as translate, localize as localizeMeaning } from "@/lib/i18n"

export function useTranslation() {
  const lang = useSettingsStore(s => s.lang)
  const toggleLang = useSettingsStore(s => s.toggleLang)
  const setLang = useSettingsStore(s => s.setLang)

  // Stable per-`lang` (not a fresh closure every render) -- callers put
  // these in useMemo/useEffect dependency arrays (e.g. VocabBrowser's and
  // Grammar's search filters), and an unstable reference there defeats the
  // memoization, re-filtering the whole dataset on every render instead of
  // only when something that affects the result actually changed.
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang]
  )
  const localize = useCallback(
    (meanings: { vi: string; en: string } | undefined | null) => localizeMeaning(meanings, lang),
    [lang]
  )

  return { lang, setLang, toggleLang, t, localize }
}
