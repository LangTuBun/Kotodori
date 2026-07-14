// Selects candidates (from enrichment-candidates.json) to bring every anchor
// group up to a target word count, then auto-fills Han Viet (per-character
// concatenation) and on/kun tagging (reading-based classifier), flagging
// anything uncertain rather than guessing. Vietnamese `meaning` is left as
// the Jisho English gloss for hand-translation in the next step.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { classifyWord } from "./onkun-classifier.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, "..", "src", "data", "n5", "kanji.json")
const hanvietPath = path.join(__dirname, "..", "src", "data", "hanviet-dictionary.json")
const readingsPath = path.join(__dirname, "all-readings.json")
const candidatesPath = path.join(__dirname, "enrichment-candidates.json")

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"))
const hanviet = JSON.parse(fs.readFileSync(hanvietPath, "utf8"))
const allReadings = JSON.parse(fs.readFileSync(readingsPath, "utf8"))
const candidateReport = JSON.parse(fs.readFileSync(candidatesPath, "utf8"))

const KANJI_RE = /[一-鿿㐀-䶿々]/
const TARGET = 7

function katakanaToHiragana(s) {
  return s.replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))
}
function onKunByChar(ch) {
  const r = allReadings[ch]
  if (!r) return { on: [], kun: [] }
  return { on: r.on.map(katakanaToHiragana), kun: r.kun }
}
function hanVietForWord(kanjiStr) {
  const chars = [...kanjiStr].filter(ch => KANJI_RE.test(ch))
  const parts = chars.map(ch => hanviet[ch])
  if (parts.some(p => !p)) return null
  return parts.join(" ")
}
// Characters with more than one attested Han Viet reading depending on
// compound, found empirically by validating the concatenator against the
// existing hand-labeled corpus (scripts/validate-classifier.mjs --verbose)
// -- always flag words containing these for manual review even if
// concatenation "succeeds", since it may have picked the wrong one.
const MULTI_READING_CHARS = new Set(["読", "買", "少", "長"])

const groupsById = new Map()
for (const c of data.chapters) for (const g of c.groups) groupsById.set(g.id, g)

const draft = []
for (const report of candidateReport) {
  const group = groupsById.get(report.id)
  const need = TARGET - group.words.length
  if (need <= 0) continue

  const existingWords = new Set(group.words.map(w => w.kanji))
  const ranked = report.candidates
    // Only genuinely common words -- Jisho returns obscure/irregular
    // readings too (e.g. 二 read リャン/アル as Chinese Mahjong-tile loans),
    // and padding a quota with those would defeat "solid N5 foundation".
    .filter(c => c.common && !existingWords.has(c.word))
    .sort((a, b) => (b.jlpt.includes("n5") ? 1 : 0) - (a.jlpt.includes("n5") ? 1 : 0))
    .slice(0, need)

  const items = ranked.map(c => {
    const predicted = classifyWord(c.word, c.reading, onKunByChar)
    const onkunTag = predicted ? predicted.map(p => p.type).join("--") : null
    const hv = hanVietForWord(c.word)
    const containsMultiReading = [...c.word].some(ch => MULTI_READING_CHARS.has(ch))
    return {
      kanji: c.word,
      kana: c.reading,
      hanviet: hv,
      meaning_en: c.en.slice(0, 2).join("; "),
      onkun: onkunTag,
      flags: [
        !onkunTag && "ONKUN_UNRESOLVED",
        !hv && "HANVIET_UNRESOLVED",
        containsMultiReading && "MULTI_READING_CHAR_CHECK",
      ].filter(Boolean),
    }
  })

  if (items.length > 0) {
    draft.push({ id: report.id, anchor: report.anchor, chapter: report.chapter, currentCount: group.words.length, items })
  }
}

const totalNew = draft.reduce((a, d) => a + d.items.length, 0)
const flagged = draft.reduce((a, d) => a + d.items.filter(i => i.flags.length > 0).length, 0)
console.log(`${draft.length} groups need words, ${totalNew} candidate words drafted, ${flagged} flagged for review.`)

fs.writeFileSync(path.join(__dirname, "enrichment-draft.json"), JSON.stringify(draft, null, 2) + "\n", "utf8")
console.log("Wrote scripts/enrichment-draft.json")
