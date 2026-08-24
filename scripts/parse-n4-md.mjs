// Parses ../../TuVung_N4_DungMori.md (a 10-section, per-section-STT markdown
// table: | STT | **fused kanji+furigana** | Vietnamese meaning |) into raw
// rows. Purely mechanical extraction + source-noise cleanup -- no reading
// splitting happens here (see split-n4-fused.mjs for that).
//
// Cleanup applied per cell:
//  - strip zero-width space corruption (U+200B, seen trailing a few words
//    e.g. "美び術じゅつ館かん​​...") -- same corruption *class* as N5's
//    embedded U+FFFF bug, different codepoint.
//  - strip leading "★" decoration markers (kính ngữ section only).
//  - normalize half-width "(" ")" to the full-width forms used everywhere
//    else in the file (one row: "（お) 刺身さしみ定てい食しょく").
//  - collapse internal whitespace (a few rows have a stray space, e.g.
//    "～以い上 じょう").
//
// Per-section STT is expected to run 1..N with no gaps -- used as a free
// integrity check (mismatch => the table structure shifted and this parser
// needs a look, not a silent skip).
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mdPath = path.join(__dirname, "..", "..", "TuVung_N4_DungMori.md")
const outPath = path.join(__dirname, "n4-raw-rows.json")

const md = fs.readFileSync(mdPath, "utf8")
const lines = md.split(/\r?\n/)

function clean(s) {
  return s
    .replace(/​/g, "")
    .replace(/^★\s*/, "")
    .replace(/[（(]/g, "（")
    .replace(/[）)]/g, "）")
    .replace(/\s+/g, m => (m.includes("\n") ? "\n" : " "))
    .trim()
}

let currentSection = null
const rows = []
const sectionCounts = new Map()

for (const line of lines) {
  const h2 = line.match(/^##\s+(\d+)\.\s*(.+)$/)
  if (h2) {
    currentSection = { num: Number(h2[1]), title: h2[2].trim() }
    continue
  }
  const row = line.match(/^\|\s*(\d+)\s*\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*$/)
  if (row && currentSection) {
    const stt = Number(row[1])
    const fused = clean(row[2])
    const meaning = clean(row[3])
    rows.push({
      sectionNum: currentSection.num,
      sectionTitle: currentSection.title,
      stt,
      fused,
      meaning,
    })
    sectionCounts.set(currentSection.num, stt)
  }
}

// Integrity check: STT should be a contiguous 1..max run per section.
const bySection = new Map()
for (const r of rows) {
  if (!bySection.has(r.sectionNum)) bySection.set(r.sectionNum, [])
  bySection.get(r.sectionNum).push(r.stt)
}
let integrityOk = true
for (const [sec, stts] of bySection) {
  const sorted = [...stts].sort((a, b) => a - b)
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== i + 1) {
      console.error(`Section ${sec}: STT gap/dup at position ${i} (got ${sorted[i]}, expected ${i + 1})`)
      integrityOk = false
    }
  }
}

fs.writeFileSync(outPath, JSON.stringify(rows, null, 2) + "\n", "utf8")
console.log(`Parsed ${rows.length} rows across ${bySection.size} sections. Integrity: ${integrityOk ? "OK" : "FAILED"}`)
console.log(`-> ${outPath}`)
