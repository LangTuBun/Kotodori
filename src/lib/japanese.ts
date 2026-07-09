export function hasKanji(s: string): boolean {
  return /[一-鿿]/.test(s)
}

export function hasKana(s: string): boolean {
  return /[぀-ヿ]/.test(s)
}

export function isKanaOnly(s: string): boolean {
  return hasKana(s) && !hasKanji(s)
}

export function getPosLabel(pos: string, _verbGroup?: number | null): string {
  const map: Record<string, string> = {
    'noun': 'N', 'verb-group1': 'V1', 'verb-group2': 'V2', 'verb-group3': 'V3',
    'adj-i': 'i-adj', 'adj-na': 'na-adj', 'adverb': 'Adv', 'pronoun': 'Pron',
    'conjunction': 'Conj', 'expression': 'Exp', 'interjection': 'Int',
    'suffix': 'Suf', 'determiner': 'Det', 'unknown': '?',
  }
  return map[pos] ?? pos
}

export function getPosColor(pos: string): string {
  if (pos.startsWith('verb')) return 'bg-blue-500'
  if (pos.startsWith('adj')) return 'bg-green-500'
  if (pos === 'noun') return 'bg-yellow-400'
  if (pos === 'adverb') return 'bg-purple-400'
  return 'bg-gray-400'
}

export function formatReading(kanji: string, kana: string): { type: 'ruby' | 'kana'; display: string; reading?: string } {
  if (!kanji || kanji === kana) return { type: 'kana', display: kana || kanji }
  if (hasKanji(kanji)) return { type: 'ruby', display: kanji, reading: kana }
  return { type: 'kana', display: kanji }
}
