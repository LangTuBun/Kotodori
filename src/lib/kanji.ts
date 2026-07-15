import kanjiJson from "@/data/n5/kanji.json"
import hanVietDictionary from "@/data/hanviet-dictionary.json"
import type { KanjiChapter } from "@/types"

export const MAX_READINGS_SHOWN = 4

export const ACCENTS = ['yellow', 'blue', 'red', 'green'] as const
export const ACCENT_HEX: Record<string, string> = {
  yellow: 'var(--color-yellow)', blue: 'var(--color-blue)', red: 'var(--color-red)', green: 'var(--color-green)',
}
export function accentFor(i: number) {
  return ACCENTS[i % ACCENTS.length]
}

const KANJI_CHAR_RE = /[一-鿿㐀-䶿々]/

// kanji.json only stores Hán Việt per *word* (e.g. "四日" -> "Tứ Nhật"), not
// per character. But each word's hanviet is a space-separated reading per
// kanji character in that word (kana/okurigana contribute no syllable), so
// zipping the word's kanji-only characters against its split hanviet
// recovers a per-character index. Mismatched counts (rare hanviet
// annotations that aren't a clean 1:1 split) are skipped rather than
// guessed. This only covers ~355/635 kanji (whatever appears in kanji.json);
// hanviet-dictionary.json is the primary, curated-for-full-coverage source
// (see scripts note in that file's generation) and is checked first.
function buildHanVietIndex(): Record<string, string> {
  const map: Record<string, string> = {}
  const consider = (kanji: string | null | undefined, hanviet: string | null | undefined) => {
    if (!kanji || !hanviet) return
    const chars = [...kanji].filter(ch => KANJI_CHAR_RE.test(ch))
    const syllables = hanviet.trim().split(/\s+/).filter(Boolean)
    if (chars.length === 0 || chars.length !== syllables.length) return
    chars.forEach((ch, i) => { if (!(ch in map)) map[ch] = syllables[i] })
  }
  for (const chapter of kanjiJson.chapters as KanjiChapter[]) {
    for (const group of chapter.groups) {
      consider(group.anchor, group.hanviet)
      for (const word of group.words) consider(word.kanji, word.hanviet)
    }
  }
  return map
}

const HANVIET_INDEX = buildHanVietIndex()
const HANVIET_DICTIONARY = hanVietDictionary as Record<string, string>

export function hanVietForChar(char: string): string | undefined {
  return HANVIET_DICTIONARY[char] ?? HANVIET_INDEX[char]
}

export function onkunTone(onkun: string): string {
  if (onkun.includes('Juku') || onkun.includes('Ate')) return '#9333ea'
  const hasOn = onkun.includes('On')
  const hasKun = onkun.includes('Kun')
  if (hasOn && hasKun) return 'var(--color-muted)'
  if (hasOn) return 'var(--color-blue)'
  return 'var(--color-green)'
}

// kanjiapi.dev marks bound-form readings with a leading/trailing "-"
// (e.g. "-あ.がり", "うわ-"); strip that for display and dedupe.
export function cleanReadings(readings: string[], limit: number = MAX_READINGS_SHOWN): { shown: string[]; extra: number } {
  const cleaned = [...new Set(readings.map(r => r.replace(/^-|-$/g, '')))]
  return { shown: cleaned.slice(0, limit), extra: Math.max(0, cleaned.length - limit) }
}
