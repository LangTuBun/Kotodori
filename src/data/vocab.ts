// Central level-aware loader for vocabulary data. Each JLPT level lives in
// its own dynamic-import chunk, so a learner on N5 never downloads or parses
// the N4 list (and vice versa). Pages read it through useVocab(); the
// module itself is cheap to import statically (no JSON).
import type { VocabEntry } from "@/types"
import type { Level } from "@/store/settings-store"
import { kanaToRomaji } from "@/lib/romaji"
import { useLevelData } from "@/lib/useLevelData"

const loaded = new Map<Level, VocabEntry[]>()
const inflight = new Map<Level, Promise<VocabEntry[]>>()

// Pre-computed romaji per entry, filled in as each level loads. The
// per-keystroke search filter does an O(1) Map.get() here instead of running
// kanaToRomaji() (character-by-character conversion) on every entry.
const romaji = new Map<string, string>()

/** Lowercased romaji of an entry's kana; O(1) once its level has loaded. */
export function romajiOf(v: VocabEntry): string {
  let r = romaji.get(v.id)
  if (r === undefined) {
    r = kanaToRomaji(v.kana).toLowerCase()
    romaji.set(v.id, r)
  }
  return r
}

function importLevel(level: 'N5' | 'N4'): Promise<VocabEntry[]> {
  return (level === 'N5' ? import("@/data/n5/vocabulary.json") : import("@/data/n4/vocabulary.json"))
    .then(m => {
      const entries = m.default as VocabEntry[]
      for (const v of entries) romajiOf(v)
      return entries
    })
}

export function loadVocab(level: Level): Promise<VocabEntry[]> {
  const hit = loaded.get(level)
  if (hit) return Promise.resolve(hit)
  let p = inflight.get(level)
  if (!p) {
    p = (level === 'all'
      ? Promise.all([loadVocab('N5'), loadVocab('N4')]).then(([a, b]) => [...a, ...b])
      : importLevel(level)
    ).then(entries => {
      loaded.set(level, entries)
      inflight.delete(level)
      return entries
    }, err => {
      inflight.delete(level)
      throw err
    })
    inflight.set(level, p)
  }
  return p
}

function peekVocab(level: Level): VocabEntry[] | null {
  return loaded.get(level) ?? null
}

const EMPTY: readonly VocabEntry[] = []

/** Vocabulary for `level`; an empty (stable) array until its chunk arrives. */
export function useVocab(level: Level): readonly VocabEntry[] {
  return useLevelData(level, peekVocab, loadVocab) ?? EMPTY
}
