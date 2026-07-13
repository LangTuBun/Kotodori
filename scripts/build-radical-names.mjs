// Builds src/data/n5/radical-names.json: Hán Việt names for every unique
// KanjiVG decomposition component that appears in kanjivg.json.
// Two sources, preferring the verified one:
//   1. "anchor"  — the component char is itself one of kanji.json's leading
//      kanji, so its hanviet is already textbook-verified.
//   2. "curated" — hand-supplied radical names from radical-names-curated.mjs
//      (flagged for spot-check).
// Components matching neither are omitted; the UI shows the bare character.
// Re-run after fetch-kanjivg.mjs changes the component set.
import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { curatedRadicalNames } from "./radical-names-curated.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const kanjiJsonPath = path.join(root, "src/data/n5/kanji.json")
const kanjivgJsonPath = path.join(root, "src/data/n5/kanjivg.json")
const outPath = path.join(root, "src/data/n5/radical-names.json")

const kanjiData = JSON.parse(readFileSync(kanjiJsonPath, "utf8"))
const kanjivgData = JSON.parse(readFileSync(kanjivgJsonPath, "utf8"))

const anchorHanviet = new Map()
for (const chapter of kanjiData.chapters) {
  for (const group of chapter.groups) {
    if (group.anchor && group.hanviet) anchorHanviet.set(group.anchor, group.hanviet)
  }
}

const components = new Set()
for (const char in kanjivgData) {
  for (const comp of kanjivgData[char].components) components.add(comp.element)
}

const result = {}
let fromAnchor = 0
let fromCurated = 0
let missing = []
for (const el of components) {
  if (anchorHanviet.has(el)) {
    result[el] = { hanviet: anchorHanviet.get(el), curated: false }
    fromAnchor++
  } else if (curatedRadicalNames[el]) {
    result[el] = { hanviet: curatedRadicalNames[el], curated: true }
    fromCurated++
  } else {
    missing.push(el)
  }
}

writeFileSync(outPath, JSON.stringify(result, null, 2) + "\n", "utf8")
console.log(`Wrote ${Object.keys(result).length}/${components.size} radical names to ${path.relative(root, outPath)}`)
console.log(`  from anchor hanviet: ${fromAnchor}`)
console.log(`  from hand curation: ${fromCurated}`)
if (missing.length > 0) console.log(`  no name (UI shows bare char): ${missing.join(" ")}`)
