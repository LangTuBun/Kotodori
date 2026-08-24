// Applies scripts/n5-kanji-en.mjs's hand-translated English onto
// src/data/n5/kanji.json's meaning.en (word + group level), positionally --
// walks chapters->groups->[group meaning if present, then words] in the
// exact same order the dump was generated in (see n5-kanji-en.mjs's header).
// Hard-fails on a length mismatch, and on any meaning.en that's already
// non-empty (would silently clobber prior work).
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { EN } from "./n5-kanji-en.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const kanjiPath = path.join(__dirname, "../src/data/n5/kanji.json")
const data = JSON.parse(fs.readFileSync(kanjiPath, "utf8"))

let cursor = 0
let filledGroups = 0
let filledWords = 0
let skippedNonEmpty = 0

for (const chapter of data.chapters) {
  for (const group of chapter.groups) {
    if (group.meaning) {
      if (group.meaning.en) {
        skippedNonEmpty++
      } else {
        group.meaning.en = EN[cursor]
        filledGroups++
      }
      cursor++
    }
    for (const word of group.words) {
      if (word.meaning.en) {
        skippedNonEmpty++
      } else {
        word.meaning.en = EN[cursor]
        filledWords++
      }
      cursor++
    }
  }
}

if (cursor !== EN.length) {
  throw new Error(`traversal produced ${cursor} slots but EN has ${EN.length} entries -- length mismatch, aborting without writing`)
}

fs.writeFileSync(kanjiPath, JSON.stringify(data, null, 2) + "\n")
console.log(`filled group meanings: ${filledGroups}, filled word meanings: ${filledWords}, skipped (already non-empty): ${skippedNonEmpty}, total slots: ${cursor}`)
