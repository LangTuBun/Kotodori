// Measures the on/kun classifier + Han Viet concatenator against the
// existing hand-labeled kanji.json corpus, so their trustworthiness on new
// data is a measured number, not an assumption. Re-run after touching
// either classifier or after readings/hanviet data changes.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { classifyWord, katakanaToHiragana } from "./onkun-classifier.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const kanjiData = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "src", "data", "n5", "kanji.json"), "utf8"))
const hanvietDict = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "src", "data", "hanviet-dictionary.json"), "utf8"))
const allReadings = JSON.parse(fs.readFileSync(path.join(__dirname, "all-readings.json"), "utf8"))

const KANJI_RE = /[一-鿿㐀-䶿々]/

function onKunByChar(ch) {
  const r = allReadings[ch]
  if (!r) return { on: [], kun: [] }
  return { on: r.on.map(katakanaToHiragana), kun: r.kun }
}
function hanVietForWord(kanjiStr) {
  const chars = [...kanjiStr].filter(ch => KANJI_RE.test(ch))
  const parts = chars.map(ch => hanvietDict[ch])
  if (parts.some(p => !p)) return null
  return parts.join(" ")
}

let total = 0, skippedIrregular = 0, onkunMatch = 0, onkunMismatch = 0
let hanvietTotal = 0, hanvietMatch = 0, hanvietMismatch = 0
const onkunFails = []
const hanvietFails = []

for (const c of kanjiData.chapters) {
  for (const g of c.groups) {
    for (const w of g.words) {
      total++
      if (w.onkun === "Juku" || w.onkun === "Ate") { skippedIrregular++; continue }
      const kanaVariant = w.kana.split("/")[0]
      const predicted = classifyWord(w.kanji, kanaVariant, onKunByChar)
      if (!predicted) {
        onkunMismatch++
        onkunFails.push({ kanji: w.kanji, kana: w.kana, actual: w.onkun, predicted: "(unsegmentable)" })
      } else {
        const predictedTag = predicted.map(p => p.type).join("--")
        if (predictedTag === w.onkun) onkunMatch++
        else { onkunMismatch++; onkunFails.push({ kanji: w.kanji, kana: w.kana, actual: w.onkun, predicted: predictedTag }) }
      }

      hanvietTotal++
      const predictedHv = hanVietForWord(w.kanji)
      if (!predictedHv) { hanvietMismatch++; hanvietFails.push({ kanji: w.kanji, actual: w.hanviet, predicted: "(no lookup)" }) }
      else if (predictedHv.toLowerCase() === w.hanviet.toLowerCase()) hanvietMatch++
      else { hanvietMismatch++; hanvietFails.push({ kanji: w.kanji, actual: w.hanviet, predicted: predictedHv }) }
    }
  }
}

console.log(`Total words: ${total} (${skippedIrregular} Juku/Ate skipped)`)
console.log(`On/Kun classifier: ${onkunMatch}/${onkunMatch + onkunMismatch} match (${(100 * onkunMatch / (onkunMatch + onkunMismatch)).toFixed(1)}%)`)
console.log(`Han Viet concatenator: ${hanvietMatch}/${hanvietTotal} match (${(100 * hanvietMatch / hanvietTotal).toFixed(1)}%)`)
if (process.argv.includes("--verbose")) {
  console.log(`\n--- On/Kun failures (${onkunFails.length}) ---`)
  for (const f of onkunFails) console.log(`  ${f.kanji} (${f.kana}): actual=${f.actual} predicted=${f.predicted}`)
  console.log(`\n--- Han Viet failures (${hanvietFails.length}) ---`)
  for (const f of hanvietFails) console.log(`  ${f.kanji}: actual="${f.actual}" predicted="${f.predicted}"`)
}
