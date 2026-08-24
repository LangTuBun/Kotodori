// Extends src/data/hanviet-dictionary.json with whatever characters the N4
// vocabulary introduces beyond the existing (N5-derived) character set.
// Same source and lookup logic as fetch-secondary-kanji-data.mjs (the
// cached 2136-Jouyou-kanji table in saroma-map.json), just pointed at
// n4/vocabulary.json instead of the N5 enrichment pipeline's draft file.
// Idempotent -- skips characters already present.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const hanvietPath = path.join(__dirname, "..", "src", "data", "hanviet-dictionary.json")
const n4VocabPath = path.join(__dirname, "..", "src", "data", "n4", "vocabulary.json")
const saromaPath = path.join(__dirname, "saroma-map.json")

const KANJI_RE = /[一-鿿㐀-䶿々]/
const NO_HANVIET = new Set(["込", "々"])

const hanviet = JSON.parse(fs.readFileSync(hanvietPath, "utf8"))
const n4Vocab = JSON.parse(fs.readFileSync(n4VocabPath, "utf8"))
const saroma = fs.existsSync(saromaPath) ? JSON.parse(fs.readFileSync(saromaPath, "utf8")) : {}

const needed = new Set()
for (const v of n4Vocab) for (const ch of [...v.kanji].filter(c => KANJI_RE.test(c))) needed.add(ch)

function primaryReading(raw) {
  return raw.split(",")[0].split("(")[0].trim()
}
function cap(s) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s
}

let added = 0
const stillMissing = []
for (const ch of needed) {
  if (ch in hanviet || NO_HANVIET.has(ch)) continue
  const raw = saroma[ch]
  if (raw && !/^\(.*\)$/.test(raw.trim())) {
    hanviet[ch] = cap(primaryReading(raw))
    added++
  } else {
    stillMissing.push(ch)
  }
}
fs.writeFileSync(hanvietPath, JSON.stringify(hanviet, null, 2) + "\n", "utf8")
console.log(`${needed.size} unique kanji in N4 vocab. Added ${added} Han Viet entries. Still missing: ${stillMissing.length}${stillMissing.length ? ` (${stillMissing.join("")})` : ""}`)
