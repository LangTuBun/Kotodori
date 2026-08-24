// Assembles src/data/n4/kanji.json from n4-kanji-source.mjs (hand-transcribed
// kanji/kana/meaning) by computing everything that shouldn't be hand-typed:
//   - per-word hanviet: joins hanviet-dictionary.json per kanji character
//   - onyomi/kunyomi: looked up per anchor from scripts/all-readings.json
//   - per-word onkun tag ("On"/"Kun"/"On--Kun"/...): scripts/onkun-classifier.mjs
//   - group-level onkun: the classified type of the anchor character's own
//     token within words[0] (matches n5/kanji.json's observed convention --
//     verified against real entries, e.g. anchor 土 in 土曜日 (On-On-Kun)
//     classifies to "On" because 土 itself reads ど there, not because
//     words[0].onkun as a whole string is "On").
// Hard-fails (throws) on any unresolved character rather than silently
// writing a "?" placeholder into shipped data.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { CHAPTERS } from "./n4-kanji-source.mjs"
import { classifyWord, katakanaToHiragana, KANJI_RE } from "./onkun-classifier.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const allReadings = JSON.parse(fs.readFileSync(path.join(__dirname, "all-readings.json"), "utf8"))
const hanvietDict = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/data/hanviet-dictionary.json"), "utf8"))

function onKunByChar(ch) {
  const r = allReadings[ch]
  if (!r) throw new Error(`no on/kun readings for character: ${ch}`)
  return { on: r.on.map(katakanaToHiragana), kun: r.kun }
}

function wordHanviet(word) {
  const chars = [...word].filter(c => KANJI_RE.test(c))
  const parts = []
  for (const c of chars) {
    if (c === "々") { parts.push(parts[parts.length - 1] ?? "?"); continue }
    const hv = hanvietDict[c]
    if (!hv) throw new Error(`no hanviet entry for character: ${c} (in word "${word}")`)
    parts.push(hv)
  }
  return parts.join(" ")
}

// Hand-resolved for words the prefix-matching classifier can't derive:
// true jukujikun (時計/切符/切手/色んな/景色/風邪 -- the reading doesn't
// decompose character-by-character from any listed on/kun at all) plus two
// cases that are really a classifier limitation, not irregular readings --
// 係 as a bare noun needs its full dotted kun (kaka.ri -> "かかり") where the
// dot marks *implied* okurigana with no okurigana kanji following to anchor
// it, and お姉さん uses 姉's honorific kun (ねえ) instead of its dictionary
// kun (あね). Verified against the exact [kanji, kana] pair so a source-data
// edit can't silently misapply the wrong override.
const ONKUN_OVERRIDES = new Map([
  ["時計|とけい", "Juku"],
  ["腕時計|うでどけい", "Kun--Juku"],
  ["切符|きっぷ", "Juku"],
  ["切手|きって", "Juku"],
  ["色んな|いろいろな", "Juku"],
  ["景色|けしき", "Juku"],
  ["風邪|かぜ", "Juku"],
  ["係の人|かかりのひと", "Kun--Kun"],
  ["お姉さん|おねえさん", "Kun"],
])

function onkunTag(word, kana) {
  const override = ONKUN_OVERRIDES.get(`${word}|${kana}`)
  if (override) return override
  const result = classifyWord(word, kana, onKunByChar)
  if (!result) return null
  return result.map(r => r.type).join("--")
}

let unresolvedCount = 0
const chapters = []

for (const { chapter, anchors } of CHAPTERS) {
  const groups = []
  let wordCount = 0

  anchors.forEach(([anchor, meaningEn, words], i) => {
    const id = `k${chapter}_g${i + 1}`
    const readings = allReadings[anchor]
    if (!readings) throw new Error(`no readings for anchor ${anchor}`)

    const builtWords = words.map(([kanji, kana, meaning]) => {
      let onkun = onkunTag(kanji, kana)
      if (!onkun) {
        console.warn(`  [unresolved] ${id} ${anchor}: "${kanji}" (${kana}) did not classify`)
        unresolvedCount++
      }
      return { kanji, kana, hanviet: wordHanviet(kanji), meaning, onkun: onkun ?? "" }
    })
    wordCount += builtWords.length

    // group-level onkun: the anchor character's own token type within words[0]
    let groupOnkun = null
    const first = words[0]
    if (first) {
      const classified = classifyWord(first[0], first[1], onKunByChar)
      const anchorToken = classified?.find(r => r.char === anchor)
      groupOnkun = anchorToken?.type ?? (readings.kun.length ? "Kun" : readings.on.length ? "On" : null)
    }

    groups.push({
      id,
      anchor,
      kana: null,
      hanviet: hanvietDict[anchor] ?? null,
      meaning: meaningEn,
      onkun: groupOnkun,
      onyomi: readings.on,
      kunyomi: readings.kun,
      words: builtWords,
    })
  })

  chapters.push({ chapter, groupCount: groups.length, wordCount, groups })
}

if (unresolvedCount > 0) {
  throw new Error(`${unresolvedCount} word(s) failed to classify -- fix source data or extend all-readings.json before writing output`)
}

const totalGroups = chapters.reduce((n, c) => n + c.groupCount, 0)
const totalWords = chapters.reduce((n, c) => n + c.wordCount, 0)
console.log(`N4 kanji: ${chapters.length} chapters, ${totalGroups} groups, ${totalWords} words`)

const outPath = path.join(__dirname, "../src/data/n4/kanji.json")
fs.writeFileSync(outPath, JSON.stringify({ chapters }, null, 2) + "\n")
console.log("wrote", outPath)
