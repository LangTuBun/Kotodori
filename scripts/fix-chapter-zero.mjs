// Resolves the "chapter: 0" cluster in vocabulary.json (the remaining tail
// of the same botched TuVung_N5_DungMori.md double-import that
// rebuild-dungmori-block.mjs mostly cleaned up last session — most of the
// original ~56 chapter:0 entries were already deleted or repaired as
// duplicates in that pass, leaving these 12).
//
// Each entry was cross-referenced against ../../TuVung_N5_DungMori.md by
// hand: some are legitimate standalone words the source lists at a specific
// chapter (CHAPTER_FIXES — just a routing fix), and two turned out to be
// malformed duplicates of an already-correct entry elsewhere (DELETE_IDS).
//
// n5_1018 needs both a chapter fix and (separately) a doubled-kana repair —
// the kana half is handled by fix-doubled-kana.mjs, which is meant to run
// after this script.
//
// Exact-match guarded like the previous session's scripts: a stale
// kanji/kana/chapter triple fails loudly instead of silently double-patching.

import { readFileSync, writeFileSync } from 'node:fs'

const path = new URL('../src/data/n5/vocabulary.json', import.meta.url)
const vocab = JSON.parse(readFileSync(path, 'utf-8'))

// id -> [expectedKanji, expectedKana, expectedOldChapter, newChapter]
const CHAPTER_FIXES = {
  // ふるさと (quê hương) is listed in the MD source as its own entry
  // alongside 故郷 (already present as n5_0532) — chapter 8, not a duplicate.
  n5_0973: ['ふるさと', '', 0, 8],
  // CM (quảng cáo) is a distinct word from 広告 (n5_0734, already present) —
  // chapter 7.
  n5_0987: ['CM', '', 0, 7],
  // CD — chapter 2.
  n5_0991: ['CD', '', 0, 2],
  // DVD — chapter 8.
  n5_0994: ['DVD', '', 0, 8],
  // SF (khoa học viễn tưởng) — chapter 14.
  n5_1090: ['SF', '', 0, 14],
  // どのぐらい is listed in the MD source as its own spelling-variant entry
  // alongside どのくらい — chapter 7.
  n5_1106: ['どのぐらい', '', 0, 7],
  // ATM — chapter 10.
  n5_1110: ['ATM', '', 0, 10],
  // （～年、～日）前 already has correct kanji/kana from last session's
  // rebuild-dungmori-block.mjs; only the chapter was left at 0 — chapter 14.
  n5_1116: ['（～年、～日）前', 'としひまえ', 0, 14],
  // 自販機(自動販売機） is a distinct abbreviation entry in the MD source
  // (separate from 自動販売機, n5_0995) — chapter 14. Its doubled kana is
  // fixed separately by fix-doubled-kana.mjs.
  n5_1018: ['自販機(自動販売機）', 'じはんきじどうはんばいき', 0, 14],
}

const DELETE_IDS = new Set([
  // exact duplicate of n5_0123 二十日/はつか (same kanji, same meaning)
  'n5_0982',
  // "đây" isn't Japanese; meaning "nhưng" (but) is already correctly
  // covered by n5_0205 でも — this entry is unrecoverable and redundant.
  'n5_1096',
  // 何 with doubled kana なんなに duplicates two already-separate, correct
  // entries: n5_0087 何/なん and n5_0244 何/なに.
  'n5_1100',
])

const misses = []
for (const [id, [kanji, kana, oldChapter, newChapter]] of Object.entries(CHAPTER_FIXES)) {
  const v = vocab.find(x => x.id === id)
  if (!v || v.kanji !== kanji || v.kana !== kana || v.chapter !== oldChapter) {
    misses.push({ id, expected: { kanji, kana, chapter: oldChapter }, actual: v && { kanji: v.kanji, kana: v.kana, chapter: v.chapter } })
    continue
  }
  v.chapter = newChapter
}

const missingDeletes = [...DELETE_IDS].filter(id => !vocab.some(v => v.id === id && v.chapter === 0))
if (misses.length || missingDeletes.length) {
  console.error('MISMATCHES (aborting) — mapping is stale, re-check:')
  for (const m of misses) console.error(' ', m.id, 'expected:', JSON.stringify(m.expected), 'actual:', JSON.stringify(m.actual))
  for (const id of missingDeletes) console.error(' ', id, 'not found with chapter 0')
  process.exit(1)
}

const before = vocab.length
const kept = vocab.filter(v => !DELETE_IDS.has(v.id))

writeFileSync(path, JSON.stringify(kept, null, 2) + '\n', 'utf-8')
console.log(`Fixed chapter on ${Object.keys(CHAPTER_FIXES).length} entries, deleted ${DELETE_IDS.size} malformed duplicates.`)
console.log(`vocabulary.json: ${before} -> ${kept.length} entries.`)
