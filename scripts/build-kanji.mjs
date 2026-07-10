// Parses kanjis.tex (14 chapter longtables) into src/data/n5/kanji.json.
// Groups words per chapter by a shared "leading" kanji using adjacency
// clustering: walk rows in source order, an entry joins the current group
// if it contains the current anchor char; otherwise a new group opens,
// anchored on the kanji shared with the *next* row (falls back to the
// entry's own first kanji when there's no such overlap).
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const texPath = path.join(__dirname, "..", "..", "kanjis.tex")
const outPath = path.join(__dirname, "..", "src", "data", "n5", "kanji.json")

const KANJI_RE = /[一-鿿㐀-䶿々]/
const isKanji = ch => KANJI_RE.test(ch)
const kanjiChars = s => [...s].filter(isKanji)
const uniqueKanjiChars = s => [...new Set(kanjiChars(s))]

// Known typo in the source: kana column mixes in a literal kanji character.
const KANA_FIXES = {
  "しんぶん社": "しんぶんしゃ",
}

function parseTex(text) {
  const chapters = []
  const sectionRe = /\\section\*\{Chương (\d+)\}/g
  const sectionMatches = [...text.matchAll(sectionRe)]

  for (let i = 0; i < sectionMatches.length; i++) {
    const chapterNum = Number(sectionMatches[i][1])
    const start = sectionMatches[i].index
    const end = i + 1 < sectionMatches.length ? sectionMatches[i + 1].index : text.length
    const block = text.slice(start, end)

    const rows = []
    for (const line of block.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed.includes("&") || !trimmed.endsWith("\\\\")) continue
      if (trimmed.startsWith("\\") || trimmed.startsWith("%")) continue
      const body = trimmed.slice(0, -2)
      const fields = body.split("&").map(f => f.trim())
      if (fields.length !== 5) continue
      const [kanji, kanaRaw, hanviet, meaning, onkun] = fields
      const kana = KANA_FIXES[kanaRaw] ?? kanaRaw
      rows.push({ kanji, kana, hanviet, meaning, onkun })
    }
    chapters.push({ chapter: chapterNum, rows })
  }
  return chapters
}

function clusterChapter(rows) {
  const groups = []
  let current = null // { anchor, words }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const chars = uniqueKanjiChars(row.kanji)

    if (current && chars.includes(current.anchor)) {
      current.words.push(row)
      continue
    }

    if (current) groups.push(current)

    const next = rows[i + 1]
    let anchor = chars[0]
    if (next) {
      const nextChars = uniqueKanjiChars(next.kanji)
      const shared = chars.find(c => nextChars.includes(c))
      if (shared) anchor = shared
    }
    current = { anchor, words: [row] }
  }
  if (current) groups.push(current)
  return groups
}

// When a group contains a standalone single-character row equal to the
// anchor, use its kana/hanviet/onkun as the group's headline reading info.
function groupMeta(anchor, words) {
  const solo = words.find(w => w.kanji === anchor)
  if (solo) return { kana: solo.kana, hanviet: solo.hanviet, meaning: solo.meaning, onkun: solo.onkun }

  // Fallback: token-align hanviet/onkun against kanji chars for the first
  // word where the token count matches the kanji-char count.
  for (const w of words) {
    const chars = kanjiChars(w.kanji)
    const hvTokens = w.hanviet.split(/\s+/)
    const okTokens = w.onkun.split("--")
    if (hvTokens.length === chars.length && okTokens.length === chars.length) {
      const idx = chars.indexOf(anchor)
      if (idx !== -1) {
        return { kana: null, hanviet: hvTokens[idx], meaning: null, onkun: okTokens[idx] }
      }
    }
  }
  return { kana: null, hanviet: null, meaning: null, onkun: null }
}

const raw = fs.readFileSync(texPath, "utf8")
const parsed = parseTex(raw)

const chapters = parsed.map(({ chapter, rows }) => {
  const groups = clusterChapter(rows).map((g, idx) => ({
    id: `k${chapter}_g${idx + 1}`,
    anchor: g.anchor,
    ...groupMeta(g.anchor, g.words),
    words: g.words.map(w => ({
      kanji: w.kanji,
      kana: w.kana,
      hanviet: w.hanviet,
      meaning: w.meaning,
      onkun: w.onkun,
    })),
  }))
  return { chapter, groupCount: groups.length, wordCount: rows.length, groups }
})

fs.writeFileSync(outPath, JSON.stringify({ chapters }, null, 2) + "\n", "utf8")

const totalWords = chapters.reduce((a, c) => a + c.wordCount, 0)
const totalGroups = chapters.reduce((a, c) => a + c.groupCount, 0)
console.log(`Parsed ${totalWords} words into ${totalGroups} groups across ${chapters.length} chapters.`)
for (const c of chapters) {
  console.log(`  Ch${c.chapter}: ${c.wordCount} words, ${c.groupCount} groups`)
}
