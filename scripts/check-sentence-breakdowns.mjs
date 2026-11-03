import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { sentenceBreakdowns } from '../src/data/sentence-breakdowns.ts'
import { readingGuides, readingChapterPages, resolveReadingSelection, PRACTICE_EXERCISES } from '../src/data/reading-guides.ts'
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
const expectedExercises = Array.from({ length: 18 }, (_, n) => n + 16).flatMap(chapter => [1, 2, 3].map(exercise => `${chapter}-${exercise}`))
assert.deepEqual(readingGuides.map(g => `${g.chapter}-${g.exercise}`), expectedExercises, 'Every photographed exercise needs exactly one guide')
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
const chapters = Object.keys(readingChapterPages).map(Number)
for (const kind of ['practice', 'review']) assert.deepEqual(practiceReadings.filter(r => r.kind === kind).map(r => r.chapter), chapters, `One ${kind} text per chapter`)
for (const r of practiceReadings) {
  const key = `${r.chapter}-${r.kind}`
  checkParagraphs(key, r.paragraphs, r.chapter)
  for (const copy of [r.title, r.context.type, r.context.situation, r.context.focus]) bilingual(copy, key)
  assert.ok(r.questions.length >= (r.kind === 'review' ? 2 : 1), `Too few questions ${key}`)
  for (const q of r.questions) {
    assert.ok(q.jp && q.options.length === 4 && new Set(q.options).size === 4, `Four distinct options ${key}: ${q.jp}`)
    assert.ok([1, 2, 3, 4].includes(q.answer), `Invalid answer ${key}`)
    bilingual(q.explanation, `${key}: ${q.jp}`)
  }
  const tags = r.paragraphs.flat().flatMap(u => u.grammarIds)
  const own = new Set(tags.filter(id => grammarChapter.get(id) === r.chapter))
  const earlier = new Set(tags.filter(id => grammarChapter.get(id) < r.chapter))
  assert.ok(own.size >= (r.kind === 'review' ? 2 : 3), `${key} practises too few of its own chapter's patterns: ${own.size}`)
  // Review texts must actually revisit earlier material, not just repeat the chapter drill.
  if (r.kind === 'review') assert.ok(earlier.size >= 2, `${key} revisits too few earlier patterns: ${earlier.size}`)
}
for (const guide of readingGuides) {
  const key = `${guide.chapter}-${guide.exercise}`
  assert.ok([1, 2, 3, 4].includes(guide.answer), `Every exercise is graded now: ${key}`)
  assert.ok(guide.title.en && guide.title.vi && guide.explanation.en && guide.explanation.vi, `Missing guide copy ${key}`)
  assert.ok(guide.pages.length > 0 && guide.sentences.length > 0, `Empty guide ${key}`)
  for (const page of guide.pages) {
    const [first, last] = readingChapterPages[guide.chapter]
    // 1890–1892 are photos supplied later (23-1 and the 19-3 / 22-3 question pages).
    assert.ok((page >= first && page <= last) || (page >= 1890 && page <= 1892), `Source belongs to a different chapter ${key}: ${page}`)
  }
  assert.ok(guide.sentences.some(s => s.chunks.some(c => c.words?.length)), `No vocabulary ${key}`)
  const units = readingPassages[key].flat().map(unit => normalize(unit.jp))
  for (const s of guide.sentences) assert.ok(units.some(unit => unit.includes(normalize(s.sentence))), `Curated sentence not found in ${key} passage: ${s.sentence}`)
  // The reader no longer ships photos, so every book question must exist as text (19-2 has two picture options).
  assert.ok(guide.question?.jp && guide.question.options.length >= 2 && guide.answer <= guide.question.options.length, `Question missing as text ${key}`)
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
assert.equal(2 * 1000 + 1 * 1200, 3200) // 19-3: room B on a weekday, 10–12 then 12–13
assert.ok(!reading.includes('Bài 15 không có phần đọc hiểu.'))
for (const [query, expected] of [
  ['', [16, 1, 1836]],
  ['chapter=15&exercise=99&page=0', [16, 1, 1836]],
  ['chapter=nope&exercise=NaN&page=Infinity', [16, 1, 1836]],
  ['chapter=23&exercise=1', [23, 1, 1890]],
  ['chapter=19&exercise=3&page=1892', [19, 3, 1892]],
  ['chapter=33&exercise=3', [33, 3, 1887]],
  ['chapter=33&exercise=3&page=1888', [33, 3, 1888]],
  ['chapter=33&exercise=3&page=1886', [33, 3, 1887]],
  ['chapter=33&exercise=3&page=1887.5', [33, 3, 1887]],
  ['chapter=33&exercise=3&page=1836', [33, 3, 1887]],
  [`chapter=20&exercise=${PRACTICE_EXERCISES.practice}`, [20, 4, 1845]],
  [`chapter=20&exercise=${PRACTICE_EXERCISES.review}`, [20, 5, 1845]],
  ['chapter=20&exercise=6', [20, 1, 1845]],
]) {
  const { chapter, exercise, page } = resolveReadingSelection(new URLSearchParams(query))
  assert.deepEqual([chapter, exercise, page], expected, `Invalid reading selection for ${query}`)
}
// Per-chapter full-text breakdowns (src/data/breakdowns/<chapter>.json), loaded lazily by the reader.
let brokenDown = 0
for (const chapter of Object.keys(readingChapterPages).map(Number)) {
  const file = new URL(`../src/data/breakdowns/${chapter}.json`, import.meta.url)
  let list
  try { list = JSON.parse(readFileSync(file, 'utf8')) } catch { continue }
  const units = [1, 2, 3].flatMap(e => readingPassages[`${chapter}-${e}`].flat()).concat(practiceReadings.filter(r => r.chapter === chapter).flatMap(r => r.paragraphs.flat()))
  for (const data of list) {
    const where = `breakdowns/${chapter}: ${data.sentence}`
    const unit = units.find(u => u.jp === data.sentence)
    assert.ok(unit, `Not a unit of chapter ${chapter}: ${where}`)
    assert.equal(data.chunks.map(c => c.text).join(''), data.sentence, `Chunks must rebuild ${where}`)
    for (const copy of [data.translation, data.together, ...data.chunks.flatMap(c => [c.label, c.detail])]) bilingual(copy, where)
    const tagged = new Set(data.chunks.flatMap(c => c.grammarIds ?? []))
    for (const id of tagged) assert.ok(grammarIds.has(id), `Unknown grammar ${where}: ${id}`)
    for (const id of unit.grammarIds) assert.ok(tagged.has(id), `Sentence grammar ${id} not placed on a phrase: ${where}`)
    for (const w of data.chunks.flatMap(c => c.words ?? [])) assert.ok(w.text && /^[぀-ヿー・]+$/.test(w.kana) && w.meaning.en && w.meaning.vi, `Bad word ${w.text} in ${where}`)
  }
  brokenDown += list.length
}
console.log(`Full-text breakdowns: ${brokenDown} sentences`)
const ownChapterUnused = Object.keys(readingPassages).filter(key => !Object.values(readingPassages[key]).flat().some(u => u.grammarIds.some(id => grammarChapter.get(id) === Number(key.split('-')[0]))))
console.log(`Info: ${ownChapterUnused.length} book passages tag none of their own chapter's grammar: ${ownChapterUnused.join(' ')}`)
console.log(`Sentence breakdowns, ${readingGuides.length} guides, ${Object.keys(readingPassages).length} passages (${passageUnits.length} units), ${practiceReadings.length} original texts (${practiceReadings.reduce((n, r) => n + r.questions.length, 0)} questions): OK`)
