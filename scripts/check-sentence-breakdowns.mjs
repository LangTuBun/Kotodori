import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { sentenceBreakdowns } from '../src/data/sentence-breakdowns.ts'
import { readingGuides, readingChapterPages, resolveReadingSelection } from '../src/data/reading-guides.ts'

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
const expectedExercises = Array.from({ length: 18 }, (_, n) => n + 16).flatMap(chapter => [1, 2, 3].map(exercise => `${chapter}-${exercise}`)).filter(key => !['16-1', '23-1'].includes(key))
assert.deepEqual(readingGuides.map(g => `${g.chapter}-${g.exercise}`), expectedExercises, 'Every photographed exercise needs exactly one guide; 16-1 uses the full email, 23-1 is absent from the photos')
for (const guide of readingGuides) {
  const key = `${guide.chapter}-${guide.exercise}`
  assert.ok(guide.answer === null || [1, 2, 3, 4].includes(guide.answer), `Invalid answer ${key}`)
  assert.equal(guide.answer === null, ['19-3', '22-3'].includes(key), `Only cropped questions should be ungraded: ${key}`)
  assert.ok(guide.title.en && guide.title.vi && guide.explanation.en && guide.explanation.vi, `Missing guide copy ${key}`)
  assert.ok(guide.pages.length > 0 && guide.sentences.length > 0, `Empty guide ${key}`)
  for (const page of guide.pages) {
    const [first, last] = readingChapterPages[guide.chapter]
    assert.ok(page >= first && page <= last, `Source belongs to a different chapter ${key}: ${page}`)
    assert.ok(existsSync(new URL(`../public/reading-chapters/IMG_${page}.jpg`, import.meta.url)), `Missing source ${key}: ${page}`)
  }
  assert.ok(guide.sentences.some(s => s.chunks.some(c => c.words?.length)), `No vocabulary ${key}`)
  for (const data of guide.sentences) {
    assert.equal(data.chunks.map(c => c.text).join(''), data.sentence)
    assert.ok(data.chunks.length >= 2, `No explorable structure ${key}`)
    for (const copy of [data.translation, data.together, ...data.chunks.flatMap(c => [c.label, c.detail])]) assert.ok(copy.en && copy.vi, `Missing explanation ${key}`)
    for (const chunk of data.chunks) {
      for (const id of chunk.grammarIds ?? []) assert.ok(grammarIds.has(id), `Unknown grammar ${key}: ${id}`)
      for (const word of chunk.words ?? []) assert.ok(word.text && word.kana && word.meaning.en && word.meaning.vi, `Incomplete word ${key}`)
    }
  }
}
// Check the arithmetic behind the two price-comparison questions.
assert.equal(28000 * 2 + 14000 - 1000 - 1500 * 2, 66000)
assert.equal(2500 * 2, 5000)
assert.ok(!reading.includes('Bài 15 không có phần đọc hiểu.'))
for (const [query, expected] of [
  ['', [16, 1, 1836]],
  ['chapter=15&exercise=99&page=0', [16, 1, 1836]],
  ['chapter=nope&exercise=NaN&page=Infinity', [16, 1, 1836]],
  ['chapter=23&exercise=1', [23, 2, 1853]],
  ['chapter=33&exercise=3', [33, 3, 1887]],
  ['chapter=33&exercise=3&page=1888', [33, 3, 1888]],
  ['chapter=33&exercise=3&page=1886', [33, 3, 1887]],
  ['chapter=33&exercise=3&page=1887.5', [33, 3, 1887]],
  ['chapter=33&exercise=3&page=1836', [33, 3, 1887]],
]) {
  const { chapter, exercise, page } = resolveReadingSelection(new URLSearchParams(query))
  assert.deepEqual([chapter, exercise, page], expected, `Invalid reading selection for ${query}`)
}
console.log(`Sentence breakdowns and ${readingGuides.length} reading guides: coverage, sources, grammar links and bilingual copy OK`)
