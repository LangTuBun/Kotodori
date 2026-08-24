// Extends scripts/all-readings.json with on'yomi/kun'yomi for every kanji
// character appearing in the N4 source that isn't already cached (merge-safe
// -- skips characters already present). Needed before split-n4-fused.mjs can
// run its reading-match splitter on the full N4 word list.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rawRowsPath = path.join(__dirname, "n4-raw-rows.json")
const cachePath = path.join(__dirname, "all-readings.json")

const KANJI_RE = /[一-鿿㐀-䶿々]/
const rows = JSON.parse(fs.readFileSync(rawRowsPath, "utf8"))
const cache = JSON.parse(fs.readFileSync(cachePath, "utf8"))

const chars = new Set()
for (const r of rows) for (const ch of r.fused) if (KANJI_RE.test(ch)) chars.add(ch)
const missing = [...chars].filter(c => !cache[c])

console.log(`${chars.size} unique kanji, ${missing.length} missing from cache.`)

let i = 0
for (const ch of missing) {
  i++
  const url = `https://kanjiapi.dev/v1/kanji/${encodeURIComponent(ch)}`
  const res = await fetch(url)
  if (!res.ok) {
    console.warn(`  [${i}/${missing.length}] ${ch}: HTTP ${res.status}`)
    cache[ch] = { on: [], kun: [] }
    continue
  }
  const json = await res.json()
  cache[ch] = { on: json.on_readings ?? [], kun: json.kun_readings ?? [] }
  if (i % 30 === 0) console.log(`  [${i}/${missing.length}] fetched...`)
}

fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2) + "\n", "utf8")
console.log(`Cache now has ${Object.keys(cache).length} characters.`)
