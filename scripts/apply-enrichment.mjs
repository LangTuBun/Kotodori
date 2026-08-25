#!/usr/bin/env node
// Grammar Expansion V2 -- enrichment merge script.
//
// Reads one or more enrichment batch modules (each a .mjs file default-
// exporting an object keyed by grammar point id -> partial fields) and
// merges them into src/data/n5/grammar.json / src/data/n4/grammar.json.
//
// A batch entry may set any of: patternRomaji, formationRules, pragmatics,
// notesAndPitfalls, richExamples, opposingGrammar, relatedGrammar, tags,
// explanation. These fully REPLACE the corresponding field on the record
// (richExamples in particular -- a batch entry provides the complete,
// final example set, not a delta). Fields not mentioned are left as-is.
//
// Usage: node scripts/apply-enrichment.mjs <batch-file.mjs> [<batch-file2.mjs> ...]
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const N5_FILE = path.join(__dirname, '../src/data/n5/grammar.json')
const N4_FILE = path.join(__dirname, '../src/data/n4/grammar.json')

const REPLACE_FIELDS = [
  'patternRomaji', 'formationRules', 'pragmatics', 'notesAndPitfalls',
  'richExamples', 'opposingGrammar', 'relatedGrammar', 'tags', 'explanation',
  'nuances',
]

async function loadBatch(file) {
  const mod = await import(pathToFileURL(path.resolve(file)).href)
  return mod.default
}

async function main() {
  const batchFiles = process.argv.slice(2)
  if (batchFiles.length === 0) {
    console.error('Usage: node scripts/apply-enrichment.mjs <batch-file.mjs> [...]')
    process.exit(1)
  }

  const merged = {}
  for (const file of batchFiles) {
    const batch = await loadBatch(file)
    for (const [id, fields] of Object.entries(batch)) {
      if (merged[id]) console.warn(`WARN: id ${id} enriched by more than one batch file -- last one wins`)
      merged[id] = fields
    }
  }

  const n5 = JSON.parse(readFileSync(N5_FILE, 'utf-8'))
  const n4 = JSON.parse(readFileSync(N4_FILE, 'utf-8'))
  const idToFile = new Map()
  for (const g of n5) idToFile.set(g.id, 'n5')
  for (const g of n4) idToFile.set(g.id, 'n4')

  const applied = []
  const unknownIds = []
  for (const id of Object.keys(merged)) {
    if (!idToFile.has(id)) unknownIds.push(id)
  }
  if (unknownIds.length) {
    console.error(`ERROR: unknown grammar ids in batch (no matching record): ${unknownIds.join(', ')}`)
    process.exit(1)
  }

  function apply(arr) {
    return arr.map(g => {
      const fields = merged[g.id]
      if (!fields) return g
      applied.push(g.id)
      const next = { ...g }
      for (const key of REPLACE_FIELDS) {
        if (key in fields) next[key] = fields[key]
      }
      return next
    })
  }

  // Only rewrite a file if this run actually touches an id in it -- so
  // `git diff` after a batch shows exactly what that batch changed, not a
  // whole-file reserialization of ~130 untouched records every time.
  const touchesN5 = n5.some(g => merged[g.id])
  const touchesN4 = n4.some(g => merged[g.id])
  if (touchesN5) writeFileSync(N5_FILE, JSON.stringify(apply(n5), null, 2) + '\n', 'utf-8')
  if (touchesN4) writeFileSync(N4_FILE, JSON.stringify(apply(n4), null, 2) + '\n', 'utf-8')

  console.log(`Applied enrichment to ${applied.length} record(s): ${applied.join(', ')}`)
}

main()
