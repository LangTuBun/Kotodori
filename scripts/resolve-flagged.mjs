// Hand-resolves the ~65 items build-enrichment-draft.mjs flagged for
// review (found by inspecting scripts/flagged.jsonl): irregular/jukujikun
// readings that need a "Juku"/"Ate" tag instead of a derived one, multi-
// reading characters (長 Truong/Truong, 読 Doc/Doc, 買 Mai/Mai, 少
// Thieu/Thieu) that needed the correct variant picked per word, secondary
// characters missing from hanviet-dictionary.json that got a manual
// (partial, where uncertain) gloss, and a handful of ateji/rare-reading
// candidates dropped as too obscure or low-value for an N5 foundation
// (champagne/Oxford/karuta ateji spellings, 何の as どの, redundant
// 草臥れる when 疲れる already covers "to get tired").
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const draftPath = path.join(__dirname, "enrichment-draft.json")
const draft = JSON.parse(fs.readFileSync(draftPath, "utf8"))

const DROP = new Set(["三鞭酒", "牛津", "歌留多", "何の", "草臥れる", "西蔵", "古"])

// key: `${id}::${kanji}` (kanji alone isn't unique -- 大人 appears in two
// groups, 読み/読み上げる appear twice in the same group).
const OVERRIDES = {
  "k3_g11::少年": { hanviet: "Thiếu Niên" },
  "k3_g11::少女": { hanviet: "Thiếu Nữ" },
  "k3_g13::少々": { hanviet: "Thiểu Thiểu", onkun: "On--On" },
  "k4_g7::長": { hanviet: "Trưởng" },
  "k15_g1::駅長": { hanviet: "Dịch Trưởng" },
  "k15_g4::校長": { hanviet: "Hiệu Trưởng" },
  "k15_g8::店長": { hanviet: "Điếm Trưởng" },
  "k12_g11::読者": { hanviet: "Độc Giả" },
  "k12_g13::読書": { hanviet: "Độc Thư" },

  "k1_g3::三味線": { onkun: "Juku" },
  "k1_g7::七夕": { onkun: "Juku" },
  "k1_g8::八百屋": { onkun: "Juku" },
  "k2_g9::雪崩": { onkun: "Juku" },
  "k2_g10::雲雀": { onkun: "Juku", hanviet: "Vân Tước" },
  "k3_g7::大人": { onkun: "Juku" },
  "k12_g8::大人": { onkun: "Juku" },
  "k4_g1::木綿": { onkun: "Juku" },
  "k5_g1::土産": { onkun: "Juku" },
  "k5_g4::不味い": { onkun: "Juku" },
  "k7_g1::今日": { onkun: "Juku" },
  "k7_g1::今朝": { onkun: "Juku" },
  "k7_g1::今年": { onkun: "Juku" },
  "k8_g3::父さん": { onkun: "Juku" },
  "k8_g6::母さん": { onkun: "Juku" },
  "k8_g10::兄ちゃん": { onkun: "Juku" },
  "k8_g10::兄さん": { onkun: "Juku" },
  "k9_g9::狭間": { onkun: "Juku" },
  "k10_g4::何時も": { onkun: "Juku" },
  "k13_g9::西瓜": { onkun: "Juku", hanviet: "Tây Qua" },
  "k13_g15::南瓜": { onkun: "Juku", hanviet: "Nam Qua" },
  "k13_g12::梅雨": { onkun: "Ate" },
  "k13_g12::梅雨明け": { onkun: "Ate" },
  "k13_g12::梅雨入り": { onkun: "Ate" },
  "k15_g7::天皇": { onkun: "Juku" },
  // Decomposes correctly (待ち+合い+室) but the frozen-compound spelling
  // drops the okurigana the classifier needs to anchor on.
  "k10_g3::待合室": { onkun: "Kun--Kun--On" },

  // Secondary characters not in hanviet-dictionary.json and genuinely
  // uncertain from available sources -- partial gloss (matches existing
  // precedent, e.g. 魚屋 -> "Ngư" alone) rather than a guessed reading.
  "k13_g7::茶碗": { hanviet: "Trà Oản" },
  "k5_g5::石鹸": { hanviet: "Thạch" },
  "k5_g5::石垣": { hanviet: "Thạch" },
  "k6_g10::飲み込む": { hanviet: "Ẩm" },
  "k7_g7::牛丼": { hanviet: "Ngưu" },
  "k4_g2::林檎": { hanviet: "Lâm" },
  "k14_g1::方々": { hanviet: "Phương Phương" },
}

let dropped = 0, overridden = 0, stillUnresolved = 0
const stillUnresolvedList = []

for (const g of draft) {
  const kept = []
  for (const it of g.items) {
    if (DROP.has(it.kanji)) { dropped++; continue }
    const key = `${g.id}::${it.kanji}`
    if (OVERRIDES[key]) {
      Object.assign(it, OVERRIDES[key])
      overridden++
    }
    if (!it.onkun || !it.hanviet) {
      stillUnresolved++
      stillUnresolvedList.push({ id: g.id, kanji: it.kanji, onkun: it.onkun, hanviet: it.hanviet })
    }
    it.flags = [] // cleared -- resolved above
    kept.push(it)
  }
  g.items = kept
}

fs.writeFileSync(draftPath, JSON.stringify(draft, null, 2) + "\n", "utf8")
console.log(`Dropped ${dropped}, overrode ${overridden}.`)
console.log(`Still unresolved: ${stillUnresolved}`)
for (const u of stillUnresolvedList) console.log(" ", JSON.stringify(u))
