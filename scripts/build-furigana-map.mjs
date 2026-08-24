// Builds src/data/furigana-map.json: for every pure-kanji vocab compound
// (2+ consecutive kanji, no kana anchors), attempts to split the word's kana
// reading into one reading-per-character using each character's known on/kun
// readings (scripts/all-readings.json, kanjiapi-sourced, covers the app's
// full kanji universe -- see fetch-secondary-kanji-data.mjs).
//
// Splitting is a backtracking search over each character's candidate
// readings (on + kun, cleaned of okurigana markers), plus two very common
// on'yomi-compound sound changes:
//   - rendaku (voicing): か→が, さ→ざ, た→だ, は→ば/ぱ, applied to any
//     character after the first (e.g. 一 + 人 -> ひと + り via 人's "-り").
//   - sokuon (gemination): a candidate ending in く/き/ち/つ may contract to
//     っ before the next character's reading (e.g. 学(がく) + 校(こう) ->
//     がっこう).
// 々 (iteration mark) has no readings of its own -- it repeats the previous
// character's reading, so its candidates are the previous character's
// candidates (plus rendaku, since repeated readings are very often voiced:
// 人々 ひとびと, 時々 ときどき).
//
// Entries where no full-length split reconstructs the original kana are
// jukujikun or otherwise irregular (明日/あした, 今日/きょう, 大人/おとな,
// ...) -- these get `null` in the map, meaning "render as one whole-word
// ruby", which is also what real dictionaries do for jukujikun. A hardcoded
// override table below covers the ones this search is known to miss or
// mis-split; anything else that fails the search also safely falls back to
// `null` (the Furigana.tsx consumer already treats a missing/null map entry
// as "no split available").
//
// Self-validates: every non-null split must rejoin to exactly the source
// kana, or the script throws rather than writing a bad map.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const readings = JSON.parse(fs.readFileSync(path.join(__dirname, "all-readings.json"), "utf8"))
const n5Vocab = JSON.parse(fs.readFileSync(path.join(root, "src/data/n5/vocabulary.json"), "utf8"))
const n4Vocab = JSON.parse(fs.readFileSync(path.join(root, "src/data/n4/vocabulary.json"), "utf8"))

const KANJI_RE = /[一-鿿㐀-䶿々]/

function isPureKanjiCompound(s) {
  const chars = [...s]
  return chars.length >= 2 && chars.every(ch => KANJI_RE.test(ch))
}

function kataToHira(s) {
  return s.replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))
}

// "ひと.つ" -> "ひと" (kanji-reading part only, drop okurigana after '.')
// "ひと-" / "-り" -> "ひと" / "り" (strip position-marker dashes)
function cleanReading(r) {
  let s = r.replace(/^-/, "").replace(/-$/, "")
  const dot = s.indexOf(".")
  if (dot !== -1) s = s.slice(0, dot)
  return kataToHira(s)
}

const RENDAKU = {
  か: "が", き: "ぎ", く: "ぐ", け: "げ", こ: "ご",
  さ: "ざ", し: "じ", す: "ず", せ: "ぜ", そ: "ぞ",
  た: "だ", ち: "ぢ", つ: "づ", て: "で", と: "ど",
  は: "ば", ひ: "び", ふ: "ぶ", へ: "べ", ほ: "ぼ",
}
const HANDAKU = { は: "ぱ", ひ: "ぴ", ふ: "ぷ", へ: "ぺ", ほ: "ぽ" }

function rendakuVariant(reading) {
  const first = reading[0]
  if (RENDAKU[first]) return RENDAKU[first] + reading.slice(1)
  return null
}
function handakuVariant(reading) {
  const first = reading[0]
  if (HANDAKU[first]) return HANDAKU[first] + reading.slice(1)
  return null
}

const SOKUON_TRIGGERS = new Set(["く", "き", "ち", "つ"])
function sokuonVariant(reading) {
  const last = reading[reading.length - 1]
  if (reading.length >= 2 && SOKUON_TRIGGERS.has(last)) {
    return reading.slice(0, -1) + "っ"
  }
  return null
}

// Base (unclean-deduped) candidate readings for a character, from its own
// on/kun entry. Does not include rendaku/sokuon/々 handling -- callers add
// those as needed per position.
function baseCandidates(ch) {
  const entry = readings[ch]
  if (!entry) return []
  const set = new Set()
  for (const r of [...(entry.on || []), ...(entry.kun || [])]) {
    const c = cleanReading(r)
    if (c) set.add(c)
  }
  return [...set]
}

// Expands a character's base candidates with rendaku/handaku (if not the
// first character) and sokuon (if not the last character) variants.
function expandCandidates(base, { isFirst, isLast }) {
  const set = new Set(base)
  if (!isFirst) {
    for (const c of base) {
      const rv = rendakuVariant(c)
      if (rv) set.add(rv)
      const hv = handakuVariant(c)
      if (hv) set.add(hv)
    }
  }
  if (!isLast) {
    for (const c of [...set]) {
      const sv = sokuonVariant(c)
      if (sv) set.add(sv)
    }
  }
  return [...set].filter(Boolean).sort((a, b) => b.length - a.length)
}

// Backtracking search: try to consume `kana` exactly using one candidate
// reading per character of `chars`.
function trySplit(chars, kana) {
  const n = chars.length
  const result = new Array(n)

  function rec(charIdx, pos, prevBase) {
    if (charIdx === n) return pos === kana.length
    const ch = chars[charIdx]
    const isFirst = charIdx === 0
    const isLast = charIdx === n - 1
    const base = ch === "々" ? prevBase : baseCandidates(ch)
    if (!base.length) return false
    const candidates = expandCandidates(base, { isFirst, isLast })
    for (const cand of candidates) {
      if (kana.startsWith(cand, pos)) {
        result[charIdx] = cand
        if (rec(charIdx + 1, pos + cand.length, base)) return true
      }
    }
    return false
  }

  if (rec(0, 0, null)) return result
  return null
}

// Hand-verified jukujikun / irregular readings that the character-reading
// search either can't split (no per-character correspondence exists) or
// could mis-split by coincidence. `null` = always render as one whole-word
// ruby.
const OVERRIDES = {
  "明日/あした": null,
  "今日/きょう": null,
  "昨日/きのう": null,
  "一日/ついたち": null,
  "二十日/はつか": null,
  "大人/おとな": null,
  "今年/ことし": null,
  "上手/じょうず": null,
  "下手/へた": null,
  "眼鏡/めがね": null,
  "土産/みやげ": null,
  "友達/ともだち": null,
  "一人/ひとり": null,
  "二人/ふたり": null,
  "八百屋/やおや": null,
  "七夕/たなばた": null,
  "為替/かわせ": null,
  "小豆/あずき": null,
  "博士/はかせ": null,
  "迷子/まいご": null,
}

function buildMap(entries) {
  const map = {}
  const jukujikun = []
  const splitOk = []

  for (const entry of entries) {
    const { kanji, kana } = entry
    if (!isPureKanjiCompound(kanji) || !kana) continue
    const key = `${kanji}/${kana}`
    if (key in map) continue // dedupe repeats across N5/N4

    if (key in OVERRIDES) {
      map[key] = OVERRIDES[key]
      if (OVERRIDES[key] === null) jukujikun.push(key)
      continue
    }

    const chars = [...kanji]
    const split = trySplit(chars, kana)
    if (split) {
      // Self-validate: rejoined split must equal the source kana exactly.
      if (split.join("") !== kana) {
        throw new Error(`Validation failed for ${key}: split ${JSON.stringify(split)} joins to "${split.join("")}"`)
      }
      map[key] = split
      splitOk.push(key)
    } else {
      map[key] = null
      jukujikun.push(key)
    }
  }

  return { map, jukujikun, splitOk }
}

const allEntries = [...n5Vocab, ...n4Vocab]
const { map, jukujikun, splitOk } = buildMap(allEntries)

const outPath = path.join(root, "src/data/furigana-map.json")
fs.writeFileSync(outPath, JSON.stringify(map, null, 2) + "\n")

console.log(`Wrote ${outPath}`)
console.log(`Total pure-kanji compound entries: ${Object.keys(map).length}`)
console.log(`Split successfully: ${splitOk.length}`)
console.log(`Unsplit (null, whole-word fallback): ${jukujikun.length}`)
console.log("\nUnsplit entries (review these -- expected to be jukujikun/irregular):")
for (const key of jukujikun) console.log(`  ${key}`)
