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
const n5Kanji = JSON.parse(fs.readFileSync(path.join(root, "src/data/n5/kanji.json"), "utf8"))
const n4Kanji = JSON.parse(fs.readFileSync(path.join(root, "src/data/n4/kanji.json"), "utf8"))

// kanji.json's per-anchor words[] lists are a separate, larger word pool
// than vocabulary.json (~2.5x more entries, limited overlap -- see
// Homophones.tsx's buildPool, which draws from both for the same reason).
// Kanji.tsx and KanjiGroupModal render these through <Furigana> too, so the
// map has to cover them or those pages keep the old whole-run rendering.
function kanjiJsonWords(kanjiData) {
  const words = []
  for (const chapter of kanjiData.chapters) {
    for (const group of chapter.groups) {
      for (const w of group.words) words.push(w)
    }
  }
  return words
}

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
//
// Also returns a second "full" form with the dot removed entirely (parts
// joined). Most kun entries list the dot specifically to mark where
// okurigana *would* begin in the verb/adjective form (焼く -> "や.く"), but
// some compound nouns are conventionally written with that okurigana
// absorbed into the kanji itself (焼肉, not 焼き肉; 建物, not 建て物) --
// kanjidic captures this as a *separate* kun entry with the okurigana
// already folded in (e.g. 建 lists both "た.てる" and "た.て"). Taking the
// dot-removed form of a short entry like "た.て" recovers "たて", the
// correct compound-noun reading; taking it for "た.てる" just produces the
// unused "たてる", which harmlessly never matches.
function cleanReadings(r) {
  let s = r.replace(/^-/, "").replace(/-$/, "")
  const dot = s.indexOf(".")
  if (dot === -1) return [kataToHira(s)]
  return [kataToHira(s.slice(0, dot)), kataToHira(s.slice(0, dot) + s.slice(dot + 1))]
}

const RENDAKU = {
  か: ["が"], き: ["ぎ"], く: ["ぐ"], け: ["げ"], こ: ["ご"],
  さ: ["ざ"], し: ["じ"], す: ["ず"], せ: ["ぜ"], そ: ["ぞ"],
  た: ["だ"], ち: ["ぢ", "じ"], つ: ["づ", "ず"], て: ["で"], と: ["ど"],
  は: ["ば"], ひ: ["び"], ふ: ["ぶ"], へ: ["べ"], ほ: ["ぼ"],
}
const HANDAKU = { は: "ぱ", ひ: "ぴ", ふ: "ぷ", へ: "ぺ", ほ: "ぽ" }

function rendakuVariants(reading) {
  const first = reading[0]
  return (RENDAKU[first] || []).map(v => v + reading.slice(1))
}
function handakuVariant(reading) {
  const first = reading[0]
  if (HANDAKU[first]) return HANDAKU[first] + reading.slice(1)
  return null
}

// ち/き/く/つ can contract to っ before the next character's reading
// (学(がく) + 校(こう) -> がっこう). Applies even to a bare single-mora
// reading (切(き) + 符(ぷ) -> きっぷ).
const SOKUON_TRIGGERS = new Set(["く", "き", "ち", "つ"])
function sokuonVariant(reading) {
  const last = reading[reading.length - 1]
  if (SOKUON_TRIGGERS.has(last)) {
    return reading.slice(0, -1) + "っ"
  }
  return null
}

// Base candidate readings for a character, from its own on/kun entry. Does
// not include rendaku/sokuon/々 handling -- callers add those as needed per
// position.
function baseCandidates(ch) {
  const entry = readings[ch]
  if (!entry) return []
  const set = new Set()
  for (const r of [...(entry.on || []), ...(entry.kun || [])]) {
    for (const c of cleanReadings(r)) {
      if (c) set.add(c)
    }
  }
  return [...set]
}

// Expands a character's base candidates with rendaku/handaku (if not the
// first character) and sokuon (if not the last character) variants.
function expandCandidates(base, { isFirst, isLast }) {
  const set = new Set(base)
  if (!isFirst) {
    for (const c of base) {
      for (const rv of rendakuVariants(c)) set.add(rv)
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

// Hand-verified overrides, checked against the actual N5+N4 vocab set.
// Two kinds:
//   - explicit splits for compounds whose per-character boundary is known
//     but isn't recoverable from on/kun data (irregular contractions like
//     日 -> に in 日本, or け for 景 in 景色 -- both real, dictionary-attested
//     readings, just not ones kanjidic records as a distinct kun/on)
//   - `null` for genuine jukujikun, where the reading doesn't correspond to
//     individual characters at all (明日/あした, 大人/おとな, ...) -- always
//     rendered as one whole-word ruby, same as a real dictionary would.
const OVERRIDES = {
  "日本/にほん": ["に", "ほん"],
  "日本人/にほんじん": ["に", "ほん", "じん"],
  "日本語/にほんご": ["に", "ほん", "ご"],
  "日本食/にほんしょく": ["に", "ほん", "しょく"],
  "日本料理/にほんりょうり": ["に", "ほん", "りょう", "り"],
  "景色/けしき": ["け", "しき"],
  // き+ふ(->ぷ) gains an inserted geminate (きっぷ/きって) rather than 切's
  // own trailing mora contracting into one -- the search only models
  // trailing-mora contraction, not mora insertion, so these need a literal
  // split.
  "切符/きっぷ": ["きっ", "ぷ"],
  "切手/きって": ["きっ", "て"],
  // 植える's masu-stem うえ used as a noun -- kanjidic only lists the verb
  // form "う.える" for 植, not a separate stem-only kun entry the way 建/焼
  // do, so the dot-removal trick above can't recover "うえ" on its own.
  "植木/うえき": ["うえ", "き"],

  "今日/きょう": null,
  "明日/あした": null,
  "明後日/あさって": null,
  "昨日/きのう": null,
  "一昨日/おととい": null,
  "今朝/けさ": null,
  "一日/ついたち": null,
  "二日/ふつか": null,
  "二日前/ふつかまえ": null,
  "二十日/はつか": null,
  "今年/ことし": null,
  "一昨年/おととし": null,
  "大人/おとな": null,
  "部屋/へや": null,
  "下手/へた": null,
  "時計/とけい": null,
  "腕時計/うでどけい": null,
  "風邪/かぜ": null,
  "相撲/すもう": null,
  "息子/むすこ": null,
  "真面目/まじめ": null,
  "果物/くだもの": null,
  "八百屋/やおや": null,
  // Data bugs, not jukujikun -- pre-existing corruption in the source JSON,
  // not this script's job to fix. null just keeps today's whole-word
  // fallback rather than compounding the corruption into a bogus split.
  // 仕事: kana is doubled ("しごとおしごと" instead of "しごと").
  "仕事/しごとおしごと": null,
  // 学院: kanji field is missing its leading 大 (kana/hanviet/meaning are
  // all for 大学院 "graduate school"; 学院 alone means "institute").
  "学院/だいがくいん": null,
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
      else splitOk.push(key)
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

const allEntries = [...n5Vocab, ...n4Vocab, ...kanjiJsonWords(n5Kanji), ...kanjiJsonWords(n4Kanji)]
const { map, jukujikun, splitOk } = buildMap(allEntries)

const outPath = path.join(root, "src/data/furigana-map.json")
fs.writeFileSync(outPath, JSON.stringify(map, null, 2) + "\n")

console.log(`Wrote ${outPath}`)
console.log(`Total pure-kanji compound entries: ${Object.keys(map).length}`)
console.log(`Split successfully: ${splitOk.length}`)
console.log(`Unsplit (null, whole-word fallback): ${jukujikun.length}`)
console.log("\nUnsplit entries (review these -- expected to be jukujikun/irregular):")
for (const key of jukujikun) console.log(`  ${key}`)
