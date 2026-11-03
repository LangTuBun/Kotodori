import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { sentenceBreakdowns } from '../src/data/sentence-breakdowns.ts'

const grammar = ['n4', 'n5'].flatMap(level => JSON.parse(readFileSync(new URL(`../src/data/${level}/grammar.json`, import.meta.url), 'utf8')))
const grammarIds = new Set(grammar.map(point => point.id))
const examples = new Set(grammar.flatMap(point => (point.richExamples ?? []).map(example => example.ja)))
const reading = readFileSync(new URL('../src/pages/Reading.tsx', import.meta.url), 'utf8')
for (const [sentence, data] of Object.entries(sentenceBreakdowns)) {
  assert.equal(data.sentence, sentence)
  assert.equal(data.chunks.map(chunk => chunk.text).join(''), sentence, `Chunks must reconstruct ${sentence}`)
  assert.ok(examples.has(sentence) || reading.includes(sentence), `Unreachable sentence: ${sentence}`)
  for (const field of [data.translation, data.together, ...data.chunks.flatMap(chunk => [chunk.label, chunk.detail])]) {
    assert.ok(field.en && field.vi, `Missing translation for ${sentence}`)
  }
  for (const chunk of data.chunks) {
    for (const id of chunk.grammarIds ?? []) assert.ok(grammarIds.has(id), `Unknown grammar ${id}`)
    for (const word of chunk.words ?? []) assert.ok(word.text && word.kana && word.meaning.en && word.meaning.vi, `Incomplete word in ${sentence}`)
  }
}
const readingSentences = [...reading.matchAll(/jp: "([^"]+)"/g)].map(match => match[1]).slice(1, -1)
for (const sentence of readingSentences) assert.ok(sentenceBreakdowns[sentence], `Missing chapter 16 breakdown: ${sentence}`)
console.log('Sentence breakdowns: structure, placement and translations OK')
