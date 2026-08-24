// One-time schema migration: KanjiWord/KanjiGroup.meaning goes from a plain
// string to { vi, en } (matching GrammarPoint.meaning / VocabEntry.meanings,
// which were always {vi,en} -- kanji's plain string was the odd one out).
// - n5/kanji.json: existing meaning is Vietnamese -> { vi: <existing>, en: "" }
//   (en filled by a separate translate-n5-kanji-en.mjs pass).
// - n4/kanji.json: existing meaning is English (already translated this
//   session, see build-n4-kanji.mjs) -> { vi: "", en: <existing> }. N4 kanji
//   was authored English-only per the implementation plan; vi stays empty
//   here rather than being backfilled from the source MD (out of scope of
//   the schema-change decision this migration is for).
// Idempotent: skips any meaning that's already an object.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function migrate(filePath, { existingIsVi }) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"))
  let groupsMigrated = 0
  let wordsMigrated = 0

  for (const chapter of data.chapters) {
    for (const group of chapter.groups) {
      if (group.meaning !== null && typeof group.meaning === "string") {
        group.meaning = existingIsVi ? { vi: group.meaning, en: "" } : { vi: "", en: group.meaning }
        groupsMigrated++
      }
      for (const word of group.words) {
        if (typeof word.meaning === "string") {
          word.meaning = existingIsVi ? { vi: word.meaning, en: "" } : { vi: "", en: word.meaning }
          wordsMigrated++
        }
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n")
  console.log(`${path.basename(filePath)}: migrated ${groupsMigrated} group meanings, ${wordsMigrated} word meanings`)
}

migrate(path.join(__dirname, "../src/data/n5/kanji.json"), { existingIsVi: true })
migrate(path.join(__dirname, "../src/data/n4/kanji.json"), { existingIsVi: false })
