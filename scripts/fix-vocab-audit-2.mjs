// Second-pass data audit fixes for vocabulary.json, following on from
// fix-corrupted-suru-kanji.mjs. Three independent, hand-verified fix sets:
//
// 1. KANJI_FIXES — same corruption class as fix-corrupted-suru-kanji.mjs
//    (particle-collocation drill entries where the extractor kept only the
//    bracketed particle placeholder and dropped the verb's kanji+okurigana
//    entirely, e.g. "（～）間合" for 間に合う). These 6 have no clean
//    duplicate elsewhere in the file (unlike the ~61 in this same id range
//    that duplicate an already-correct sibling entry — see the separate
//    dedup pass), so they're repaired in place rather than deleted.
//
// 2. MEANING_FIXES — glued-space typos in meanings.vi found via a
//    systematic scan (same bug class as fix-glued-meanings.mjs, missed by
//    its original id list).
//
// 3. n5_0941 — genuinely truncated mid-sentence in the original PDF
//    extraction (kept the "￿" placeholder-corruption artifact too).
//    Completed using the parallel, uncorrupted sibling entry n5_1116
//    (same grammatical pattern, alternate ねん/にち vs とし/ひ reading),
//    whose meanings.vi is already complete and un-corrupted.

import { readFileSync, writeFileSync } from 'node:fs'

const path = new URL('../src/data/n5/vocabulary.json', import.meta.url)
const vocab = JSON.parse(readFileSync(path, 'utf-8'))

const KANJI_FIXES = {
  n5_1003: ['（～）気付', '気をつける'],
  n5_1033: ['勉強（）', '勉強します'],
  n5_1045: ['説明（）', '説明します'],
  n5_1062: ['（～）間合', '間に合う'],
  n5_1072: ['（～）持帰', '持って帰る'],
  n5_1076: ['（～）手伝', '手伝う'],
}

const MEANING_FIXES = {
  n5_0092: ['vậy thì, thếthì…', 'vậy thì, thế thì…'],
  n5_0250: ['nhất, sốmột', 'nhất, số một'],
  n5_0269: ['thật, sựthật', 'thật, sự thật'],
  n5_0437: ['đồvật', 'đồ vật'],
  n5_0767: ['vềđến', 'về đến'],
  n5_0950: ['giấy tờ, hồsơ', 'giấy tờ, hồ sơ'],
  n5_0941: ['∼trước (Trước ￿là từ chỉ khoảng', '∼trước (Trước 前 là từ chỉ khoảng thời gian)'],
}

let kanjiApplied = 0
let meaningApplied = 0
const misses = []

for (const v of vocab) {
  const kf = KANJI_FIXES[v.id]
  if (kf) {
    const [expected, replacement] = kf
    if (v.kanji !== expected) {
      misses.push({ id: v.id, field: 'kanji', expected, actual: v.kanji })
    } else {
      v.kanji = replacement
      kanjiApplied++
    }
  }

  const mf = MEANING_FIXES[v.id]
  if (mf) {
    const [expected, replacement] = mf
    if (v.meanings.vi !== expected) {
      misses.push({ id: v.id, field: 'meanings.vi', expected, actual: v.meanings.vi })
    } else {
      v.meanings.vi = replacement
      meaningApplied++
    }
  }
}

if (misses.length > 0) {
  console.error('MISMATCHES (not applied) — mapping is stale, re-check:')
  for (const m of misses) console.error(' ', m.id, m.field, 'expected:', JSON.stringify(m.expected), 'actual:', JSON.stringify(m.actual))
  process.exit(1)
}

writeFileSync(path, JSON.stringify(vocab, null, 2) + '\n', 'utf-8')
console.log(`Applied ${kanjiApplied}/${Object.keys(KANJI_FIXES).length} kanji fixes and ${meaningApplied}/${Object.keys(MEANING_FIXES).length} meaning fixes to vocabulary.json.`)
