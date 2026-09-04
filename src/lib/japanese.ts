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

// -- Pitch accent (see components/ui/PitchAccent.tsx) -----------------------

export type PitchAccentType = 'heiban' | 'atamadaka' | 'nakadaka' | 'odaka'

// Small kana (ゃゅょぁぃぅぇぉゎ + katakana equivalents) attach to the
// preceding character rather than forming their own mora; ん/っ/ー are each
// their own mora like any other.
const SMALL_KANA = /[ぁぃぅぇぉゃゅょゎァィゥェォャュョヮ]/

export function splitMorae(kana: string): string[] {
  const morae: string[] = []
  for (const ch of kana) {
    if (SMALL_KANA.test(ch) && morae.length > 0) {
      morae[morae.length - 1] += ch
    } else {
      morae.push(ch)
    }
  }
  return morae
}

// Per-mora H/L levels for a standard Tokyo-dialect pitch pattern, plus the
// level of the mora right after the word (e.g. a following particle) --
// that's what actually distinguishes heiban (stays high) from odaka (drops),
// since both are "no drop within the word itself".
export function pitchLevels(moraCount: number, pitch: number): { levels: ('H' | 'L')[]; afterLevel: 'H' | 'L' } {
  const levels: ('H' | 'L')[] = []
  for (let i = 1; i <= moraCount; i++) {
    if (pitch === 0) levels.push(i === 1 ? 'L' : 'H')
    else if (pitch === 1) levels.push(i === 1 ? 'H' : 'L')
    else levels.push(i === 1 ? 'L' : i <= pitch ? 'H' : 'L')
  }
  return { levels, afterLevel: pitch === 0 ? 'H' : 'L' }
}

export function classifyPitchType(pitch: number, moraCount: number): PitchAccentType {
  if (pitch === 0) return 'heiban'
  if (pitch === 1) return 'atamadaka'
  if (pitch === moraCount) return 'odaka'
  return 'nakadaka'
}
