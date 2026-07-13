import { useSettingsStore } from "@/store/settings-store"
import { t as translate, localize as localizeMeaning } from "@/lib/i18n"

export function useTranslation() {
  const lang = useSettingsStore(s => s.lang)
  const toggleLang = useSettingsStore(s => s.toggleLang)
  const setLang = useSettingsStore(s => s.setLang)

  return {
    lang,
    setLang,
    toggleLang,
    t: (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    localize: (meanings: { vi: string; en: string } | undefined | null) => localizeMeaning(meanings, lang),
  }
}
