// One-time additive backfill for the 16 characters known to be missing from
// hanviet-dictionary.json (see handoff.md "Remaining Hán Việt gaps" / "Known
// Issues"): 9 from N4 (嘘 咳 掛 叶 淹 甥 姪 叱 剥) + 7 from N5 enrichment
// (雀 檎 鹸 垣 丼 碗 瓜). Deliberately excludes 々 (iteration mark, not a
// real character) and 込 (kokuji, no Chinese-origin reading exists) --
// those two were already investigated and are meant to stay absent, not
// backfilled (an earlier pass briefly mis-resolved 々, see handoff.md).
//
// Sourced from scripts/saroma-map.json (the 2136-Jouyou table) where present
// (掛/垣/丼 confirmed this way); the rest hand-supplied from general
// Sino-Vietnamese phonetic-series knowledge (same "no network access"
// convention as the original fetch-secondary-kanji-data.mjs backfill).
// Idempotent: skips any character already present rather than overwriting.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dictPath = path.join(__dirname, "../src/data/hanviet-dictionary.json")
const dict = JSON.parse(fs.readFileSync(dictPath, "utf8"))

const ADDITIONS = {
  // N4 (嘘 咳 掛 叶 淹 甥 姪 叱 剥)
  "嘘": "Hư",
  "咳": "Khái",
  "掛": "Quải",   // confirmed via saroma-map.json
  "叶": "Hiệp",
  "淹": "Yêm",
  "甥": "Sanh",   // moderate confidence -- rare in modern SV vocab, no reference-table hit
  "姪": "Điệt",
  "叱": "Sất",
  "剥": "Bác",
  // N5 (雀 檎 鹸 垣 丼 碗 瓜)
  "雀": "Tước",
  "檎": "Cầm",    // moderate confidence -- only ever appears in 林檎
  "鹸": "Kiểm",
  "垣": "Viên",   // confirmed via saroma-map.json
  "丼": "Tham",   // confirmed via saroma-map.json
  "碗": "Oản",    // matches the existing partial gloss on 茶碗 -> "Trà Oản"
  "瓜": "Qua",
}

let added = 0
let skipped = 0
for (const [char, reading] of Object.entries(ADDITIONS)) {
  if (dict[char] !== undefined) { skipped++; continue }
  dict[char] = reading
  added++
}

fs.writeFileSync(dictPath, JSON.stringify(dict, null, 2) + "\n")
console.log(`added: ${added}, skipped (already present): ${skipped}, total entries now: ${Object.keys(dict).length}`)
