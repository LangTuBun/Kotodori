// On/Kun classifier for a word's kanji characters, given each character's
// on'yomi/kun'yomi reading lists (e.g. from kanjiapi.dev). Validated at
// ~95% agreement against the existing hand-labeled kanji.json corpus
// (scripts/validate-classifier.mjs) before being trusted on new data --
// the remaining ~5% are irregular/contracted readings (日本 に, euphonic
// number compounds like 六百 ろっぴゃく) that no reading-list lookup can
// derive; callers should treat a null result, or a word containing a
// known multi-reading character, as needing manual review rather than
// trusting the output blindly.
const KANJI_RE = /[一-鿿㐀-䶿々]/

export function katakanaToHiragana(s) {
  return s.replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))
}

// "ひと.つ" -> "ひと", "ひと-" -> "ひと", "-あ.がり" -> "あ"
function coreReading(reading) {
  return reading.replace(/^-/, "").split(/[.-]/)[0]
}

const VOICE_MAP = { か: "が", き: "ぎ", く: "ぐ", け: "げ", こ: "ご",
  さ: "ざ", し: "じ", す: "ず", せ: "ぜ", そ: "ぞ",
  た: "だ", ち: "ぢ", つ: "づ", て: "で", と: "ど",
  は: "ば", ひ: "び", ふ: "ぶ", へ: "べ", ほ: "ぼ" }
const HANDAKU_MAP = { は: "ぱ", ひ: "ぴ", ふ: "ぷ", へ: "ぺ", ほ: "ぽ" }
// kanjiapi's readings are the plain dictionary form; a compound can voice
// (rendaku: 国 くに -> 雪ぐに) or half-voice (百 ひゃく -> 六百ろっぴゃく's
// ぴゃく) the FIRST mora of a non-initial reading. Going the other way
// (voiced dictionary form appearing devoiced) essentially doesn't happen in
// practice, so only the forward transform is needed. は-row characters have
// *both* a rendaku form (は->ば) and a han-dakuten form (は->ぱ) available
// -- which one a given compound uses isn't predictable from the reading
// alone (電報 でんぽう vs 番犬 ばんけん), so both must be tried, not just
// whichever map happens to be checked first.
function voicedVariants(s) {
  if (!s) return [s]
  const first = s[0]
  const rest = s.slice(1)
  const out = [s]
  if (VOICE_MAP[first]) out.push(VOICE_MAP[first] + rest)
  if (HANDAKU_MAP[first]) out.push(HANDAKU_MAP[first] + rest)
  return out
}

// Does `remaining` (the unconsumed suffix of the word's kana) plausibly start
// with `candidateReading`, tolerating rendaku/han-dakuten on the first mora
// and a trailing geminate (small tsu) the candidate reading doesn't spell?
function matchesPrefix(remaining, candidateReading) {
  const core = coreReading(candidateReading)
  if (!core) return 0
  const variants = voicedVariants(core)
  for (const v of variants) {
    if (remaining.startsWith(v)) return v.length
    // small-tsu gemination: 学(がく) + 校(こう) -> がっこう; 六(ろく) + 百(ひゃく) -> ろっぴゃく
    if (v.length > 0 && remaining.startsWith(v.slice(0, -1) + "っ")) return v.length
  }
  return 0
}

// Unified whole-word backtracking matcher: walks kanjiStr character by
// character against kanaStr. A literal (non-kanji) character must exactly
// match the next kana character (katakana literals normalized to hiragana
// first). A kanji character tries each on/kun candidate reading (longest
// first) against the remaining kana, recursing, and backtracks on dead
// ends. Backtracking across the whole word (not per isolated run) matters:
// e.g. 五つ "いつつ" needs 五 to try the *shorter* core reading い before
// つ can consume as a literal, else it needs to backtrack to try い alone
// then match "つ" as kun, vs. resolving the literal boundary eagerly via
// indexOf (which mis-anchors on self-overlapping kana like いつつ, みっつ).
function classifyChars(chars, kanaStr, onKunByChar) {
  function helper(i, pos) {
    if (i === chars.length) return pos === kanaStr.length ? [] : null
    const ch = chars[i]
    if (!KANJI_RE.test(ch)) {
      const lit = katakanaToHiragana(ch)
      if (kanaStr[pos] !== lit) return null
      const rest = helper(i + 1, pos + 1)
      return rest ? [{ char: ch, type: null }, ...rest] : null
    }
    // 々 isn't a character with its own reading -- it repeats whatever
    // immediately precedes it (時々 ときどき: 々 stands in for 時 read どき).
    const { on, kun } = ch === "々" && i > 0 ? onKunByChar(chars[i - 1]) : onKunByChar(ch)
    const remaining = kanaStr.slice(pos)
    const candidates = [
      ...on.map(r => ({ type: "On", r })),
      ...kun.map(r => ({ type: "Kun", r })),
    ]
    const scored = candidates
      .map(c => ({ ...c, len: matchesPrefix(remaining, c.r) }))
      .filter(c => c.len > 0)
      .sort((a, b) => b.len - a.len)
    for (const c of scored) {
      const rest = helper(i + 1, pos + c.len)
      if (rest) return [{ char: ch, type: c.type }, ...rest]
    }
    return null
  }
  return helper(0, 0)
}

// `onKunByChar(char)` must return `{ on: string[], kun: string[] }` (on
// readings already in hiragana). Returns an array of {char, type} per
// kanji character (kana literals omitted), or null if unsegmentable.
export function classifyWord(kanjiStr, kanaStr, onKunByChar) {
  const result = classifyChars([...kanjiStr], kanaStr, onKunByChar)
  if (!result) return null
  return result.filter(r => r.type !== null)
}
