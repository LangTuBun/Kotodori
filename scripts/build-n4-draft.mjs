// Runs every parsed N4 row through the fused-string splitter, assigns POS
// from the section it came from (+ suru/transitivity markers in the fused
// text -- free signal the N5 pipeline never had), and writes a draft file.
// Anything the splitter flagged, plus a few extra heuristic red flags
// (alternate-spelling "/" or "・", multi-word cells, suspiciously short
// output), is collected separately for manual resolution.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { splitFused } from "./split-n4-fused.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rows = JSON.parse(fs.readFileSync(path.join(__dirname, "n4-raw-rows.json"), "utf8"))
const allReadings = JSON.parse(fs.readFileSync(path.join(__dirname, "all-readings.json"), "utf8"))

function onKunByChar(ch) {
  const r = allReadings[ch]
  if (!r) return { on: [], kun: [] }
  return { on: r.on, kun: r.kun }
}

// POS assignment strategy: sections 7/8/9 (i-adj / na-adj / verb) and the
// kanji.json-style pure-noun sections (3-6) give a reliable section-level
// default for free. Section 1 (quantifiers/degree/adverbs) and section 10
// ("Khác" -- a genuine catch-all, 312 words) are mixed and get a per-word
// pattern check on top of the section default. `verbGroup` is NOT sourced
// data (unlike N5's textbook-derived groups) -- group1/2 is inferred from
// the standard -iru/-eru-ends-in-ichidan heuristic, which is reliable
// except for a known, hardcoded list of godan exceptions (Japanese has no
// larger closed set of these). Suru-verbs (group3) are a safe, deterministic
// call regardless -- する always conjugates as group3.
const KANJI_RE = /[一-鿿々]/
const GODAN_ERU_IRU_EXCEPTIONS = new Set([
  "いる", "要る", "帰る", "入る", "走る", "知る", "減る", "散る", "切る", "蹴る",
  "滑る", "握る", "喋る", "しゃべる", "茂る", "限る", "焦る", "参る", "照る",
  "交じる", "混じる", "いじる", "齧る", "かじる",
])
const ICHIDAN_ENDING_RE = /[いきぎしじちにひびぴみりえけげせぜてでねへべぺめれ]る$/

function coreOf(kanji) {
  return kanji.replace(/^[（(].*?[）)]/, "").replace(/[（(].*?[）)]$/, "").replace(/^～/, "")
}

function classifyVerb(core) {
  if (/する$/.test(core)) return { pos: "verb-group3", verbGroup: 3 }
  if (core === "来る" || core === "くる") return { pos: "verb-group3", verbGroup: 3 }
  if (GODAN_ERU_IRU_EXCEPTIONS.has(core)) return { pos: "verb-group1", verbGroup: 1 }
  if (ICHIDAN_ENDING_RE.test(core)) return { pos: "verb-group2", verbGroup: 2 }
  return { pos: "verb-group1", verbGroup: 1 }
}

// Every section's title ("Danh từ - ...", "Động từ", ...) is a *bias*, not
// a guarantee -- even the noun sections (3-6) turn out to have verbs mixed
// in (叶う, 掛ける, 込む...), so the per-word pattern check below runs
// universally and the section only supplies the fallback when a word is
// genuinely ambiguous (pure kana, no verb/adjective-shaped ending).
function inferPos(fused, kanji, sectionNum) {
  const core = coreOf(kanji)
  const isSuru = /する$/.test(core) || fused.includes("（する）") || fused.includes("（（する）")
  if (isSuru) return classifyVerb(isSuru && !/する$/.test(core) ? core + "する" : core)

  if (sectionNum === 7) return { pos: "adj-i", verbGroup: null }
  if (sectionNum === 8) return { pos: "adj-na", verbGroup: null }
  if (/^～/.test(kanji) || /^～/.test(fused)) return { pos: "suffix", verbGroup: null }
  // Keigo section is verb-dominant even in pure kana (おっしゃる, なさる,
  // ございます) -- unlike sections 1/10, safe to treat any kana-only
  // godan-shaped ending here as a verb without requiring kanji presence.
  if (sectionNum === 2 && /(る|う|く|ぐ|す|つ|ぬ|ぶ|む)$/.test(core) && core.length > 1) return classifyVerb(core)
  if (ICHIDAN_ENDING_RE.test(core) || GODAN_ERU_IRU_EXCEPTIONS.has(core)) {
    return classifyVerb(core)
  }
  if (/(る|う|く|ぐ|す|つ|ぬ|ぶ|む)$/.test(core) && KANJI_RE.test(core)) return classifyVerb(core)
  if (/い$/.test(core) && core.length > 1) return { pos: "adj-i", verbGroup: null }
  if (KANJI_RE.test(core)) return { pos: "noun", verbGroup: null }
  if (/^[ァ-ヶー]+$/.test(core)) return { pos: "noun", verbGroup: null } // pure-katakana loanword
  // Nothing matched -- genuinely ambiguous pure-kana word. The noun
  // sections (3-6) and keigo (2) default to noun rather than 'unknown'
  // since that's overwhelmingly what's left there; 1/10 stay 'unknown'
  // (same tolerance the N5 corpus already has for MD-sourced entries).
  if ((sectionNum >= 2 && sectionNum <= 6) && core.length > 1) return { pos: "noun", verbGroup: null }
  return { pos: "unknown", verbGroup: null }
}

// A handful of pure-kana section-1/10 words the pattern heuristics above
// can't safely resolve (adverbs/conjunctions ending in a verb-like mora,
// bare-kana verbs the kanji-presence guard above deliberately excludes to
// avoid misclassifying those adverbs) -- hand-classified by reading each
// one rather than guessed by pattern.
//
// Each entry carries the exact `fused` source text it was written against
// -- ids are assigned by row position, so if the source markdown ever
// shifts (a row added/removed/reordered), every id after that point points
// at a different word. Validated below; aborts rather than silently
// applying an override to the wrong entry (same discipline as
// assemble-n4-vocab.mjs's OVERRIDES).
const POS_OVERRIDES = {
  n4_0001: { fused: "きっと", pos: "adverb" },
  n4_0002: { fused: "もしかしたら", pos: "adverb" },
  n4_0004: { fused: "しかも", pos: "adverb" },
  n4_0005: { fused: "もっと", pos: "adverb" },
  n4_0006: { fused: "なかなか", pos: "adverb" },
  n4_0008: { fused: "ちゃんと", pos: "adverb" },
  n4_0013: { fused: "すっかり", pos: "adverb" },
  n4_0018: { fused: "はっきり", pos: "adverb" },
  n4_0019: { fused: "どんどん", pos: "adverb" },
  n4_0020: { fused: "だんだん", pos: "adverb" },
  n4_0035: { fused: "すぐに", pos: "adverb" },
  n4_0036: { fused: "だいぶ", pos: "adverb" },
  n4_0060: { fused: "なんで", pos: "adverb" },
  n4_0061: { fused: "だから", pos: "conjunction" },
  n4_0124: { fused: "ちなみに", pos: "adverb" },
  n4_0134: { fused: "どういう", pos: "expression" },
  n4_0204: { fused: "できるだけ", pos: "adverb" },
  n4_0205: { fused: "なるべく", pos: "adverb" },
  n4_0216: { fused: "しっかり", pos: "adverb" },
  n4_0217: { fused: "ちょうど", pos: "adverb" },
  n4_0260: { fused: "まず", pos: "adverb" },
  n4_0285: { fused: "いつごろ", pos: "adverb" },
  n4_0287: { fused: "ところで", pos: "conjunction" },
  n4_0308: { fused: "どんなに", pos: "adverb" },
  n4_0309: { fused: "いくら", pos: "adverb" },
  n4_0310: { fused: "もし", pos: "adverb" },
  n4_0318: { fused: "まっすぐ", pos: "adverb" },
  n4_0582: { fused: "こうやって", pos: "expression" },
  n4_0021: { fused: "おつり", pos: "noun" },
  n4_0039: { fused: "うそ", pos: "noun" },
  n4_0104: { fused: "けんか", pos: "noun" },
  n4_0155: { fused: "おわび", pos: "noun" },
  n4_0178: { fused: "しわ", pos: "noun" },
  n4_0278: { fused: "ゆかた", pos: "noun" },
  n4_0311: { fused: "つまみ", pos: "noun" },
  n4_0080: { fused: "つく", pos: "verb-group1", verbGroup: 1 },
  n4_0170: { fused: "（嘘うそを）つく", pos: "verb-group1", verbGroup: 1 },
  n4_0570: { fused: "なくなる", pos: "verb-group1", verbGroup: 1 },
  n4_0571: { fused: "（～に/～と）ぶつかる", pos: "verb-group1", verbGroup: 1 },
  n4_0637: { fused: "さわぐ", pos: "verb-group1", verbGroup: 1 },
  n4_0660: { fused: "（～を）かむ", pos: "verb-group1", verbGroup: 1 },
  n4_0661: { fused: "（～を）なぐる", pos: "verb-group1", verbGroup: 1 },
  n4_0728: { fused: "（～を）しまう", pos: "verb-group1", verbGroup: 1 },
  n4_0759: { fused: "（～を）やる", pos: "verb-group1", verbGroup: 1 },
  // （汗を）かく -- the only kanji (汗) lives in the scaffolding note, so
  // the bare-core kanji-presence check that gates the pure-kana godan
  // pattern elsewhere doesn't fire for this one.
  n4_0449: { fused: "（汗あせを）かく", pos: "verb-group1", verbGroup: 1 },
}

// Validate every POS_OVERRIDES id against the row it currently maps to
// *before* running the main pass -- fail loudly if the source shifted.
{
  let staleFailures = 0
  for (const [id, entry] of Object.entries(POS_OVERRIDES)) {
    const idx = Number(id.slice(3)) - 1
    const row = rows[idx]
    if (!row || row.fused !== entry.fused) {
      console.error(`STALE POS_OVERRIDES[${id}]: expected ${JSON.stringify(entry.fused)}, row is ${JSON.stringify(row?.fused)}`)
      staleFailures++
    }
  }
  if (staleFailures > 0) {
    console.error(`\n${staleFailures} stale POS override(s) -- source data shifted under an id. Aborting.`)
    process.exit(1)
  }
}

const draft = []
const flaggedIds = []

let n = 0
for (const row of rows) {
  n++
  const id = `n4_${String(n).padStart(4, "0")}`
  const { kanji: rawKanji, kana: rawKana, flags } = splitFused(row.fused, onKunByChar)
  // No legitimate word in this app's data has a literal space in kanji/kana
  // (checked against n5/vocabulary.json) -- any space that survives here is
  // source noise (a stray typo, or an example fragment glued onto the word
  // cell), so it's always safe to strip rather than preserve.
  const kanji = rawKanji.replace(/\s+/g, "")
  const kana = rawKana.replace(/\s+/g, "")
  const extraFlags = []
  if (row.fused.includes(" ") || row.fused.includes("\n")) extraFlags.push("embedded whitespace (stripped; verify nothing was glued together)")
  if (row.fused === "（する）" || row.fused === "（（する）") extraFlags.push("word text missing, only scaffolding present")

  let { pos, verbGroup } = inferPos(row.fused, kanji, row.sectionNum)
  if (POS_OVERRIDES[id]) {
    pos = POS_OVERRIDES[id].pos
    verbGroup = POS_OVERRIDES[id].verbGroup ?? null
  }
  const entry = {
    id,
    sectionNum: row.sectionNum,
    sectionTitle: row.sectionTitle,
    stt: row.stt,
    fused: row.fused,
    kanji,
    kana,
    meaning: row.meaning,
    pos,
    verbGroup,
    adjType: pos === "adj-i" ? "i" : pos === "adj-na" ? "na" : null,
  }
  const allFlags = [...flags, ...extraFlags]
  if (allFlags.length) {
    entry.flags = allFlags
    flaggedIds.push(id)
  }
  draft.push(entry)
}

fs.writeFileSync(path.join(__dirname, "n4-draft.json"), JSON.stringify(draft, null, 2) + "\n", "utf8")
console.log(`Draft: ${draft.length} entries, ${flaggedIds.length} flagged (${(100 * flaggedIds.length / draft.length).toFixed(1)}%).`)
