import type { VocabEntry } from "@/types"

// N5 entries always carry a textbook chapter. N4 entries carry a chapter
// only where a chaptered source has backfilled one (currently Bài 15-24,
// see apply-n4-chapters.mjs) -- group those by chapter just like N5, and
// fall back to the thematic `category` for the rest (chapters 1-14 & 25-33,
// not sourced yet). As more N4 chapters get backfilled, more of the
// category buckets convert to chapter buckets over time.
export function groupKey(v: VocabEntry): string {
  if (v.chapter !== undefined && v.chapter > 0) return String(v.chapter)
  return v.category ?? '?'
}

// Chapter-number keys sort numerically and come first (matching N5's plain
// numeric ordering); category-name keys sort alphabetically after them;
// '?' (genuinely untagged) always comes last.
export function compareGroupKeys(a: string, b: string): number {
  if (a === '?') return 1
  if (b === '?') return -1
  const numA = Number(a)
  const numB = Number(b)
  const aIsChapter = a !== '' && !Number.isNaN(numA)
  const bIsChapter = b !== '' && !Number.isNaN(numB)
  if (aIsChapter && bIsChapter) return numA - numB
  if (aIsChapter) return -1
  if (bIsChapter) return 1
  return a.localeCompare(b)
}

export function isChapterKey(k: string): boolean {
  return k !== '' && k !== '?' && !Number.isNaN(Number(k))
}
