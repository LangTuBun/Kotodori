import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { sentenceBreakdowns } from '../src/data/sentence-breakdowns.ts'
import { readingGuides, readingChapterPages, resolveReadingSelection, PRACTICE_EXERCISE } from '../src/data/reading-guides.ts'
import { readingPassages } from '../src/data/reading-passages.ts'
import { readingContexts } from '../src/data/reading-contexts.ts'
import { practiceReadings } from '../src/data/reading-practice.ts'

const grammar = ['n4', 'n5'].flatMap(level => JSON.parse(readFileSync(new URL(`../src/data/${level}/grammar.json`, import.meta.url), 'utf8')))
const grammarIds = new Set(grammar.map(point => point.id))
const examples = new Set(grammar.flatMap(point => (point.richExamples ?? []).map(example => example.ja)))
const reading = readFileSync(new URL('../src/pages/Reading.tsx', import.meta.url), 'utf8')
const grammarChapter = new Map(grammar.map(point => [point.id, point.jlptLevel === 'N5' ? 0 : point.chapter]))
const normalize = text => text.replace(/^[①-⑳☑□\d.\s]+/, '').replace(/\s/g, '')
const passageUnits = Object.values(readingPassages).flat(2).map(unit => normalize(unit.jp))
for (const [sentence, data] of Object.entries(sentenceBreakdowns)) {
  assert.equal(data.sentence, sentence)
  assert.equal(data.chunks.map(chunk => chunk.text).join(''), sentence, `Chunks must reconstruct ${sentence}`)
  assert.ok(examples.has(sentence) || passageUnits.some(unit => unit.includes(normalize(sentence))), `Unreachable sentence: ${sentence}`)
  for (const field of [data.translation, data.together, ...data.chunks.flatMap(chunk => [chunk.label, chunk.detail])]) {
    assert.ok(field.en && field.vi, `Missing translation for ${sentence}`)
  }
  for (const chunk of data.chunks) {
    for (const id of chunk.grammarIds ?? []) assert.ok(grammarIds.has(id), `Unknown grammar ${id}`)
    for (const word of chunk.words ?? []) assert.ok(word.text && word.kana && word.meaning.en && word.meaning.vi, `Incomplete word in ${sentence}`)
  }
}
const expectedExercises = Array.from({ length: 18 }, (_, n) => n + 16).flatMap(chapter => [1, 2, 3].map(exercise => `${chapter}-${exercise}`)).filter(key => key !== '23-1')
assert.deepEqual(readingGuides.map(g => `${g.chapter}-${g.exercise}`), expectedExercises, 'Every photographed exercise needs exactly one guide; 23-1 is absent from the photos')
assert.deepEqual(Object.keys(readingPassages), expectedExercises, 'Every photographed exercise needs its full text')
assert.deepEqual(Object.keys(readingContexts), expectedExercises, 'Every photographed exercise needs a situation')
const bilingual = (copy, where) => assert.ok(copy?.en?.trim() && copy?.vi?.trim(), `Missing translation: ${where}`)
const checkParagraphs = (key, paragraphs, maxChapter) => {
  assert.ok(paragraphs.length > 0, `Empty passage ${key}`)
  for (const paragraph of paragraphs) {
    assert.ok(paragraph.length > 0, `Empty paragraph in ${key}`)
    for (const unit of paragraph) {
      assert.ok(unit.jp.trim(), `Empty unit in ${key}`)
      bilingual(unit.translation, `${key}: ${unit.jp}`)
      assert.ok(!/the passage|theo bài/i.test(unit.translation.en + unit.translation.vi), `Describe-not-translate in ${key}: ${unit.jp}`)
      for (const id of unit.grammarIds) {
        assert.ok(grammarIds.has(id), `Unknown grammar ${key}: ${id}`)
        if (maxChapter) assert.ok(grammarChapter.get(id) <= maxChapter, `${key} uses ${id} from a later chapter`)
      }
    }
  }
}
for (const [key, paragraphs] of Object.entries(readingPassages)) checkParagraphs(key, paragraphs)
for (const [key, context] of Object.entries(readingContexts)) for (const copy of [context.type, context.situation, context.focus]) bilingual(copy, `context ${key}`)
// Units are sentences, short sentence groups, headings or table rows; this catches truncated transcriptions.
assert.ok(passageUnits.length >= 740, `Passage units went missing: ${passageUnits.length}`)
assert.deepEqual(practiceReadings.map(r => r.chapter), Object.keys(readingChapterPages).map(Number), 'One practice text per chapter')
for (const r of practiceReadings) {
  const key = `${r.chapter}-practice`
  checkParagraphs(key, r.paragraphs, r.chapter)
  for (const copy of [r.title, r.explanation, r.context.type, r.context.situation, r.context.focus]) bilingual(copy, key)
  assert.equal(r.question.options.length, 4, `Four options ${key}`)
  assert.ok([1, 2, 3, 4].includes(r.answer), `Invalid answer ${key}`)
  const own = new Set(r.paragraphs.flat().flatMap(u => u.grammarIds).filter(id => grammarChapter.get(id) === r.chapter))
  assert.ok(own.size >= 3, `${key} should practise at least three of its own chapter's patterns, found ${own.size}`)
}
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
  const units = readingPassages[key].flat().map(unit => normalize(unit.jp))
  for (const s of guide.sentences) assert.ok(units.some(unit => unit.includes(normalize(s.sentence))), `Curated sentence not found in ${key} passage: ${s.sentence}`)
  if (guide.question) assert.ok(guide.question.options.length === 4 && guide.question.jp, `Incomplete question ${key}`)
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
  [`chapter=20&exercise=${PRACTICE_EXERCISE}`, [20, PRACTICE_EXERCISE, 1845]],
  ['chapter=20&exercise=5', [20, 1, 1845]],
]) {
  const { chapter, exercise, page } = resolveReadingSelection(new URLSearchParams(query))
  assert.deepEqual([chapter, exercise, page], expected, `Invalid reading selection for ${query}`)
}
const ownChapterUnused = Object.keys(readingPassages).filter(key => !Object.values(readingPassages[key]).flat().some(u => u.grammarIds.some(id => grammarChapter.get(id) === Number(key.split('-')[0]))))
console.log(`Info: ${ownChapterUnused.length} book passages tag none of their own chapter's grammar: ${ownChapterUnused.join(' ')}`)
console.log(`Sentence breakdowns, ${readingGuides.length} guides, ${Object.keys(readingPassages).length} passages (${passageUnits.length} units), ${practiceReadings.length} practice texts: OK`)
