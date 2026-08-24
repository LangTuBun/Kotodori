// Splits a DungMori-style fused kanji+furigana string (e.g. "給料きゅうりょう",
// "入いり口ぐち", "（～を）出でる") into { kanji, kana }.
//
// Key insight (see handoff): the furigana is *not* a separate annotation
// layer that needs regenerating -- it's positionally interleaved in the
// source, immediately after the kanji it belongs to. So:
//   - kana is nearly free: it's whatever reading text the algorithm below
//     consumes, plus any literal kana that was never wrapped in scaffolding.
//   - kanji is the real work: for each *contiguous kanji run* (a jukugo with
//     no okurigana between its characters gets one combined reading block
//     trailing the whole run, e.g. "給料"+"きゅうりょう"; a kanji broken up
//     by real okurigana gets its own reading right after it, e.g.
//     "入"+"いり"+"口"+"ぐち"), greedily match each kanji in the run in turn
//     against the run's trailing literal block (rendaku/han-dakuten/
//     gemination-tolerant, reusing onkun-classifier.mjs's matchesPrefix).
//     Whatever the run's kanji don't end up consuming is real trailing
//     okurigana and stays in `kanji` literally.
//
// Scaffolding handling: text inside （...） (any nesting depth) or a bare
// leading "～"/"∼" is a usage-note / particle marker, not part of the
// headword's own reading -- kept verbatim in `kanji` (with its own internal
// kanji still reading-stripped, so nested furigana like
// "（お風呂ふろ・お湯ゆを）" also comes out clean) but excluded from `kana`.
//
// Anything the matcher can't resolve confidently is flagged rather than
// guessed -- see build-n4-draft.mjs for how flagged rows get collected for
// manual resolution (same discipline as resolve-flagged.mjs in the N5
// pipeline).
import { KANJI_RE, matchesPrefix, katakanaToHiragana } from "./onkun-classifier.mjs"

const HIRAGANA_RE = /[ぁ-ゖー]/
const KANA_RE = /[ぁ-ゖーァ-ヶｰ]/

function markScaffolding(chars) {
  const scaffold = new Array(chars.length).fill(false)
  let depth = 0
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]
    if (ch === "（") { scaffold[i] = true; depth++; continue }
    if (ch === "）") { scaffold[i] = true; depth = Math.max(0, depth - 1); continue }
    if (depth > 0) { scaffold[i] = true; continue }
    if (ch === "～" || ch === "∼") { scaffold[i] = true; continue }
    scaffold[i] = false
  }
  return scaffold
}

// NOTE: tried a "prefer dotted kun over bare kun" variant here to fix a
// specific bug (生うまれる mis-splitting to "生る" -- see 生's override in
// assemble-n4-vocab.mjs), but measured it against every row first
// (scripts/diff-dotted-fix.mjs) and it was a net regression: 4 genuine
// fixes vs 8 newly-broken previously-correct words (入り口 -> 入り口ち,
// 彼 -> 彼れ, etc.), and it didn't even fully fix 生 (produced "生れる",
// still wrong). Reverted to plain longest-match; 生 and its class are
// handled as individual hand overrides instead -- see assemble script.
function bestMatch(remaining, on, kun) {
  const candidates = [
    ...on.map(r => katakanaToHiragana(r)).map(r => ({ r })),
    ...kun.map(r => ({ r })),
  ]
    .map(c => ({ ...c, len: matchesPrefix(remaining, c.r) }))
    .filter(c => c.len > 0)
    .sort((a, b) => b.len - a.len)
  return candidates[0]?.len ?? 0
}

/**
 * @param {string} fused
 * @param {(char: string) => { on: string[], kun: string[] }} onKunByChar
 *   readings already normalized as kanjiapi.dev returns them (on-readings in
 *   katakana -- converted internally; kun with dotted okurigana markers).
 */
export function splitFused(fused, onKunByChar) {
  const chars = [...fused]
  const scaffold = markScaffolding(chars)
  let kanji = ""
  let kana = ""
  let lastKanji = null
  const flags = []
  let i = 0
  // Once we hit a top-level "/" or "・" (an alternate-spelling separator,
  // e.g. "入いれる/淹いれる", "甥おい/甥おいっ子"), everything after it is a
  // second orthography for the *same* reading already captured -- keep
  // building `kanji` normally (both spellings stay visible) but stop
  // contributing to `kana`, or the reading ends up duplicated.
  let afterAltMarker = false

  while (i < chars.length) {
    if (!KANJI_RE.test(chars[i])) {
      kanji += chars[i]
      if (!scaffold[i] && KANA_RE.test(chars[i]) && !afterAltMarker) kana += chars[i]
      if (!scaffold[i] && (chars[i] === "/" || chars[i] === "・")) afterAltMarker = true
      i++
      continue
    }

    // Contiguous kanji run.
    const runStart = i
    let j = i
    while (j < chars.length && KANJI_RE.test(chars[j])) j++
    const run = chars.slice(runStart, j)
    kanji += run.join("")

    // Trailing literal block immediately after the run.
    let k = j
    while (k < chars.length && !KANJI_RE.test(chars[k])) k++
    const block = chars.slice(j, k)

    let cursor = 0
    run.forEach((rch, idx) => {
      const isIterMark = rch === "々"
      const { on, kun } = isIterMark && lastKanji ? onKunByChar(lastKanji) : onKunByChar(rch)
      if (!isIterMark) lastKanji = rch
      const remaining = block.slice(cursor).join("")
      const matchLen = bestMatch(remaining, on, kun)
      if (matchLen > 0 && !scaffold[runStart + idx] && !afterAltMarker) {
        kana += remaining.slice(0, matchLen)
      }
      cursor += matchLen
    })

    if (cursor === 0 && block.length > 0 && HIRAGANA_RE.test(block[0]) && !scaffold[j]) {
      flags.push(`no reading match for run 「${run.join("")}」 before "${block.join("").slice(0, 8)}"`)
    }

    // Leftover after the run consumed what reading it could -- real
    // trailing content (okurigana, or scaffolding punctuation/particles).
    for (let li = cursor; li < block.length; li++) {
      const pos = j + li
      kanji += block[li]
      if (!scaffold[pos] && KANA_RE.test(block[li]) && !afterAltMarker) kana += block[li]
      if (!scaffold[pos] && (block[li] === "/" || block[li] === "・")) afterAltMarker = true
    }

    i = k
  }

  if (kanji.replace(/[（）～∼\s]/g, "") !== "" && kana === "") {
    flags.push("empty derived kana despite non-scaffolding content")
  }
  return { kanji, kana, flags }
}
