// Central level-aware selector for vocabulary data. Pages/stores should
// import from here instead of reaching into src/data/n5/vocabulary.json or
// src/data/n4/vocabulary.json directly, so the N5/N4 split stays a
// one-place concern rather than something every consumer re-derives.
import type { VocabEntry } from "@/types"
import type { Level } from "@/store/settings-store"
import n5VocabJson from "@/data/n5/vocabulary.json"
import n4VocabJson from "@/data/n4/vocabulary.json"

export const n5Vocab = n5VocabJson as VocabEntry[]
export const n4Vocab = n4VocabJson as VocabEntry[]
export const allVocab: VocabEntry[] = [...n5Vocab, ...n4Vocab]

export function vocabForLevel(level: Level): VocabEntry[] {
  if (level === "N5") return n5Vocab
  if (level === "N4") return n4Vocab
  return allVocab
}
