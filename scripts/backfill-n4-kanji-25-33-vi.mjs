// Converts chapters 25-33's group/word `meaning` from a plain English string
// (as written by build-n4-kanji.mjs) into the bilingual { vi, en } shape used
// everywhere else in n4/kanji.json, sourcing `vi` from
// data/kanji_list_n4_25_33.md -- same table shape as the original
// N4_Grammar_and_Kanji_Summary-Final.md (Nhóm | Chữ Hán | Âm Hán Việt |
// Nghĩa | Từ vựng liên quan), reusing backfill-n4-kanji-vi.mjs's parser.
//
// Matches by anchor character (unique within 25-33) then by kanji+kana pair
// per word. Hard-fails if any group/word can't be matched or already has a
// `vi` (idempotency guard).
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mdPath = path.join(__dirname, "..", "..", "data", "kanji_list_n4_25_33.md")
const kanjiPath = path.join(__dirname, "../src/data/n4/kanji.json")

const md = fs.readFileSync(mdPath, "utf8")
const lines = md.split("\n")

const rows = []
let inKanjiSection = false
for (const line of lines) {
  if (line.startsWith("### II. Chữ Hán")) { inKanjiSection = true; continue }
  if (!inKanjiSection) continue
  const t = line.trim()
  if (!t.startsWith("|")) continue
  if (t.includes(":---")) continue
  if (t.includes("Nhóm") && t.includes("Chữ Hán") && t.includes("Nghĩa")) continue

  const cells = t.split("|").map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1)
  if (cells.length < 5) continue
  const anchorMatch = cells[1].match(/\*\*(.+?)\*\*/)
  if (!anchorMatch) continue
  const anchor = anchorMatch[1]
  const groupMeaningVi = cells[3]

  const words = []
  for (const bullet of cells[4].split("<br>")) {
    const b = bullet.trim()
    if (!b) continue
    const m = b.match(/\*\*(.+?)\*\*\s*\(([^-]+?)\s*-\s*(.+?)\)\s*$/)
    if (!m) throw new Error(`couldn't parse word bullet: "${b}" (anchor ${anchor})`)
    words.push({ kanji: m[1].trim(), kana: m[2].trim(), meaningVi: m[3].trim() })
  }
  rows.push({ anchor, groupMeaningVi, words })
}

if (rows.length !== 84) throw new Error(`expected 84 parsed rows, got ${rows.length}`)

const byAnchor = new Map(rows.map(r => [r.anchor, r]))

const data = JSON.parse(fs.readFileSync(kanjiPath, "utf8"))
let filledGroups = 0, filledWords = 0

for (const chapter of data.chapters) {
  if (chapter.chapter < 25) continue
  for (const group of chapter.groups) {
    const row = byAnchor.get(group.anchor)
    if (!row) throw new Error(`no MD row found for anchor "${group.anchor}" (group ${group.id})`)

    if (typeof group.meaning === "string") {
      group.meaning = { vi: row.groupMeaningVi, en: group.meaning }
      filledGroups++
    } else if (group.meaning.vi) {
      throw new Error(`group ${group.id} (${group.anchor}) already has meaning.vi -- refusing to clobber`)
    }

    for (const word of group.words) {
      const match = row.words.find(w => w.kanji === word.kanji && w.kana === word.kana)
      if (!match) throw new Error(`no MD word match for "${word.kanji}" (${word.kana}) in group ${group.id} (${group.anchor})`)
      if (typeof word.meaning === "string") {
        word.meaning = { vi: match.meaningVi, en: word.meaning }
        filledWords++
      } else if (word.meaning.vi) {
        throw new Error(`word "${word.kanji}" in group ${group.id} already has meaning.vi -- refusing to clobber`)
      }
    }
  }
}

fs.writeFileSync(kanjiPath, JSON.stringify(data, null, 2) + "\n")
console.log(`filled group meanings: ${filledGroups}, filled word meanings: ${filledWords}`)
