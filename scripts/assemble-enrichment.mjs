// Zips hand-translated Vietnamese meanings (scripts/enrichment-meanings.json,
// written in the same group-then-item order as the draft) onto the resolved
// draft (scripts/enrichment-draft.json), producing the final merge input:
// { [groupId]: [{kanji,kana,hanviet,meaning,onkun}, ...] }. Fails loudly on
// any count mismatch rather than silently misaligning translations to the
// wrong word.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const draft = JSON.parse(fs.readFileSync(path.join(__dirname, "enrichment-draft.json"), "utf8"))
const meanings = JSON.parse(fs.readFileSync(path.join(__dirname, "enrichment-meanings.json"), "utf8"))

const totalItems = draft.reduce((a, g) => a + g.items.length, 0)
if (totalItems !== meanings.length) {
  console.error(`Count mismatch: ${totalItems} draft items vs ${meanings.length} meanings. Aborting.`)
  process.exit(1)
}

const result = {}
let i = 0
for (const g of draft) {
  result[g.id] = g.items.map(it => ({
    kanji: it.kanji,
    kana: it.kana,
    hanviet: it.hanviet,
    meaning: meanings[i++],
    onkun: it.onkun,
  }))
}

fs.writeFileSync(
  path.join(__dirname, "enrichment-additions.json"),
  JSON.stringify(result, null, 2) + "\n",
  "utf8"
)
console.log(`Assembled ${totalItems} words across ${Object.keys(result).length} groups.`)
