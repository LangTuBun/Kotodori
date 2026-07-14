// Like fetch-candidates.mjs but for every anchor (not just sparse groups) --
// used for the N5 vocabulary-enrichment pass. Dumps real Jisho words +
// readings + English glosses per anchor so additions are grounded rather
// than invented; Han Viet / Vietnamese meaning / on-kun tagging happen in a
// later curation step (scripts/enrichment-additions.mjs).
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, "..", "src", "data", "n5", "kanji.json")
const outPath = process.argv[2] || path.join(__dirname, "enrichment-candidates.json")

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"))

const groups = []
for (const c of data.chapters) {
  for (const g of c.groups) {
    groups.push({ chapter: c.chapter, id: g.id, anchor: g.anchor, existing: g.words.map(w => w.kanji) })
  }
}

console.log(`${groups.length} anchor groups to fetch.`)

const report = []
let i = 0
for (const s of groups) {
  i++
  const url = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(s.anchor)}`
  let json
  try {
    const res = await fetch(url)
    const raw = (await res.text()).replace(/[\x00-\x1f]/g, "")
    json = JSON.parse(raw)
  } catch (e) {
    console.warn(`  [${i}/${groups.length}] ${s.anchor}: fetch failed (${e.message})`)
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
  if (i % 15 === 0) console.log(`  [${i}/${groups.length}] fetched...`)
}

fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n", "utf8")
console.log(`Wrote ${outPath}`)
