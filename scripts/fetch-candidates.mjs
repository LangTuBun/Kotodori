// Fetches candidate real-word data from Jisho for every sparse kanji group
// (<=2 words currently) so vocabulary additions are grounded in real
// dictionary entries rather than hand-invented ones. Dumps a JSON report.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, "..", "src", "data", "n5", "kanji.json")
const outPath = process.argv[2] || path.join(__dirname, "candidates.json")

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"))

const sparse = []
for (const c of data.chapters) {
  for (const g of c.groups) {
    if (g.words.length <= 2) {
      sparse.push({ chapter: c.chapter, anchor: g.anchor, existing: g.words.map(w => w.kanji) })
    }
  }
}

console.log(`${sparse.length} sparse groups to fetch.`)

const report = []
let i = 0
for (const s of sparse) {
  i++
  const url = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(s.anchor)}`
  let json
  try {
    const res = await fetch(url)
    const raw = (await res.text()).replace(/[\x00-\x1f]/g, "")
    json = JSON.parse(raw)
  } catch (e) {
    console.warn(`  [${i}/${sparse.length}] ${s.anchor}: fetch failed (${e.message})`)
    report.push({ ...s, candidates: [] })
    continue
  }
  const candidates = (json.data || [])
    .filter(e => e.japanese?.[0]?.word?.includes(s.anchor))
    .map(e => ({
      word: e.japanese[0].word,
      reading: e.japanese[0].reading,
      common: !!e.is_common,
      jlpt: (e.jlpt || []).map(t => t.replace("jlpt-", "")),
      en: e.senses?.[0]?.english_definitions || [],
    }))
    .filter(c => !s.existing.includes(c.word))
  report.push({ ...s, candidates })
  if (i % 15 === 0) console.log(`  [${i}/${sparse.length}] fetched...`)
}

fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n", "utf8")
console.log(`Wrote ${outPath}`)
