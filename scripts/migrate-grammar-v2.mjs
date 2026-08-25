#!/usr/bin/env node
// Grammar Expansion V2 -- migration script.
//
// Scaffolds the new EnhancedGrammarPoint fields (patternRomaji,
// formationRules, pragmatics, notesAndPitfalls, richExamples,
// opposingGrammar) onto every record in src/data/n5/grammar.json and
// src/data/n4/grammar.json.
//
// - Idempotent: a record that already has `richExamples` is left alone,
//   so running this twice never double-wraps data.
// - Non-destructive: the legacy `examples` array is kept as-is (the app's
//   existing renderers read it) -- richExamples is an addition, not a
//   replacement of that field. The single legacy example is copied into
//   richExamples[0] with category "standard" as a starting point for
//   enrichment (scripts/apply-enrichment.mjs fills in the rest).
//
// Usage: node scripts/migrate-grammar-v2.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FILES = [
  path.join(__dirname, '../src/data/n5/grammar.json'),
  path.join(__dirname, '../src/data/n4/grammar.json'),
]

function migrateRecord(g) {
  if (Array.isArray(g.richExamples)) return { record: g, migrated: false }

  const richExamples = (g.examples || []).map(ex => ({
    category: 'standard',
    ja: ex.ja,
    ...(ex.jaRuby ? { jaRuby: ex.jaRuby } : {}),
    kana: ex.kana || '',
    romaji: '',
    vi: ex.vi,
    en: ex.en,
    contextualExplanation: { vi: '', en: '' },
  }))

  return {
    migrated: true,
    record: {
      ...g,
      patternRomaji: g.patternRomaji || '',
      formationRules: g.formationRules || [],
      pragmatics: g.pragmatics || { tones: [] },
      notesAndPitfalls: g.notesAndPitfalls || [],
      richExamples,
      opposingGrammar: g.opposingGrammar || [],
    },
  }
}

let totalMigrated = 0
for (const file of FILES) {
  const data = JSON.parse(readFileSync(file, 'utf-8'))
  let migratedCount = 0
  const next = data.map(g => {
    const { record, migrated } = migrateRecord(g)
    if (migrated) migratedCount++
    return record
  })
  writeFileSync(file, JSON.stringify(next, null, 2) + '\n', 'utf-8')
  console.log(`${path.basename(path.dirname(file))}/grammar.json: ${migratedCount} migrated, ${data.length - migratedCount} already migrated (${data.length} total)`)
  totalMigrated += migratedCount
}
console.log(`Done. ${totalMigrated} records migrated.`)
