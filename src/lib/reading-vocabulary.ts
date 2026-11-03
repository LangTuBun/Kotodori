import type { VocabEntry } from '../types'

export interface ReadingWord { entry: VocabEntry; forms: string[] }
export interface ReadingWordMatch { entry: VocabEntry; form: string; start: number; end: number }

export function matchReadingWords(text: string, dictionary: readonly ReadingWord[]): ReadingWordMatch[] {
  const boundaries = new Set([...new Intl.Segmenter('ja', { granularity: 'word' }).segment(text)].map(s => s.index))
  const candidates: ReadingWordMatch[] = []
  for (const { entry, forms } of dictionary) {
    for (const form of forms) {
      if (form.length < 2) continue
      let start = text.indexOf(form)
      while (start !== -1) {
        // Kana substrings inside another word are not reliable dictionary hits.
        if (/[一-鿿]/.test(form) || boundaries.has(start)) candidates.push({ entry, form, start, end: start + form.length })
        start = text.indexOf(form, start + form.length)
      }
    }
  }
  const matches: ReadingWordMatch[] = []
  const seen = new Set<string>()
  for (const match of candidates.sort((a, b) => b.form.length - a.form.length || a.start - b.start)) {
    const key = `${match.entry.kanji}:${match.entry.kana}`
    if (seen.has(key) || matches.some(m => m.start < match.end && match.start < m.end)) continue
    seen.add(key)
    matches.push(match)
  }
  return matches.sort((a, b) => a.start - b.start)
}
