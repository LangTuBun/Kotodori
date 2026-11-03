// Generates src/data/reading-furigana.json: ruby segments for every Japanese
// string shown on the Reading page (passages, questions, options).
// Run after editing reading texts: node scripts/generate-reading-furigana.mjs
// Readings come from kuromoji (IPADIC) at build time only; OVERRIDES fixes the
// cases where its dictionary picks the wrong reading for this material.
import { writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { readingPassages } from '../src/data/reading-passages.ts'
import { practiceReadings } from '../src/data/reading-practice.ts'
import { readingGuides } from '../src/data/reading-guides.ts'

const require = createRequire(import.meta.url)
const kuromoji = require('kuromoji')
const KANJI = /[一-鿿㐀-䶿々]/
const toHiragana = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60))

// surface -> reading, where IPADIC's default reading is wrong for these texts.
const OVERRIDES = {
  '何時': 'なんじ', '何人': 'なんにん', '何回': 'なんかい', '何冊': 'なんさつ', '何度': 'なんど',
  '一人': 'ひとり', '二人': 'ふたり', '一日': 'いちにち', '今日': 'きょう', '明日': 'あした', '昨日': 'きのう',
  '一緒': 'いっしょ', '大人': 'おとな', '上手': 'じょうず', '下手': 'へた', '眼鏡': 'めがね', '果物': 'くだもの',
  '博多': 'はかた', '高村': 'たかむら', '高木': 'たかぎ', '田村': 'たむら', '石井': 'いしい', '木村': 'きむら',
  '森': 'もり', '荒木': 'あらき', '宗太郎': 'そうたろう', '山口': 'やまぐち', '緑': 'みどり', '漢越語': 'かんえつご',
  '一期一会': 'いちごいちえ', 'その後': 'そのあと', '方': 'かた', '行う': 'おこなう', '行い': 'おこない', '行っ': 'おこなっ',
}
// 方 and 行う are context-dependent; only override when the token is used as a noun after a verb or as 行う.
const CONTEXT_OVERRIDE = {
  '方': (t, prev) => prev && prev.pos === '動詞' ? 'かた' : null,
  '行っ': (t) => t.basic_form === '行う' ? 'おこなっ' : null,
}

// Single-kanji tokens whose IPADIC default is wrong when they stand alone here
// (compounds such as 今月, 時間, 家族 are separate tokens and keep their readings).
const STANDALONE = { '今': 'いま', '間': 'あいだ', '家': 'いえ', '他': 'ほか', '後': 'あと' }
const WEEKDAY = { '月': 'げつ', '火': 'か', '水': 'すい', '木': 'もく', '金': 'きん', '土': 'ど', '日': 'にち' }

// Counters after a number. IPADIC reads them as standalone nouns (月 → つき), so
// they are resolved here, with the common sound changes.
const COUNTER = {
  '月': () => 'がつ', '年': () => 'ねん', '時': () => 'じ', '円': () => 'えん', '歳': () => 'さい',
  '回': () => 'かい', '冊': () => 'さつ', '枚': () => 'まい', '台': () => 'だい', '番': () => 'ばん', '度': () => 'ど', '点': () => 'てん',
  '週': () => 'しゅう', '号': () => 'ごう', '個': () => 'こ', '杯': n => [1, 6, 8, 10].includes(n % 100) ? 'ぱい' : n % 10 === 3 ? 'ばい' : 'はい',
  '本': n => [1, 6, 8, 10].includes(n % 100) ? 'ぽん' : n % 10 === 3 ? 'ぼん' : 'ほん',
  '分': n => [1, 3, 4, 6, 8, 10].includes(n % 10 === 0 ? 10 : n % 10) ? 'ぷん' : 'ふん',
  '階': n => n % 10 === 3 ? 'がい' : 'かい',
  '泊': n => [1, 3, 6, 8, 10].includes(n % 10 === 0 ? 10 : n % 10) ? 'ぱく' : 'はく',
  '人': n => n === 1 ? 'ひとり' : n === 2 ? 'ふたり' : 'にん',
  '日': n => ({ 1: 'ついたち', 2: 'ふつか', 3: 'みっか', 4: 'よっか', 5: 'いつか', 6: 'むいか', 7: 'なのか', 8: 'ようか', 9: 'ここのか', 10: 'とおか', 14: 'じゅうよっか', 20: 'はつか', 24: 'にじゅうよっか' })[n] ?? 'にち',
}
const COMPOUND_COUNTER = { '時間': 'じかん', '日間': 'にちかん', '週間': 'しゅうかん', '年間': 'ねんかん', '分間': 'ふんかん', 'か月': 'かげつ', 'ヶ月': 'かげつ', '月間': 'げつかん' }
const numberOf = s => /^[0-9０-９,，]+$/.test(s) ? Number(s.replace(/[,，]/g, '').replace(/[０-９]/g, d => String(d.charCodeAt(0) - 0xff10))) : null

function align(surface, reading) {
  // Split surface into kanji / kana runs and anchor the kana runs inside the reading.
  const runs = []
  for (const ch of surface) {
    const k = KANJI.test(ch)
    const last = runs[runs.length - 1]
    if (last && last.k === k) last.t += ch
    else runs.push({ t: ch, k })
  }
  const out = []
  let pos = 0
  for (let i = 0; i < runs.length; i++) {
    const run = runs[i]
    if (!run.k) {
      const idx = reading.indexOf(toHiragana(run.t), pos)
      pos = idx === -1 ? pos : idx + run.t.length
      out.push(run.t)
      continue
    }
    const next = runs.slice(i + 1).find(r => !r.k)
    // A final okurigana run anchors at the end (低く → ひく+く, not ひ+くく).
    const tail = next && next === runs[runs.length - 1] && reading.endsWith(toHiragana(next.t)) ? reading.length - next.t.length : -1
    const end = !next ? reading.length : tail > pos ? tail : reading.indexOf(toHiragana(next.t), pos + 1)
    if (end === -1) return [surface] // cannot align safely: show without ruby
    out.push([run.t, reading.slice(pos, end)])
    pos = end
  }
  return out
}

function segments(tokenizer, text) {
  const out = []
  const push = seg => {
    if (typeof seg === 'string' && typeof out[out.length - 1] === 'string') out[out.length - 1] += seg
    else out.push(seg)
  }
  const tokens = tokenizer.tokenize(text)
  let offset = 0
  for (let i = 0; i < tokens.length; offset += tokens[i].surface_form.length, i++) {
    const t = tokens[i]
    const surface = t.surface_form
    if (!KANJI.test(surface)) { push(surface); continue }
    const before = text.slice(0, offset)
    const after = text.slice(offset + surface.length)
    const prev = tokens[i - 1]
    const n = prev ? numberOf(prev.surface_form) : null
    let reading = null
    if (n !== null && (COUNTER[surface] || COMPOUND_COUNTER[surface])) reading = COMPOUND_COUNTER[surface] ?? COUNTER[surface](n)
    else if (surface === '一' && tokens[i + 1]?.surface_form === '人') { push(['一人', 'ひとり']); offset += 1; i++; continue }
    else if (WEEKDAY[surface] && (/[〜～・（(／/]$/.test(before) || /^[〜～・）)／/]/.test(after))) reading = WEEKDAY[surface] // 月〜金, （水）, 土・日
    else if (STANDALONE[surface]) reading = surface === '他' && prev?.surface_form === 'その' ? 'た' : STANDALONE[surface]
    else if (/^入れ/.test(surface) && /(風呂に|でも|すぐ|ないと|では|人で)$/.test(before)) reading = 'はい' + surface.slice(1) // 入れる = can enter
    else if (t.basic_form === '来る') reading = ({ '未然形': 'こ', '連用形': 'き' }[t.conjugated_form] ?? 'く') + surface.slice(1)
    else reading = CONTEXT_OVERRIDE[surface]?.(t, prev) ?? (surface in CONTEXT_OVERRIDE ? null : OVERRIDES[surface]) ?? null
    reading ??= t.reading && t.reading !== '*' ? toHiragana(t.reading) : null
    if (!reading) push(surface)
    else align(surface, reading).forEach(push)
  }
  return out
}

const texts = new Set()
for (const paragraphs of Object.values(readingPassages)) for (const u of paragraphs.flat()) texts.add(u.jp)
for (const r of practiceReadings) {
  for (const u of r.paragraphs.flat()) texts.add(u.jp)
  for (const q of r.questions) [q.jp, ...q.options].forEach(t => texts.add(t))
}
for (const g of readingGuides) if (g.question) [g.question.jp, ...g.question.options].forEach(t => texts.add(t))

kuromoji.builder({ dicPath: require.resolve('kuromoji/dict/base.dat.gz').replace(/base\.dat\.gz$/, '') }).build((err, tokenizer) => {
  if (err) throw err
  const map = {}
  for (const text of [...texts].sort()) if (KANJI.test(text)) map[text] = segments(tokenizer, text)
  writeFileSync(new URL('../src/data/reading-furigana.json', import.meta.url), JSON.stringify(map))
  console.log(`Furigana for ${Object.keys(map).length} strings`)
})
