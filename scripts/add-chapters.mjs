// Backfills the `chapter` field on src/data/n5/vocabulary.json entries using
// the "Chương" column now present in ../TuVung_N5_DungMori.md.
//
// The MD word column mixes three formats: "Kanji (kana)", fused kanji+ruby
// with no separator (e.g. "外国がいこく語ご"), and pure kana. Rather than
// re-deriving kanji/kana splits from that fused text (ambiguous without a
// dictionary — see conversation), we only need to *match* each MD row to an
// already-correct vocabulary.json entry and copy over its chapter number.
// Matching key: the kanji-only "skeleton" (all non-kanji characters
// stripped) is invariant to furigana-grouping/okurigana placement, so it's
// a much more robust join key than the raw fused text.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mdPath = path.join(__dirname, "..", "..", "TuVung_N5_DungMori.md")
const dataPath = path.join(__dirname, "..", "src", "data", "n5", "vocabulary.json")

const KANJI_RE = /[一-鿿㐀-䶿々]/
const KANA_RE = /[ぁ-んァ-ヶー]/

function skeleton(s) {
  return [...s].filter(ch => KANJI_RE.test(ch)).join("")
}

function parseMdRow(rawWord) {
  let text = rawWord.trim()
  let explicitReading = null

  // Pull out parenthetical groups (full-width or half-width).
  const parenGroups = [...text.matchAll(/[（(]([^）)]*)[）)]/g)]
  const noteGroups = parenGroups.filter(m => m[1].includes("/"))
  const readingGroups = parenGroups.filter(m => !m[1].includes("/") && [...m[1]].every(ch => KANA_RE.test(ch)))

  if (readingGroups.length === 1 && parenGroups.length === readingGroups.length + noteGroups.length) {
    explicitReading = readingGroups[0][1]
  }

  // Strip all parenthetical content (notes and/or the reading we just captured).
  text = text.replace(/[（(][^）)]*[）)]/g, "")
  // Strip leading ~/〜 placeholders, circled digits, and whitespace.
  text = text.replace(/[〜~①②③④⑤\s]/g, "")

  const skel = skeleton(text)
  const reading = explicitReading ?? [...text].filter(ch => KANA_RE.test(ch)).join("")

  return { skel, reading, wordText: text }
}

// --- Parse the MD file ---
const mdLines = fs.readFileSync(mdPath, "utf8").split("\n")
const mdRows = []
for (const line of mdLines) {
  const m = line.match(/^\|\s*(\d+)\s*\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*Chương\s*(\d+)\s*\|\s*$/)
  if (!m) continue
  const [, , rawWord, meaning, chapterStr] = m
  const { skel, reading, wordText } = parseMdRow(rawWord)
  mdRows.push({ rawWord, wordText, meaning: meaning.trim(), chapter: Number(chapterStr), skel, reading })
}
console.log(`Parsed ${mdRows.length} MD rows.`)

// --- Load vocabulary.json and index it ---
const vocab = JSON.parse(fs.readFileSync(dataPath, "utf8"))
const bySkel = new Map()
const byReading = new Map()
for (const v of vocab) {
  const skel = skeleton(v.kanji)
  const reading = v.kana || v.kanji
  if (skel) {
    if (!bySkel.has(skel)) bySkel.set(skel, [])
    bySkel.get(skel).push(v)
  }
  if (!byReading.has(reading)) byReading.set(reading, [])
  byReading.get(reading).push(v)
}

// --- Match + assign ---
let updated = 0, alreadySet = 0, mismatched = 0, unmatched = 0, ambiguous = 0
const unmatchedRows = []
const mismatchedRows = []

for (const row of mdRows) {
  let candidates = row.skel ? (bySkel.get(row.skel) || []) : []
  if (candidates.length === 0 && row.reading) {
    candidates = byReading.get(row.reading) || []
  }
  if (candidates.length > 1 && row.reading) {
    const narrowed = candidates.filter(v => (v.kana || v.kanji) === row.reading)
    if (narrowed.length > 0) candidates = narrowed
  }
  if (candidates.length > 1) {
    const norm = s => s.toLowerCase().normalize("NFC")
    const narrowed = candidates.filter(v => norm(v.meanings.vi) === norm(row.meaning))
    if (narrowed.length > 0) candidates = narrowed
  }

  if (candidates.length === 0) {
    unmatched++
    unmatchedRows.push(row)
    continue
  }
  if (candidates.length > 1) {
    ambiguous++
    continue
  }

  const v = candidates[0]
  if (v.chapter === 0) {
    v.chapter = row.chapter
    updated++
  } else if (v.chapter !== row.chapter) {
    mismatched++
    mismatchedRows.push({ word: v.kanji, existing: v.chapter, md: row.chapter })
  } else {
    alreadySet++
  }
}

fs.writeFileSync(dataPath, JSON.stringify(vocab, null, 2) + "\n", "utf8")

const stillZero = vocab.filter(v => v.chapter === 0)
console.log(`Updated (was 0): ${updated}`)
console.log(`Already correct: ${alreadySet}`)
console.log(`Mismatched (kept existing, MD differs): ${mismatched}`)
console.log(`Ambiguous (multiple candidates): ${ambiguous}`)
console.log(`Unmatched MD rows: ${unmatched}`)
console.log(`Remaining chapter=0 entries in vocabulary.json: ${stillZero.length}`)

if (mismatchedRows.length) {
  console.log(`\nMismatches (first 20):`)
  for (const m of mismatchedRows.slice(0, 20)) console.log(`  ${m.word}: existing=${m.existing} md=${m.md}`)
}
if (unmatchedRows.length) {
  console.log(`\nUnmatched MD rows (first 30):`)
  for (const r of unmatchedRows.slice(0, 30)) console.log(`  "${r.rawWord}" (${r.meaning}) ch.${r.chapter}`)
}
if (stillZero.length) {
  console.log(`\nStill chapter=0 (first 30):`)
  for (const v of stillZero.slice(0, 30)) console.log(`  ${v.id} ${v.kanji} (${v.meanings.vi})`)
}
