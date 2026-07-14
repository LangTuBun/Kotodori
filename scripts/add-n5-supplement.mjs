// Adds the N5 kanji missing from the original kanjis.tex-derived set as a
// new chapter 15 ("N5 bo sung" / supplement). Found by cross-referencing
// our 158 existing anchors against a standard ~103-character JLPT N5 list
// (union of two independently-sourced lists; JLPT itself has published no
// official kanji list since 2010). Words are filled in separately by the
// vocab-enrichment pass -- this script only creates the anchor groups
// themselves (reading data pulled from the already-fetched kanjiapi.dev
// cache, Han Viet from hanviet-dictionary.json).
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, "..", "src", "data", "n5", "kanji.json")
const hanvietPath = path.join(__dirname, "..", "src", "data", "hanviet-dictionary.json")

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"))
const hanviet = JSON.parse(fs.readFileSync(hanvietPath, "utf8"))

const NEW_ANCHORS = ["駅", "空", "語", "校", "国", "週", "天", "店", "道"]

async function main() {
  const existing = new Set()
  for (const c of data.chapters) for (const g of c.groups) existing.add(g.anchor)
  const toAdd = NEW_ANCHORS.filter(ch => !existing.has(ch))
  if (toAdd.length === 0) {
    console.log("Nothing to add -- all anchors already present.")
    return
  }

  const groups = []
  for (const anchor of toAdd) {
    const res = await fetch(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(anchor)}`)
    const json = res.ok ? await res.json() : { on_readings: [], kun_readings: [] }
    groups.push({
      id: `k15_g${groups.length + 1}`,
      anchor,
      kana: null,
      hanviet: hanviet[anchor] ?? null,
      meaning: null,
      // Matches the existing convention: group-level onkun is "Kun" whenever
      // any kun'yomi exists (even alongside on'yomi), else "On".
      onkun: (json.kun_readings ?? []).length > 0 ? "Kun" : "On",
      onyomi: json.on_readings ?? [],
      kunyomi: json.kun_readings ?? [],
      words: [],
    })
  }

  data.chapters.push({
    chapter: 15,
    groupCount: groups.length,
    wordCount: 0,
    groups,
  })

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n", "utf8")
  console.log(`Added chapter 15 with ${groups.length} new anchor group(s): ${toAdd.join("")}`)
}

main()
