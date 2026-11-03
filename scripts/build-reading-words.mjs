// Collects the key words from every reading breakdown into src/data/reading-words.json,
// a small deck the Review page can load without pulling in the full breakdowns.
// Re-run after changing src/data/breakdowns/*.json or the reading guides.
import { readFileSync, writeFileSync } from 'node:fs'
import { readingGuides, readingChapterPages } from '../src/data/reading-guides.ts'

export function collectReadingWords() {
  const byChapter = Object.keys(readingChapterPages).map(Number).map(chapter => {
    const file = new URL(`../src/data/breakdowns/${chapter}.json`, import.meta.url)
    const sentences = [...readingGuides.filter(g => g.chapter === chapter).flatMap(g => g.sentences), ...JSON.parse(readFileSync(file, 'utf8'))]
    return { chapter, sentences }
  })
  const words = new Map()
  for (const { chapter, sentences } of byChapter) for (const s of sentences) for (const c of s.chunks) for (const w of c.words ?? []) {
    const id = `rd:${w.text}|${w.kana}`
    // First (earliest) use wins, so a word belongs to the chapter that introduced it.
    if (!words.has(id)) words.set(id, { id, text: w.text, kana: w.kana, meaning: w.meaning, chapter, sentence: s.sentence, translation: s.translation })
  }
  return [...words.values()]
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const words = collectReadingWords()
  writeFileSync(new URL('../src/data/reading-words.json', import.meta.url), JSON.stringify(words) + '\n')
  console.log(`${words.length} reading words`)
}
