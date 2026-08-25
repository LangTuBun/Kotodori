#!/usr/bin/env node
// Grammar Expansion V2 -- one-off patch: pragmatics.intent/speakerStance/
// emotionalNuance were authored as plain (English-only) strings, breaking
// localization (the section label translates via t(), but the content
// itself stayed English no matter the UI language). This converts each
// field to a {vi, en} pair: existing content becomes `en`, and a supplied
// Vietnamese translation batch supplies `vi`.
//
// Usage: node scripts/patch-pragmatics-i18n.mjs <batch-file.mjs> [...]
// Each batch file default-exports { [id]: { intent?: string,
// speakerStance?: string, emotionalNuance?: string } } -- Vietnamese text
// only, one entry per field actually present on that record.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const N5_FILE = path.join(__dirname, '../src/data/n5/grammar.json')
const N4_FILE = path.join(__dirname, '../src/data/n4/grammar.json')
const FIELDS = ['intent', 'speakerStance', 'emotionalNuance']

async function loadBatch(file) {
  const mod = await import(pathToFileURL(path.resolve(file)).href)
  return mod.default
}

function patchRecord(g, viMap) {
  if (!g.pragmatics) return g
  const next = { ...g.pragmatics }
  for (const field of FIELDS) {
    const en = g.pragmatics[field]
    if (en === undefined) continue
    if (typeof en === 'object' && en !== null) continue // already migrated
    const vi = viMap?.[field]
    if (!vi) throw new Error(`${g.id}: missing Vietnamese translation for pragmatics.${field} ("${en}")`)
    next[field] = { vi, en }
  }
  return { ...g, pragmatics: next }
}

async function main() {
  const batchFiles = process.argv.slice(2)
  if (batchFiles.length === 0) {
    console.error('Usage: node scripts/patch-pragmatics-i18n.mjs <batch-file.mjs> [...]')
    process.exit(1)
  }

  const merged = {}
  for (const file of batchFiles) {
    const batch = await loadBatch(file)
    for (const [id, fields] of Object.entries(batch)) {
      if (merged[id]) console.warn(`WARN: id ${id} appears in more than one batch file -- last one wins`)
      merged[id] = fields
    }
  }

  const n5 = JSON.parse(readFileSync(N5_FILE, 'utf-8'))
  const n4 = JSON.parse(readFileSync(N4_FILE, 'utf-8'))
  const idToFile = new Map()
  for (const g of n5) idToFile.set(g.id, 'n5')
  for (const g of n4) idToFile.set(g.id, 'n4')

  const unknownIds = Object.keys(merged).filter(id => !idToFile.has(id))
  if (unknownIds.length) {
    console.error(`ERROR: unknown grammar ids in batch: ${unknownIds.join(', ')}`)
    process.exit(1)
  }

  const patched = []
  function apply(arr) {
    return arr.map(g => {
      if (!merged[g.id]) return g
      patched.push(g.id)
      return patchRecord(g, merged[g.id])
    })
  }

  const touchesN5 = n5.some(g => merged[g.id])
  const touchesN4 = n4.some(g => merged[g.id])
  const nextN5 = apply(n5)
  const nextN4 = apply(n4)
  if (touchesN5) writeFileSync(N5_FILE, JSON.stringify(nextN5, null, 2) + '\n', 'utf-8')
  if (touchesN4) writeFileSync(N4_FILE, JSON.stringify(nextN4, null, 2) + '\n', 'utf-8')

  console.log(`Patched pragmatics on ${patched.length} record(s): ${patched.join(', ')}`)
}

main().catch(err => { console.error(err.message); process.exit(1) })
