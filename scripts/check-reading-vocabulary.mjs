import assert from 'node:assert/strict'
import { matchReadingWords } from '../src/lib/reading-vocabulary.ts'

const entry = (id, kanji, kana) => ({ id, kanji, kana })
const dict = [
  { entry: entry('kaisha', '会社', 'かいしゃ'), forms: ['会社', 'かいしゃ'] },
  { entry: entry('sha', '社', 'しゃ'), forms: ['社', 'しゃ'] },
  { entry: entry('ikanai', '行く', 'いく'), forms: ['行く', '行きます', '行きました'] },
  { entry: entry('ima', '今', 'いま'), forms: ['今', 'いま'] },
  { entry: entry('mainichi', '毎日', 'まいにち'), forms: ['毎日'] },
]
const forms = text => matchReadingWords(text, dict).map(m => m.form)

// Kana form inside another word is not a hit: いま inside すいません.
assert.deepEqual(forms('すいません'), [])
// Longer compound wins; one-character forms are ignored.
assert.deepEqual(forms('会社に行きました'), ['会社', '行きました'])
// Repeated words appear once, at the first occurrence.
const repeated = matchReadingWords('毎日会社、毎日', dict)
assert.deepEqual(repeated.map(m => [m.form, m.start]), [['毎日', 0], ['会社', 2]])
// Conjugated form maps back to its dictionary entry.
assert.equal(matchReadingWords('明日行きます', dict)[0].entry.kanji, '行く')
console.log('Reading vocabulary matcher OK')
