// Central level-aware selector for kanji chapter data, mirroring vocab.ts's
// pattern -- pages should import from here instead of reaching into
// src/data/n5/kanji.json or src/data/n4/kanji.json directly.
import type { KanjiChapter } from "@/types"
import type { Level } from "@/store/settings-store"
import n5KanjiJson from "@/data/n5/kanji.json"
import n4KanjiJson from "@/data/n4/kanji.json"

export const n5KanjiChapters = n5KanjiJson.chapters as KanjiChapter[]
export const n4KanjiChapters = n4KanjiJson.chapters as KanjiChapter[]
export const allKanjiChapters: KanjiChapter[] = [...n5KanjiChapters, ...n4KanjiChapters]

export function getKanjiChapters(level: Level): KanjiChapter[] {
  if (level === "N5") return n5KanjiChapters
  if (level === "N4") return n4KanjiChapters
  return allKanjiChapters
}
