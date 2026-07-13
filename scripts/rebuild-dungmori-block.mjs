// Cleanup of the botched second DungMori import (n5_0960–n5_1116, 157 entries).
// Diagnosis: the whole TuVung_N5_DungMori.md source was imported twice — once
// correctly (scattered across ids ~0700–0900s), and a second time with a
// broken kanji/kana extractor that dropped okurigana and left bare bracket
// placeholders (e.g. "（～）描" instead of "（～を）描きます"). Cross-referenced
// every entry in the block against both the rest of vocabulary.json (by kana +
// meaning) and the original ../../TuVung_N5_DungMori.md source text.
//
// Two actions, both id-exact-match guarded so stale data fails loudly:
//
// 1. DELETE_IDS — confirmed duplicates of an already-correct sibling entry
//    elsewhere in the file (same word, same meaning). Verified pair noted
//    inline. Nothing is lost: the correct version survives under its
//    original id.
//
// 2. REBUILD — entries with no clean duplicate anywhere else, so they're
//    repaired in place using the source md as ground truth instead of
//    deleted.

import { readFileSync, writeFileSync } from 'node:fs'

const path = new URL('../src/data/n5/vocabulary.json', import.meta.url)
const vocab = JSON.parse(readFileSync(path, 'utf-8'))

const DELETE_IDS = new Set([
  'n5_0974', // dup of n5_0724 （～を）出る
  'n5_0980', // dup of n5_0096 一昨日
  'n5_0981', // dup of n5_0108 ゴールデンウィーク
  'n5_0992', // dup of n5_0228 パーティー
  'n5_0996', // dup of n5_0705 （～が）始まる
  'n5_0997', // dup of n5_0706 （～に）入る
  'n5_1001', // dup of n5_0747 （～を）洗う
  'n5_1002', // dup of n5_0748 （～を）吸う
  'n5_1004', // dup of n5_0752 注意する
  'n5_1005', // dup of n5_0753 合格する
  'n5_1006', // dup of n5_0764 （～を）置く
  'n5_1007', // dup of n5_0777 （～を）探す
  'n5_1008', // dup of n5_0810 （～に）付く
  'n5_1010', // dup of n5_0849 （∼を／に）触る
  'n5_1011', // dup of n5_0850 （メモを）取る
  'n5_1012', // dup of n5_0856 試着する
  'n5_1013', // dup of n5_0858 参加する
  'n5_1014', // dup of n5_0902 （∼を）くれる
  'n5_1015', // dup of n5_0904 案内する
  'n5_1016', // dup of n5_0905 応援する
  'n5_1017', // dup of n5_0906 心配する
  'n5_1021', // dup of n5_0750 （～に）乗る
  'n5_1022', // dup of n5_0105 晴れ
  'n5_1023', // dup of n5_0106 曇り
  'n5_1025', // dup of n5_0367 男の子
  'n5_1027', // dup of n5_0707 （～に）遅れる
  'n5_1028', // dup of n5_0956 用事
  'n5_1034', // dup of n5_0432 帰ります
  'n5_1035', // dup of n5_0431 行きます
  'n5_1036', // dup of n5_0433 来ます
  'n5_1037', // dup of n5_0459 買います
  'n5_1038', // dup of n5_0460 読みます
  'n5_1039', // dup of n5_0461 聞きます
  'n5_1040', // dup of n5_0462 飲みます
  'n5_1041', // dup of n5_0463 食べます
  'n5_1042', // dup of n5_0464 見ます
  'n5_1044', // dup of n5_0525 会います
  'n5_1046', // dup of n5_0550 泳ぎます
  'n5_1047', // dup of n5_0552 運びます
  'n5_1048', // dup of n5_0553 持ちます
  'n5_1049', // dup of n5_0554 弾きます
  'n5_1051', // dup of n5_0652 （～を）描きます
  'n5_1052', // dup of n5_0654 （～を）作ります
  'n5_1053', // dup of n5_0655 登ります
  'n5_1054', // dup of n5_0656 （～を）片付けます
  'n5_1055', // dup of n5_0657 （～を）育てます
  'n5_1056', // dup of n5_0658 （～を）集めます
  'n5_1057', // dup of n5_0659 （～を）建てます
  'n5_1058', // dup of n5_0661 （～を）運転します
  'n5_1059', // dup of n5_0703 （～を）待つ
  'n5_1060', // dup of n5_0708 （～に）慣れる
  'n5_1063', // dup of n5_0725 予約する
  'n5_1064', // dup of n5_0749 （～を）回す
  'n5_1065', // dup of n5_0766 （～を）調べる
  'n5_1066', // dup of n5_0781 （～に）通う
  'n5_1067', // dup of n5_0809 （～を）習う
  'n5_1068', // dup of n5_0813 （～に）住む
  'n5_1069', // dup of n5_0814 （～を）知る
  'n5_1070', // dup of n5_0826 結婚する
  'n5_1071', // dup of n5_0827 生産する
  'n5_1073', // dup of n5_0851 （∼を）開ける
  'n5_1074', // dup of n5_0854 早退する
  'n5_1075', // dup of n5_0855 料理する
  'n5_1077', // dup of n5_0872 （∼を）拭く
  'n5_1078', // dup of n5_0874 （∼に）並ぶ
  'n5_1079', // dup of n5_0875 （コピーを）取る
  'n5_1080', // dup of n5_0876 （∼を）貸す
  'n5_1081', // dup of n5_0879 （∼を∼に）見せる
  'n5_1082', // dup of n5_0880 （∼を∼に）届ける
  'n5_1083', // dup of n5_0882 （∼を）教える
  'n5_1084', // dup of n5_0883 （∼を）忘れる
  'n5_1085', // dup of n5_0885 確認する
  'n5_1086', // dup of n5_0886 （∼に）メール（する）
  'n5_1087', // dup of n5_0900 （∼を）起こす
  'n5_1088', // dup of n5_0901 （∼を）褒める
  'n5_1089', // dup of n5_0908 招待する
  'n5_1091', // dup of n5_0959 （∼を）飼う
  'n5_1095', // dup of n5_0199 ちょっと・少し
  'n5_1101', // dup of n5_0148 この～
  'n5_1102', // dup of n5_0261 男の人
  'n5_1104', // dup of n5_0303 はさみ
  'n5_1112', // dup of n5_0765 （～を）下ろす
])

const REBUILD = {
  n5_1030: { kanji: '一人暮らし', kana: 'ひとりぐらし', chapter: 3 },
  n5_1032: { kanji: '電話します', kana: 'でんわします', chapter: 5 },
  n5_1050: { kanji: '人気があります', kana: 'にんきがあります', chapter: 8 },
  n5_1061: { kanji: '頑張る', kana: 'がんばる', chapter: 11 },
  n5_1111: { kanji: '引き出す', kana: 'ひきだす', chapter: 10 },
}

const before = vocab.length
const missingDeletes = [...DELETE_IDS].filter(id => !vocab.some(v => v.id === id))
const missingRebuilds = Object.keys(REBUILD).filter(id => !vocab.some(v => v.id === id))
if (missingDeletes.length || missingRebuilds.length) {
  console.error('STALE ids not found (aborting):', { missingDeletes, missingRebuilds })
  process.exit(1)
}

const kept = vocab.filter(v => !DELETE_IDS.has(v.id))
for (const v of kept) {
  const r = REBUILD[v.id]
  if (r) {
    v.kanji = r.kanji
    v.kana = r.kana
    v.chapter = r.chapter
  }
}

writeFileSync(path, JSON.stringify(kept, null, 2) + '\n', 'utf-8')
console.log(`Deleted ${DELETE_IDS.size} duplicate entries, rebuilt ${Object.keys(REBUILD).length} unique entries.`)
console.log(`vocabulary.json: ${before} -> ${kept.length} entries.`)
