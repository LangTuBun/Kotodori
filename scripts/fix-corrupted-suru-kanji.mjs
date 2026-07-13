// One-time fix for a PDF-extraction bug affecting する-verb / expression entries
// whose source line paired a Hán Việt gloss like "(Tốt nghiệp)" with a
// parenthesized conjugation marker like "（する）". The kanji-field extractor
// grabbed the tail of the Hán Việt parenthetical instead of the real kanji,
// e.g. "Nghiệp)（する）" for 卒業する (kana そつぎょうする, "tốt nghiệp").
//
// Each mapping was independently verified against kana reading + Vietnamese
// meaning + the Hán Việt reading of the trailing kanji (e.g. 業 = Nghiệp,
// 備 = Bị, 除 = Trừ) before being included here — see chat/PR for the
// per-entry derivation. Corrected kanji keeps the する/です/… okurigana
// (matching the kana field) so Furigana alignment stays correct, per the
// project's existing okurigana convention (e.g. 食べる/たべる).
//
// Applied by exact match so a stale mapping fails loudly instead of
// double-patching. Also folds in a few glued-space typos in meanings.vi
// for these same entries (same bug class as fix-glued-meanings.mjs, just
// missed by its original id list) — kept as a separate mapping so the
// two fixes stay independently auditable.

import { readFileSync, writeFileSync } from 'node:fs'

const path = new URL('../src/data/n5/vocabulary.json', import.meta.url)
const vocab = JSON.parse(readFileSync(path, 'utf-8'))

const KANJI_FIXES = {
  n5_0038: ['Phu)です', '大丈夫です'],
  n5_0693: ['Bị)（する）', '準備する'],
  n5_0694: ['Trừ)（する）', '掃除する'],
  n5_0709: ['Nghiệp)（する）', '卒業する'],
  n5_0725: ['Ước)（する）', '予約する'],
  n5_0726: ['Tập)（する）', '練習する'],
  n5_0730: ['Dạng)でした', 'お疲れ様でした'],
  n5_0732: ['Trương)ってください', '頑張ってください'],
  n5_0752: ['Ý)（する）', '注意する'],
  n5_0753: ['Cách)（する）', '合格する'],
  n5_0754: ['Hoạt)（する）', '生活する'],
  n5_0755: ['Nghiệp)（する）', '残業する'],
  n5_0756: ['Trương)（する）', '出張する'],
  n5_0788: ['Động)（する）', '運動する'],
  n5_0826: ['Hôn)（する）', '結婚する'],
  n5_0827: ['Sản)（する）', '生産する'],
  n5_0830: ['Dạng)です', 'ご苦労様です'],
  n5_0854: ['Thoái)（する）', '早退する'],
  n5_0855: ['Lý)（する）', '料理する'],
  n5_0856: ['Trước)（する）', '試着する'],
  n5_0857: ['Lạc)（する）', '連絡する'],
  n5_0858: ['Gia)（する）', '参加する'],
  n5_0885: ['Nhận)（する）', '確認する'],
  n5_0904: ['Nội)（する）', '案内する'],
  n5_0905: ['Viện)（する）', '応援する'],
  n5_0906: ['Phối)（する）', '心配する'],
  n5_0908: ['Đãi)（する）', '招待する'],
  n5_0909: ['Thành)（する）', '完成する'],
  n5_0934: ['Nghiệp)（する）', '営業する'],
  n5_0935: ['Sự)（する）', '工事する'],
  n5_0936: ['Xuất)（する）', '外出する'],
}

const MEANING_FIXES = {
  n5_0732: ['cốgắng lên.', 'cố gắng lên.'],
  n5_0788: ['vận động, tập thểdục', 'vận động, tập thể dục'],
  n5_0854: ['vềsớm', 'về sớm'],
  n5_0905: ['cổvũ, ủng hộ', 'cổ vũ, ủng hộ'],
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
