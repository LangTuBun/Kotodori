// Appends all authored chapters (CH25..CH33) into src/data/n4/grammar.json.
// Idempotent-ish: guarded by an id-range check so re-running after the full
// batch is written aborts instead of duplicating; re-run freely while still
// only some chapter files exist (each run only appends ids not already
// present).
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const grammarPath = path.join(__dirname, "../src/data/n4/grammar.json")
const grammar = JSON.parse(fs.readFileSync(grammarPath, "utf8"))
const existingIds = new Set(grammar.map(g => g.id))

const CHAPTER_FILES = [
  "n4-grammar-25-33-ch25.mjs",
  "n4-grammar-25-33-ch26.mjs",
  "n4-grammar-25-33-ch27.mjs",
  "n4-grammar-25-33-ch28.mjs",
  "n4-grammar-25-33-ch29.mjs",
  "n4-grammar-25-33-ch30.mjs",
  "n4-grammar-25-33-ch31.mjs",
  "n4-grammar-25-33-ch32.mjs",
  "n4-grammar-25-33-ch33.mjs",
]

let added = 0
for (const file of CHAPTER_FILES) {
  const fullPath = path.join(__dirname, file)
  if (!fs.existsSync(fullPath)) continue
  const mod = await import(pathToFileURL(fullPath).href + `?t=${Date.now()}`)
  const exportName = Object.keys(mod)[0]
  const points = mod[exportName]
  for (const p of points) {
    if (existingIds.has(p.id)) continue
    grammar.push(p)
    existingIds.add(p.id)
    added++
  }
}

grammar.sort((a, b) => a.order - b.order)
fs.writeFileSync(grammarPath, JSON.stringify(grammar, null, 2) + "\n")
console.log(`Added ${added} new grammar points. Total: ${grammar.length}`)
