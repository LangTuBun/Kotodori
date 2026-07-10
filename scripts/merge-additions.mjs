// Merges scripts/vocab-additions.mjs into src/data/n5/kanji.json.
// New words are tagged `curated: true` so the UI can visually distinguish
// hand-curated additions from the original textbook-sourced words.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import additions from "./vocab-additions.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, "..", "src", "data", "n5", "kanji.json")

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
    // sanity check: onkun token count should match kanji-char count
    // (except irregular Juku/Ate whole-word readings).
    if (w.onkun !== "Juku" && w.onkun !== "Ate") {
      const nChars = kanjiChars(w.kanji).length
      const nTokens = w.onkun.split("--").length
      if (nChars !== nTokens) {
        warnings.push(`${id}: onkun token mismatch for ${w.kanji} (${nChars} kanji chars vs "${w.onkun}")`)
      }
    }
    group.words.push({ ...w, curated: true })
    existingKanji.add(w.kanji)
    applied++
  }
}

for (const c of data.chapters) {
  c.wordCount = c.groups.reduce((a, g) => a + g.words.length, 0)
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n", "utf8")

console.log(`Applied ${applied} curated words.`)
if (warnings.length) {
  console.log(`${warnings.length} warning(s):`)
  for (const w of warnings) console.log(`  - ${w}`)
}
