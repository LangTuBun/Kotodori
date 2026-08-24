// Applies scripts/n4-vocab-en.mjs's hand-translated meanings.en onto
// src/data/n4/vocabulary.json, keyed by id. Hard-fails (same discipline as
// assemble-enrichment.mjs / apply-n5-grammar-en.mjs) on any id mismatch
// between the two files, or on an entry whose meanings.en is already
// non-empty (would silently clobber prior work instead of failing loud).
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { EN } from "./n4-vocab-en.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const vocabPath = path.join(__dirname, "../src/data/n4/vocabulary.json")
const vocab = JSON.parse(fs.readFileSync(vocabPath, "utf8"))

const jsonIds = new Set(vocab.map(v => v.id))
const enIds = new Set(Object.keys(EN))

const missingFromEn = [...jsonIds].filter(id => !enIds.has(id))
const extraInEn = [...enIds].filter(id => !jsonIds.has(id))
if (missingFromEn.length || extraInEn.length) {
  throw new Error(`id mismatch -- missing from EN: ${JSON.stringify(missingFromEn)}; extra in EN: ${JSON.stringify(extraInEn)}`)
}

let filled = 0
let skippedNonEmpty = 0

for (const v of vocab) {
  if (v.meanings.en) {
    skippedNonEmpty++
    continue
  }
  v.meanings.en = EN[v.id]
  filled++
}

fs.writeFileSync(vocabPath, JSON.stringify(vocab, null, 2) + "\n")
console.log(`filled meanings.en: ${filled}, skipped (already non-empty): ${skippedNonEmpty}, total: ${vocab.length}`)
