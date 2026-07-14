// Enrichment vocab candidates (from Jisho) inevitably pull in secondary
// kanji beyond our original 635-character universe (e.g. 大人's 人 was
// covered, but 土産's 産/土 combo or 七夕's 夕/七 might introduce fresh
// ones). Extends both scripts/all-readings.json (kanjiapi on/kun) and
// src/data/hanviet-dictionary.json (via the same 2136-joyo-kanji table used
// originally -- see scripts note in that file's git history) with whatever
// new characters showed up. Idempotent: skips characters already present.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const readingsPath = path.join(__dirname, "all-readings.json")
const hanvietPath = path.join(__dirname, "..", "src", "data", "hanviet-dictionary.json")
const draftPath = path.join(__dirname, "enrichment-draft.json")
const saromaPath = path.join(__dirname, "saroma-map.json")

const KANJI_RE = /[一-鿿㐀-䶿々]/
const NO_HANVIET = new Set(["込", "々"])

const allReadings = JSON.parse(fs.readFileSync(readingsPath, "utf8"))
const hanviet = JSON.parse(fs.readFileSync(hanvietPath, "utf8"))
const draft = JSON.parse(fs.readFileSync(draftPath, "utf8"))
const saroma = fs.existsSync(saromaPath) ? JSON.parse(fs.readFileSync(saromaPath, "utf8")) : {}

const needed = new Set()
for (const g of draft) for (const it of g.items) {
  for (const ch of [...it.kanji].filter(c => KANJI_RE.test(c))) needed.add(ch)
}

const missingReadings = [...needed].filter(ch => !(ch in allReadings))
console.log(`${missingReadings.length} characters need reading data.`)

const CONCURRENCY = 8
let i = 0
async function worker() {
  while (i < missingReadings.length) {
    const ch = missingReadings[i++]
    try {
      const res = await fetch(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(ch)}`)
      if (!res.ok) { allReadings[ch] = { on: [], kun: [] }; continue }
      const json = await res.json()
      allReadings[ch] = { on: json.on_readings ?? [], kun: json.kun_readings ?? [] }
    } catch {
      allReadings[ch] = { on: [], kun: [] }
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
fs.writeFileSync(readingsPath, JSON.stringify(allReadings, null, 2), "utf8")
console.log(`Updated ${readingsPath}`)

function primaryReading(raw) {
  return raw.split(",")[0].split("(")[0].trim()
}
function cap(s) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s
}

let addedHanviet = 0
const stillMissingHanviet = []
for (const ch of needed) {
  if (ch in hanviet || NO_HANVIET.has(ch)) continue
  const raw = saroma[ch]
  if (raw && !/^\(.*\)$/.test(raw.trim())) {
    hanviet[ch] = cap(primaryReading(raw))
    addedHanviet++
  } else {
    stillMissingHanviet.push(ch)
  }
}
fs.writeFileSync(hanvietPath, JSON.stringify(hanviet, null, 2) + "\n", "utf8")
console.log(`Added ${addedHanviet} Han Viet entries. Still missing: ${stillMissingHanviet.length} (${stillMissingHanviet.join("")})`)
