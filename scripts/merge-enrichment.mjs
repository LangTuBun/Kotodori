// Merges scripts/enrichment-additions.json into src/data/n5/kanji.json.
// Same shape/sanity-checks as merge-additions.mjs (onkun token count vs
// kanji-char count, duplicate-within-group skip), reading from the N5
// vocabulary-enrichment pass instead of the hand-curated sparse-group file.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, "..", "src", "data", "n5", "kanji.json")
const additions = JSON.parse(fs.readFileSync(path.join(__dirname, "enrichment-additions.json"), "utf8"))

const KANJI_RE = /[一-鿿㐀-䶿々]/
const kanjiChars = s => [...s].filter(ch => KANJI_RE.test(ch))

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"))
const groupsById = new Map()
for (const c of data.chapters) for (const g of c.groups) groupsById.set(g.id, g)

let applied = 0
const warnings = []

for (const [id, words] of Object.entries(additions)) {
  const group = groupsById.get(id)
  if (!group) {
    warnings.push(`unknown group id: ${id}`)
    continue
  }
  const existingKanji = new Set(group.words.map(w => w.kanji))
  for (const w of words) {
    if (existingKanji.has(w.kanji)) {
      warnings.push(`${id}: duplicate word skipped: ${w.kanji}`)
      continue
    }
    if (w.onkun !== "Juku" && w.onkun !== "Ate") {
      const nChars = kanjiChars(w.kanji).length
      const nTokens = w.onkun.split("--").length
      if (nChars !== nTokens) {
        warnings.push(`${id}: onkun token mismatch for ${w.kanji} (${nChars} kanji chars vs "${w.onkun}")`)
      }
    }
    if (!w.hanviet) warnings.push(`${id}: missing hanviet for ${w.kanji}`)
    group.words.push({ ...w, curated: true })
    existingKanji.add(w.kanji)
    applied++
  }
}

for (const c of data.chapters) {
  c.wordCount = c.groups.reduce((a, g) => a + g.words.length, 0)
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n", "utf8")

console.log(`Applied ${applied} enrichment words.`)
if (warnings.length) {
  console.log(`${warnings.length} warning(s):`)
  for (const w of warnings) console.log(`  - ${w}`)
}
