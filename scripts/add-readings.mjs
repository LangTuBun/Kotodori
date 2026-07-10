// Enriches src/data/n5/kanji.json with real on'yomi/kun'yomi kana readings
// (e.g. On: タ, Kun: おお.い) fetched from kanjiapi.dev, one call per unique
// anchor kanji. Run after build-kanji.mjs.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, "..", "src", "data", "n5", "kanji.json")

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"))

const anchors = new Set()
for (const c of data.chapters) for (const g of c.groups) anchors.add(g.anchor)

const readings = new Map()
let i = 0
for (const anchor of anchors) {
  i++
  const url = `https://kanjiapi.dev/v1/kanji/${encodeURIComponent(anchor)}`
  const res = await fetch(url)
  if (!res.ok) {
    console.warn(`  [${i}/${anchors.size}] ${anchor}: HTTP ${res.status}`)
    readings.set(anchor, { on: [], kun: [] })
    continue
  }
  const json = await res.json()
  readings.set(anchor, { on: json.on_readings ?? [], kun: json.kun_readings ?? [] })
  if (i % 20 === 0) console.log(`  [${i}/${anchors.size}] fetched...`)
}

for (const c of data.chapters) {
  for (const g of c.groups) {
    const r = readings.get(g.anchor) ?? { on: [], kun: [] }
    g.onyomi = r.on
    g.kunyomi = r.kun
  }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n", "utf8")
console.log(`Enriched ${anchors.size} anchor kanji with on'yomi/kun'yomi readings.`)
