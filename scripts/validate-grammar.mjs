#!/usr/bin/env node
// Grammar Expansion V2 -- validation script.
//
// `npm run build` passing is NOT a sufficient check here: every new field
// is optional, so a malformed or empty record type-checks fine and just
// renders blank. This script asserts real content per record, and (most
// importantly) that every cross-reference id used anywhere
// (relatedGrammar / opposingGrammar / notesAndPitfalls[].relatedGrammarId)
// actually resolves to a real grammar point -- invented ids are the bug
// most likely to ship silently.
//
// Usage: node scripts/validate-grammar.mjs [--strict]
//   --strict  also fail on records that haven't been enriched yet
//             (empty richExamples/formationRules/pragmatics/notesAndPitfalls).
//             Without it, unmigrated/not-yet-enriched records are reported
//             as a summary count only (expected during incremental rollout).
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const strict = process.argv.includes('--strict')

const n5 = JSON.parse(readFileSync(path.join(__dirname, '../src/data/n5/grammar.json'), 'utf-8'))
const n4 = JSON.parse(readFileSync(path.join(__dirname, '../src/data/n4/grammar.json'), 'utf-8'))
const all = [...n5, ...n4]
const allIds = new Set(all.map(g => g.id))

const KANJI_RE = /[一-鿿]/
const errors = []
let unenriched = 0
let enrichedCount = 0

for (const g of all) {
  const has = {
    // >= 2, not > 0: migration scaffolds richExamples[0] from the legacy
    // `examples` entry (empty kana/romaji/contextualExplanation), so a
    // record that only has that scaffold must NOT read as "populated" --
    // otherwise every unenriched record would trip the partial-enrichment
    // check below the moment it merely exists.
    richExamples: Array.isArray(g.richExamples) && g.richExamples.length >= 2,
    formationRules: Array.isArray(g.formationRules) && g.formationRules.length > 0,
    pragmatics: !!g.pragmatics && Array.isArray(g.pragmatics.tones) && g.pragmatics.tones.length > 0,
  }
  const isEnriched = has.richExamples && has.formationRules && has.pragmatics
  const anyPopulated = has.richExamples || has.formationRules || has.pragmatics

  if (!isEnriched) {
    unenriched++
    // A record with SOME but not all of the three enrichment fields filled
    // in is worse than an untouched one -- it reads as "not started" in the
    // summary count above while actually being half-written. Always flag
    // this, even outside --strict.
    if (anyPopulated) {
      errors.push(`${g.id}: partially enriched (richExamples:${has.richExamples} formationRules:${has.formationRules} pragmatics:${has.pragmatics}) -- finish or revert`)
    }
    if (!strict) continue
  } else {
    enrichedCount++
  }

  // -- richExamples content checks --
  if (Array.isArray(g.richExamples)) {
    if (isEnriched && g.richExamples.length < 4) {
      errors.push(`${g.id}: only ${g.richExamples.length} richExamples (expected >= 4)`)
    }
    g.richExamples.forEach((ex, i) => {
      const label = `${g.id}.richExamples[${i}]`
      for (const field of ['ja', 'kana', 'romaji', 'vi', 'en']) {
        if (!ex[field] || !String(ex[field]).trim()) errors.push(`${label}: missing/empty "${field}"`)
      }
      if (!ex.contextualExplanation?.vi?.trim()) errors.push(`${label}: missing contextualExplanation.vi`)
      if (!ex.contextualExplanation?.en?.trim()) errors.push(`${label}: missing contextualExplanation.en`)
      if (!ex.category) errors.push(`${label}: missing category`)
      // Every enriched example is authored with full ruby markup (a
      // deliberate all-or-nothing call -- see scripts/enrich-data/golden-sample.mjs
      // header -- so the Furigana toggle never silently no-ops on some
      // examples of an enriched point but not others).
      if (isEnriched && ex.ja && KANJI_RE.test(ex.ja) && !ex.jaRuby) {
        errors.push(`${label}: "ja" contains kanji but "jaRuby" is missing`)
      }
      // Hand-authored <ruby> HTML is exactly the kind of thing a typo slips
      // into unnoticed (stray space breaking a closing tag, a dropped
      // character, mismatched tag counts) -- verify structurally: stripping
      // all <rt>/<rp> reading annotations and the <ruby></ruby> wrapper tags
      // themselves must reconstruct `ja` exactly, character for character.
      if (ex.jaRuby) {
        const stripped = ex.jaRuby
          .replace(/<rt>.*?<\/rt>/g, '')
          .replace(/<rp>.*?<\/rp>/g, '')
          .replace(/<\/?ruby>/g, '')
        if (stripped !== ex.ja) {
          errors.push(`${label}: jaRuby does not reconstruct to "ja" when stripped -- got "${stripped}" vs "${ex.ja}"`)
        }
      }
    })
  }

  // -- cross-reference integrity --
  for (const id of g.relatedGrammar || []) {
    if (!allIds.has(id)) errors.push(`${g.id}: relatedGrammar references unknown id "${id}"`)
  }
  for (const id of g.opposingGrammar || []) {
    if (!allIds.has(id)) errors.push(`${g.id}: opposingGrammar references unknown id "${id}"`)
  }
  // Same id in both lists renders the same cross-reference chip twice under
  // two different headings in the drawer -- pick one relationship per pair.
  for (const id of g.relatedGrammar || []) {
    if ((g.opposingGrammar || []).includes(id)) {
      errors.push(`${g.id}: id "${id}" appears in both relatedGrammar and opposingGrammar`)
    }
  }
  for (const pitfall of g.notesAndPitfalls || []) {
    if (pitfall.relatedGrammarId && !allIds.has(pitfall.relatedGrammarId)) {
      errors.push(`${g.id}: notesAndPitfalls relatedGrammarId references unknown id "${pitfall.relatedGrammarId}"`)
    }
    if (!pitfall.description?.vi?.trim() || !pitfall.description?.en?.trim()) {
      errors.push(`${g.id}: notesAndPitfalls "${pitfall.title}" missing description vi/en`)
    }
  }

  // -- formationRules content checks --
  for (const rule of g.formationRules || []) {
    if (!rule.pos || !rule.form || !rule.exampleStr) {
      errors.push(`${g.id}: formationRules entry missing pos/form/exampleStr`)
    }
  }
}

console.log(`${all.length} total grammar points (${n5.length} N5 + ${n4.length} N4)`)
console.log(`${enrichedCount} fully enriched, ${unenriched} not yet enriched`)

if (errors.length) {
  console.log(`\n${errors.length} validation error(s):`)
  for (const e of errors) console.log(`  - ${e}`)
  process.exit(1)
} else {
  console.log('No validation errors.')
}
