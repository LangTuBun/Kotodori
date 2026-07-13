// Resolves the "doubled kana" cluster in vocabulary.json flagged in
// handoff.md (e.g. 名前 -> おなまえなまえ).
//
// A generic repeated-substring scan (any kana string containing a block
// immediately followed by an identical copy of itself, length >= 2) found
// 10 candidates, not ~17 — most of the originally-flagged entries were
// already resolved as a side effect of last session's duplicate cleanup.
// Of the 10, 7 are legitimate Japanese reduplicated words (giongo/gitaigo
// and adverbs like もしもし, そろそろ, 全然/ぜんぜん, 色々/いろいろ) where the
// repetition is the correct reading, not corruption — left untouched.
//
// Only 3 are genuine bugs, hand-verified:
// - n5_0018 名前: kana was "おなまえなまえ" (stray お prefix + なまえ doubled).
//   Corrected against ordinary N5 knowledge (名前 is unambiguously なまえ) —
//   not in TuVung_N5_DungMori.md, which only covers the separate DungMori
//   word list, not this word's original PDF source.
// - n5_0073 あの: kana was "あのあのー" (doubled + stray trailing long-vowel
//   mark not present in the kanji field). Corrected to match kanji exactly.
//   Also not in the DungMori md.
// - n5_0848 ふわふわ: kana was "ふわふわふわふわ" (the naturally-reduplicated
//   word repeated twice over). Verified against TuVung_N5_DungMori.md line 94
//   ("ふわふわ", chapter 13, matching this entry's existing chapter).
//
// n5_1018's doubled kana (from the chapter-0 cluster, fixed by
// fix-chapter-zero.mjs first) is handled here too, since it's the same bug
// class: "じはんきじどうはんばいき" concatenates the abbreviation's own
// reading with its full-form gloss's reading — kept only the abbreviation's
// own reading, since the parenthetical is an explanatory gloss, not part of
// how 自販機 itself is pronounced.
//
// Exact-match guarded: a stale kana value fails loudly instead of silently
// double-patching.

import { readFileSync, writeFileSync } from 'node:fs'

const path = new URL('../src/data/n5/vocabulary.json', import.meta.url)
const vocab = JSON.parse(readFileSync(path, 'utf-8'))

// id -> [expectedOldKana, newKana]
const KANA_FIXES = {
  n5_0018: ['おなまえなまえ', 'なまえ'],
  n5_0073: ['あのあのー', 'あの'],
  n5_0848: ['ふわふわふわふわ', 'ふわふわ'],
  n5_1018: ['じはんきじどうはんばいき', 'じはんき'],
}

const misses = []
let applied = 0
for (const [id, [expected, replacement]] of Object.entries(KANA_FIXES)) {
  const v = vocab.find(x => x.id === id)
  if (!v || v.kana !== expected) {
    misses.push({ id, expected, actual: v && v.kana })
    continue
  }
  v.kana = replacement
  applied++
}

if (misses.length > 0) {
  console.error('MISMATCHES (not applied) — mapping is stale, re-check:')
  for (const m of misses) console.error(' ', m.id, 'expected:', JSON.stringify(m.expected), 'actual:', JSON.stringify(m.actual))
  process.exit(1)
}

writeFileSync(path, JSON.stringify(vocab, null, 2) + '\n', 'utf-8')
console.log(`Applied ${applied}/${Object.keys(KANA_FIXES).length} doubled-kana fixes to vocabulary.json.`)
