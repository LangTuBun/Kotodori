// Backfills `chapter` (15-24) onto n4/vocabulary.json entries, sourced from
// TuVung_va_Hyougen_N4_Bai15_24.md (the outer Nihongo/ folder, sibling to
// this repo) -- a chaptered subset of the same word pool vocabulary.json was
// originally built from (TuVung_N4_DungMori.md, thematic-category-only, no
// chapters -- see build-n4-draft.mjs/assemble-n4-vocab.mjs).
//
// Chapters 1-14 and 25-33 aren't sourced yet (per the user), so entries not
// found in this document are left untouched -- `chapter` stays absent,
// exactly as it is today. Never writes `chapter: 0` (see VocabEntry.chapter
// comment: 0 is a corruption signal in this codebase's history).
//
// Matching strategy: the new doc's word cells are the same underlying words
// but reformatted (half-width "(reading)" parens with spaces, vs. the fused
// original's zenkaku parens/no separator vocabulary.json was parsed from --
// see split-n4-fused.mjs), so this matches by kana first, disambiguating
// kana collisions (18 of them, e.g. とる x3) by comparing a bracket/space
// -stripped "core kanji" on both sides.
//
// Idempotent-ish: re-running overwrites chapter assignments from a match,
// never adds a new vocab entry, never touches an entry this doc doesn't
// mention.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const outerDir = path.join(root, "..") // C:\Users\minhk\OneDrive\Documents\HOCTHEM\Nihongo

const vocabPath = path.join(root, "src/data/n4/vocabulary.json")
const mdPath = path.join(outerDir, "TuVung_va_Hyougen_N4_Bai15_24.md")

const vocab = JSON.parse(fs.readFileSync(vocabPath, "utf8"))
const md = fs.readFileSync(mdPath, "utf8")

const KANA_ONLY_RE = /^[ぁ-んァ-ヶー～~・/\s]+$/
const KANA_ONLY_PAREN_RE = /\(([^()]*)\)\s*$/ // last non-nested paren group at the very end

// Strips bracketed usage-notes (both zenkaku （）and ASCII ()) and
// whitespace/tilde noise, leaving just the core word text, so the same
// word formatted two different ways (zenkaku-fused vs. spaced-ASCII)
// compares equal.
function coreKanji(s) {
  return s
    .replace(/（[^）]*）/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[\s～~]/g, "")
    .trim()
}

// Returns { kanjiPart, kanaCandidates } -- usually one candidate, but the
// "(する)" suru-marker is genuinely ambiguous (see below) so that case
// yields two to try in order.
function parseWordCell(raw) {
  const cell = raw.replace(/\*\*/g, "").trim()

  const m = cell.match(KANA_ONLY_PAREN_RE)
  if (m && KANA_ONLY_RE.test(m[1])) {
    const kanjiPart = cell.slice(0, m.index).trim()

    // "(する)" alone is ambiguous: for a kana/katakana word it's just a
    // suru-conjugation marker with no separate reading (びっくり(する) ->
    // kana "びっくりする" or plain "びっくり", not "する"); for an actual
    // kanji verb it's followed by a SECOND trailing paren with the real
    // reading (無理(する) (むりする) -- that second paren is what `m`
    // matched here, so this branch doesn't even see the marker). Only the
    // no-second-paren case reaches here, and only when the word-so-far is
    // pure kana does the marker reading become ambiguous; a bare "する"
    // itself (e.g. "(○○円も) する (する)") isn't ambiguous, so exclude it.
    if (m[1] === "する" && kanjiPart) {
      const core = coreKanji(kanjiPart)
      if (core && core !== "する" && KANA_ONLY_RE.test(core)) {
        return { kanjiPart: cell, kanaCandidates: [core, core + "する"] }
      }
    }

    return { kanjiPart, kanaCandidates: [m[1].trim()] }
  }

  // No trailing kana-paren -- some rows show only a leading usage-note plus
  // a bare kana reading, no kanji spelling at all (e.g. "(コーヒーを) いれる",
  // "(～を) はく"). Strip the leading note group(s) and check if what's left
  // is pure kana; if so, that's the kana to search on (kanjiPart stays the
  // full cell, for the core-kanji fallback below, which usually won't hit
  // since the doc dropped the kanji spelling entirely).
  const withoutLeadingNotes = cell.replace(/^(?:[（(][^）)]*[）)]\s*)+/, "").trim()
  if (withoutLeadingNotes && KANA_ONLY_RE.test(withoutLeadingNotes)) {
    return { kanjiPart: cell, kanaCandidates: [withoutLeadingNotes] }
  }

  return { kanjiPart: cell, kanaCandidates: [cell] }
}

// Hand-resolved cases the parser/matcher can't settle on its own:
//   - genuinely ambiguous rows (source doc's Vietnamese gloss merges two
//     vocabulary.json entries' meanings, e.g. "(～を) 取る" = both "tháo, bỏ"
//     and "lấy, bắt" -- tag both ids)
//   - nested parens the flat regex above can't parse ("(お)花見 ((お)はなみ)")
//   - a kana coincidence with the wrong sense: bài 19's bare "かける"
//     ("Treo lên" = to hang something up) has no corresponding
//     vocabulary.json entry at all -- the only かける entry is
//     "（～を）かける" = "đeo (kính)" (to wear glasses), which is what bài
//     20's "(～を) かける" row actually means. Force the ch19 row to stay
//     unmatched (empty id list) so it doesn't steal that entry and block
//     bài 20's correct, later match.
// Keyed by "chapter::raw cell text" (bold markers stripped) so a phrase
// repeated verbatim in a different chapter isn't accidentally overridden.
const MANUAL_OVERRIDES = {
  "15::できる": ["n4_0362"],
  "16::(お)花見 ((お)はなみ)": ["n4_0037"],
  "19::(電気が) つく": ["n4_0080"],
  "19::かける": [],
  "20::(～を) 取る (とる)": ["n4_0622", "n4_0636"],
  "20::(～を) つける": ["n4_0627"],
  "20::(～を) かける": ["n4_0626"],
  "21::無理 (むり)": ["n4_0421"],
  "22::(～に) 近づく (ちかづく)": ["n4_0642"],
  "22::無理(する) (むりする)": ["n4_0648"],
  "23::発売(する) (はつばいする)": ["n4_0671"],
  "24::(嘘を) つく (うそをつく)": ["n4_0170"],
  "24::(鍵を) 掛ける (かぎをかける)": ["n4_0175"],
  "24::(ソースを) 掛ける (ソースをかける)": ["n4_0377"],
}

// Split into chapter sections on "## 🌸 BÀI N (Chương N)" headers.
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

// Within a chapter section, only the "### 📝 Từ vựng" table(s) count --
// "### 💬 Biểu hiện thực tế" phrases aren't vocabulary.json entries (that
// section doesn't exist in the original word-list source at all).
function extractVocabRows(sectionText) {
  const rows = []
  const blocks = sectionText.split(/### 💬/)[0] // drop everything from Biểu hiện onward
  const lines = blocks.split("\n")
  for (const line of lines) {
    const rowMatch = line.match(/^\|\s*(\d+)\s*\|\s*(.+?)\s*\|/)
    if (!rowMatch) continue
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
const ambiguous = []
const unmatched = []
const conflicts = []

const idIndex = new Map(vocab.map(e => [e.id, e]))

for (const { chapter, text } of chapterSections) {
  const rows = extractVocabRows(text)
  for (const raw of rows) {
    const overrideKey = `${chapter}::${raw.replace(/\*\*/g, "").trim()}`
    const overrideIds = MANUAL_OVERRIDES[overrideKey]
    if (overrideIds) {
      if (overrideIds.length === 0) {
        unmatched.push({ chapter, raw })
        continue
      }
      for (const id of overrideIds) {
        const entry = idIndex.get(id)
        if (!entry) throw new Error(`Override ${overrideKey} points at unknown id ${id}`)
        entry.chapter = chapter
        matched.push({ chapter, id: entry.id, kanji: entry.kanji, kana: entry.kana })
      }
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
      // Fallback: kana didn't match exactly (rare formatting drift) --
      // try an exact core-kanji match across the whole vocab set.
      const wantCore = coreKanji(kanjiPart)
      candidates = vocab.filter(e => coreKanji(e.kanji) === wantCore)
    }

    if (candidates.length === 0) {
      unmatched.push({ chapter, raw })
      continue
    }
    if (candidates.length > 1) {
      ambiguous.push({ chapter, raw, candidates: candidates.map(c => c.id) })
      continue
    }

    const entry = candidates[0]
    if (entry.chapter !== undefined && entry.chapter !== chapter) {
      conflicts.push({ id: entry.id, kanji: entry.kanji, existing: entry.chapter, new: chapter })
      continue
    }
    entry.chapter = chapter
    matched.push({ chapter, id: entry.id, kanji: entry.kanji, kana: entry.kana })
  }
}

fs.writeFileSync(vocabPath, JSON.stringify(vocab, null, 2) + "\n")

console.log(`Matched & tagged: ${matched.length}`)
console.log(`Ambiguous (skipped, needs manual review): ${ambiguous.length}`)
console.log(`Unmatched (skipped, not found in vocabulary.json): ${unmatched.length}`)
console.log(`Conflicts (already had a different chapter, skipped): ${conflicts.length}`)

const byChapter = {}
for (const m of matched) byChapter[m.chapter] = (byChapter[m.chapter] || 0) + 1
console.log("\nPer-chapter counts:")
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
  for (const c of conflicts) console.log(`  ${c.id} (${c.kanji}): already ch${c.existing}, doc says ch${c.new}`)
}
