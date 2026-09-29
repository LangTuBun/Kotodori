// Backfills `chapter` (24-33) onto n4/vocabulary.json entries, sourced from
// data/vocab_n4_25_33.md -- same shape/pipeline as apply-n4-chapters.mjs
// (which did 15-24), adapted for:
//   - source file moved under data/
//   - source uses U+301C wave dash (〜) instead of the U+FF5E (～) fullwidth
//     tilde vocabulary.json/this matcher use -- normalized before matching.
//   - the doc's leading "BÀI 24" section (21 rows) is a few extra words for
//     an already-tagged chapter -- only newly-unmatched ones there become
//     candidates; anything that resolves to an already-ch24 entry is a
//     silent confirmation, not a re-tag.
//   - several rows are new senses of kana already tagged in ch15-24 (a
//     different meaning, same reading) -- these must NOT steal/overwrite
//     the existing entry's chapter. Forced unmatched via MANUAL_OVERRIDES
//     so they fall through to the missing-words script as new entries.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const outerDir = path.join(root, "..")

const vocabPath = path.join(root, "src/data/n4/vocabulary.json")
const mdPath = path.join(outerDir, "data", "vocab_n4_25_33.md")

const vocab = JSON.parse(fs.readFileSync(vocabPath, "utf8"))
let md = fs.readFileSync(mdPath, "utf8")
md = md.replace(/〜/g, "～") // wave dash -> fullwidth tilde

const KANA_ONLY_RE = /^[ぁ-んァ-ヶー～~・/\s]+$/
const KANA_ONLY_PAREN_RE = /\(([^()]*)\)\s*$/

function coreKanji(s) {
  return s
    .replace(/（[^）]*）/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[\s～~]/g, "")
    .trim()
}

function parseWordCell(raw) {
  const cell = raw.replace(/\*\*/g, "").trim()

  const m = cell.match(KANA_ONLY_PAREN_RE)
  if (m && KANA_ONLY_RE.test(m[1])) {
    const kanjiPart = cell.slice(0, m.index).trim()
    if (m[1] === "する" && kanjiPart) {
      const core = coreKanji(kanjiPart)
      if (core && core !== "する" && KANA_ONLY_RE.test(core)) {
        return { kanjiPart: cell, kanaCandidates: [core, core + "する"] }
      }
    }
    return { kanjiPart, kanaCandidates: [m[1].trim()] }
  }

  const withoutLeadingNotes = cell.replace(/^(?:[（(][^）)]*[）)]\s*)+/, "").trim()
  if (withoutLeadingNotes && KANA_ONLY_RE.test(withoutLeadingNotes)) {
    return { kanjiPart: cell, kanaCandidates: [withoutLeadingNotes] }
  }

  return { kanjiPart: cell, kanaCandidates: [cell] }
}

// Forced-unmatched: new senses of an already-tagged kana reading (see
// header). Empty array => never resolves, always falls to "unmatched" so
// the missing-words script picks it up as a genuinely new entry.
const MANUAL_OVERRIDES = {
  "27::できる": [],
  "29::(〜に) 掛ける (かける)": [],
  "31::(点 / 〜点を) 取る (とる)": [],
  "31::(熱を) 出す (だす)": [],
  "29::(丸を) つける": [],
  "30::(宝くじに / が) 当たる (あたる)": [],
}

const chapterSections = []
const headerRe = /^## .*BÀI (\d+)/gm
let match
const headerPositions = []
while ((match = headerRe.exec(md))) {
  headerPositions.push({ chapter: Number(match[1]), start: match.index })
}
for (let i = 0; i < headerPositions.length; i++) {
  const { chapter, start } = headerPositions[i]
  const end = i + 1 < headerPositions.length ? headerPositions[i + 1].start : md.length
  chapterSections.push({ chapter, text: md.slice(start, end) })
}

function extractVocabRows(sectionText) {
  const rows = []
  const blocks = sectionText.split(/### 💬/)[0]
  const lines = blocks.split("\n")
  for (const line of lines) {
    const rowMatch = line.match(/^\|\s*(\d+)\s*\|\s*(.+?)\s*\|/)
    if (!rowMatch) continue
    if (/^:---/.test(rowMatch[2]) || rowMatch[2].includes("Từ vựng")) continue
    rows.push(rowMatch[2])
  }
  return rows
}

const kanaIndex = new Map()
for (const e of vocab) {
  if (!kanaIndex.has(e.kana)) kanaIndex.set(e.kana, [])
  kanaIndex.get(e.kana).push(e)
}

const matched = []
const confirmed = [] // already had this exact chapter -- no-op, just logged
const ambiguous = []
const unmatched = []
const conflicts = []

for (const { chapter, text } of chapterSections) {
  const rows = extractVocabRows(text)
  for (const raw of rows) {
    const cleanedRaw = raw.replace(/\*\*/g, "").trim()
    const overrideKey = `${chapter}::${cleanedRaw}`
    if (overrideKey in MANUAL_OVERRIDES) {
      unmatched.push({ chapter, raw: cleanedRaw })
      continue
    }

    const { kanjiPart, kanaCandidates } = parseWordCell(raw)
    let candidates = []
    for (const kana of kanaCandidates) {
      candidates = kanaIndex.get(kana) || []
      if (candidates.length > 0) break
    }

    if (candidates.length > 1) {
      const wantCore = coreKanji(kanjiPart)
      const narrowed = candidates.filter(c => coreKanji(c.kanji) === wantCore)
      if (narrowed.length >= 1) candidates = narrowed
    }

    if (candidates.length === 0) {
      const wantCore = coreKanji(kanjiPart)
      candidates = vocab.filter(e => coreKanji(e.kanji) === wantCore)
    }

    if (candidates.length === 0) {
      unmatched.push({ chapter, raw: cleanedRaw })
      continue
    }
    if (candidates.length > 1) {
      ambiguous.push({ chapter, raw: cleanedRaw, candidates: candidates.map(c => c.id) })
      continue
    }

    const entry = candidates[0]
    if (entry.chapter === chapter) {
      confirmed.push({ chapter, id: entry.id, kanji: entry.kanji })
      continue
    }
    if (entry.chapter !== undefined && entry.chapter !== chapter) {
      conflicts.push({ id: entry.id, kanji: entry.kanji, existing: entry.chapter, new: chapter, raw: cleanedRaw })
      continue
    }
    entry.chapter = chapter
    matched.push({ chapter, id: entry.id, kanji: entry.kanji, kana: entry.kana })
  }
}

fs.writeFileSync(vocabPath, JSON.stringify(vocab, null, 2) + "\n")

console.log(`Matched & tagged: ${matched.length}`)
console.log(`Confirmed (already correctly tagged): ${confirmed.length}`)
console.log(`Ambiguous (skipped, needs manual review): ${ambiguous.length}`)
console.log(`Unmatched (skipped -- forced-override or not found): ${unmatched.length}`)
console.log(`Conflicts (already had a different chapter, skipped): ${conflicts.length}`)

const byChapter = {}
for (const m of matched) byChapter[m.chapter] = (byChapter[m.chapter] || 0) + 1
console.log("\nPer-chapter newly-tagged counts:")
for (const [ch, count] of Object.entries(byChapter).sort((a, b) => Number(a[0]) - Number(b[0]))) {
  console.log(`  Chapter ${ch}: ${count}`)
}

if (ambiguous.length) {
  console.log("\nAmbiguous rows:")
  for (const a of ambiguous) console.log(`  [ch${a.chapter}] "${a.raw}" -> candidates: ${a.candidates.join(", ")}`)
}
if (unmatched.length) {
  console.log("\nUnmatched rows:")
  for (const u of unmatched) console.log(`  [ch${u.chapter}] "${u.raw}"`)
}
if (conflicts.length) {
  console.log("\nConflicts:")
  for (const c of conflicts) console.log(`  ${c.id} (${c.kanji}): already ch${c.existing}, doc says ch${c.new} -- "${c.raw}"`)
}
