// Adds `requiredVerbForm: string[]` to each grammar.json entry, linking it to
// the verb-forms.json conjugation(s) it's built on (dictionary/nai/ta/te/
// potential/potential-past/volitional/ba). grammar.json's `tags` and
// `relatedGrammar` fields are empty for all 135 entries, so this can't be
// derived automatically from existing data — it's a hand-curated mapping,
// derived by reading every pattern string for an explicit conjugation
// marker (て, ない, た, ば, よう, 可能形…). Patterns with no such marker
// (noun/adjective/particle grammar, or masu-form — which isn't one of the
// 8 tracked forms) are intentionally left untagged rather than guessed.
// Re-run after grammar.json is rebuilt from the source doc.

import { readFileSync, writeFileSync } from 'node:fs'

const path = new URL('../src/data/n5/grammar.json', import.meta.url)
const grammar = JSON.parse(readFileSync(path, 'utf-8'))

const TAGS = {
  // dictionary form (辞書形)
  g_069: ['dictionary'], g_070: ['dictionary'], g_071: ['dictionary'],
  g_072: ['dictionary'], g_080_1: ['dictionary'],
  // nai form (ない形)
  g_073: ['nai'], g_074: ['nai'], g_087: ['nai', 'ba'], g_088: ['nai'],
  g_089: ['nai'], g_090: ['nai'], g_098_2: ['nai', 'te'], g_099: ['nai', 'te'],
  // ta form (た形)
  g_076: ['ta'], g_080_2: ['ta'], g_081: ['ta'], g_082: ['ta'], g_083: ['ta'],
  // te form (て形)
  g_091: ['te'], g_092: ['te'], g_093: ['te'],
  g_094_1: ['te'], g_094_2: ['te'], g_094_3: ['te'], g_094_4: ['te'], g_094_5: ['te'],
  g_095: ['te'], g_097: ['te'], g_098_1: ['te'], g_100: ['te'], g_101: ['te'],
  g_103: ['te'], g_105: ['te'],
  // potential (可能形)
  g_061_1: ['potential'], g_061_2: ['potential'], g_064: ['potential'], g_075: ['potential'],
  // potential-past (可能形の過去)
  g_077: ['potential-past'],
  // volitional (意向形)
  g_079: ['volitional'], g_106: ['volitional'],
  // ba form (ば形)
  g_084: ['ba'], g_085: ['ba'], g_086: ['ba'],
}

let tagged = 0
const next = grammar.map(entry => {
  const requiredVerbForm = TAGS[entry.id] ?? []
  if (requiredVerbForm.length > 0) tagged++
  return { ...entry, requiredVerbForm }
})

writeFileSync(path, JSON.stringify(next, null, 2) + '\n', 'utf-8')
console.log(`Tagged ${tagged}/${grammar.length} grammar points with requiredVerbForm.`)
