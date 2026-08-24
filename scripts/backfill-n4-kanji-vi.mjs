// Backfills meaning.vi for src/data/n4/kanji.json (110 groups / 268 words),
// which was authored English-only this session (see handoff.md's "N4 kanji
// meaning.vi is empty" note). Source: the original
// ../../N4_Grammar_and_Kanji_Summary-Final.md markdown table, which has
// exactly 110 rows (one per anchor kanji, confirmed 1:1 against kanji.json's
// 110 groups) with a Vietnamese "Nghia" (meaning) column for the group and a
// per-word "(kana - meaning)" gloss in the word bullet list.
//
// Matches by anchor character (all 110 anchors are unique, verified before
// writing this script) rather than position, then matches each word within
// a group by its kanji+kana pair. Hard-fails (throws, writes nothing) if any
// group or word can't be matched -- see the N5 kanji / N4 vocab translation
// scripts elsewhere in this folder for the same discipline.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mdPath = path.join(__dirname, "../../N4_Grammar_and_Kanji_Summary-Final.md")
const kanjiPath = path.join(__dirname, "../src/data/n4/kanji.json")

const md = fs.readFileSync(mdPath, "utf8")
const lines = md.split("\n")

// ---------- Parse the markdown into { anchor, groupMeaningVi, words: [{kanji, kana, meaningVi}] } ----------
const rows = []
let inKanjiSection = false
for (const line of lines) {
  if (line.startsWith("### II. Chữ Hán")) { inKanjiSection = true; continue }
  if (line.startsWith("## BÀI") || line.trim() === "---") { inKanjiSection = false }
  if (!inKanjiSection) continue
  const t = line.trim()
  if (!t.startsWith("|")) continue
  if (t.includes(":---")) continue
  if (t.includes("Nhóm") && t.includes("Chữ Hán") && t.includes("Nghĩa")) continue // header row

  const cells = t.split("|").map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1)
  // cells: [subgroupLabel, anchorBold, hanviet, groupMeaning, wordsCell]
  if (cells.length < 5) continue
  const anchorMatch = cells[1].match(/\*\*(.+?)\*\*/)
  if (!anchorMatch) continue
  const anchor = anchorMatch[1]
  const groupMeaningVi = cells[3]

  const words = []
  for (const bullet of cells[4].split("<br>")) {
    const b = bullet.trim()
    if (!b) continue
    // • **KANJI** (KANA - MEANING)
    const m = b.match(/\*\*(.+?)\*\*\s*\(([^-]+?)\s*-\s*(.+?)\)\s*$/)
    if (!m) throw new Error(`couldn't parse word bullet: "${b}" (anchor ${anchor})`)
    words.push({ kanji: m[1].trim(), kana: m[2].trim(), meaningVi: m[3].trim() })
  }
  rows.push({ anchor, groupMeaningVi, words })
}

if (rows.length !== 110) throw new Error(`expected 110 parsed rows, got ${rows.length}`)

const byAnchor = new Map(rows.map(r => [r.anchor, r]))

// ---------- Apply onto kanji.json ----------
const data = JSON.parse(fs.readFileSync(kanjiPath, "utf8"))
let filledGroups = 0, filledWords = 0

for (const chapter of data.chapters) {
  for (const group of chapter.groups) {
    const row = byAnchor.get(group.anchor)
    if (!row) throw new Error(`no MD row found for anchor "${group.anchor}" (group ${group.id})`)

    if (group.meaning) {
      if (group.meaning.vi) throw new Error(`group ${group.id} (${group.anchor}) already has meaning.vi -- refusing to clobber`)
      group.meaning.vi = row.groupMeaningVi
      filledGroups++
    }

    for (const word of group.words) {
      const match = row.words.find(w => w.kanji === word.kanji && w.kana === word.kana)
      if (!match) throw new Error(`no MD word match for "${word.kanji}" (${word.kana}) in group ${group.id} (${group.anchor})`)
      if (word.meaning.vi) throw new Error(`word "${word.kanji}" in group ${group.id} already has meaning.vi -- refusing to clobber`)
      word.meaning.vi = match.meaningVi
      filledWords++
    }
  }
}

fs.writeFileSync(kanjiPath, JSON.stringify(data, null, 2) + "\n")
console.log(`filled group meanings: ${filledGroups}, filled word meanings: ${filledWords}`)
