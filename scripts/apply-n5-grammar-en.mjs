// Applies scripts/n5-grammar-en.mjs's hand-translated meaning.en /
// examples[0].en onto src/data/n4/../n5/grammar.json, keyed by id.
// Hard-fails (same discipline as assemble-enrichment.mjs) on: an id present
// in the JSON but missing from EN, an id in EN not found in the JSON, or an
// entry whose meaning.en/examples[0].en is already non-empty (would silently
// clobber prior work instead of failing loud).
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { EN } from "./n5-grammar-en.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const grammarPath = path.join(__dirname, "../src/data/n5/grammar.json")
const grammar = JSON.parse(fs.readFileSync(grammarPath, "utf8"))

const jsonIds = new Set(grammar.map(g => g.id))
const enIds = new Set(Object.keys(EN))

const missingFromEn = [...jsonIds].filter(id => !enIds.has(id))
const extraInEn = [...enIds].filter(id => !jsonIds.has(id))
if (missingFromEn.length || extraInEn.length) {
  throw new Error(`id mismatch -- missing from EN: ${JSON.stringify(missingFromEn)}; extra in EN: ${JSON.stringify(extraInEn)}`)
}

let filledMeaning = 0
let filledExample = 0
let skippedNonEmpty = 0

for (const g of grammar) {
  const en = EN[g.id]
  if (g.meaning.en) {
    skippedNonEmpty++
  } else if (en.meaning) {
    g.meaning.en = en.meaning
    filledMeaning++
  }
  if (g.examples[0] && !g.examples[0].en && en.example) {
    g.examples[0].en = en.example
    filledExample++
  }
}

fs.writeFileSync(grammarPath, JSON.stringify(grammar, null, 2) + "\n")
console.log(`filled meaning.en: ${filledMeaning}, filled examples[0].en: ${filledExample}, skipped (already non-empty): ${skippedNonEmpty}`)
