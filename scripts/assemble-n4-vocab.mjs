// Final assembly pass: applies hand-resolved overrides to the rows the
// splitter/POS classifier couldn't get right automatically (irregular/
// contracted readings no on-kun lookup can derive, a few source-corrupted
// cells, alternate-spelling reading duplication the general algorithm can't
// disambiguate), drops rows with no recoverable content, then shapes every
// surviving entry into the app's VocabEntry format and writes
// src/data/n4/vocabulary.json.
//
// Each override below is annotated with *why* -- same discipline as the N5
// corruption-fix scripts (fix-corrupted-suru-kanji.mjs etc.): every hand
// edit should be traceable back to a specific, checkable reason, not a bare
// guess.
//
// ID-stability guard: every DROP_IDS/OVERRIDES entry is keyed by id *and*
// carries the exact `fused` string it was written against. IDs are assigned
// by row position in n4-raw-rows.json (n4_0001, n4_0002, ...) -- if the
// source markdown ever gains/loses/reorders a row, every id downstream
// shifts and an override could silently land on a completely different
// word. `n4_XXXX` is also the persisted SRS card key (kotodori-vocab
// localStorage), so a silent renumber wouldn't just mis-tag data, it'd
// orphan every review history entry for the shifted words. Same discipline
// as rebuild-dungmori-block.mjs's "STALE ids not found (aborting)".
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const draft = JSON.parse(fs.readFileSync(path.join(__dirname, "n4-draft.json"), "utf8"))
const n5Vocab = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "src", "data", "n5", "vocabulary.json"), "utf8"))
const outPath = path.join(__dirname, "..", "src", "data", "n4", "vocabulary.json")

// Rows with no recoverable headword (source literally lost the kanji,
// leaving only the "（する）" scaffolding) -- can't be reconstructed with
// confidence from the Vietnamese gloss alone, so they're dropped rather
// than guessed. Also drops one exact duplicate (「（～を）知らせる」"cho
// biết, thông báo" appears twice verbatim, rows #134 and #187 of section 9).
const DROP_IDS = {
  n4_0587: { fused: "（する）", reason: "giới thiệu ～ -- headword missing from source" },
  n4_0673: { fused: "（する）", reason: "hỏi, đặt câu hỏi -- headword missing" },
  n4_0726: { fused: "（する）", reason: "phát biểu -- headword missing" },
  n4_0735: { fused: "（（する）", reason: "nhập học -- headword missing" },
  n4_0750: { fused: "（（する）", reason: "đàm phán, thương lượng -- headword missing" },
  n4_0748: { fused: "（～を）知しらせる", reason: "exact duplicate of n4_0695, same meaning" },
}

// id -> { fused: <exact source string this was written against>, ...overrides }
const OVERRIDES = {
  // Stray internal space in source; auto-derived kana was already correct,
  // only the kanji field needed the reading-remnant trimmed.
  n4_0015: { fused: "～以下 いか", kanji: "～以下" },
  n4_0016: { fused: "～以い上 じょう", kanji: "～以上" },
  // Row mixed the headword with an embedded example fragment
  // ("こちらの方かた") in the same cell -- kept just the headword.
  n4_0143: { fused: "～方かた こちらの方かた", kanji: "～方", kana: "かた", meaning: "ngài, vị, vị này, vị đó (kính ngữ của 人)" },
  // 二日 read ふつか is a jukujikun (irregular, whole-word) reading --
  // no on/kun lookup for 二 or 日 individually derives ふつ.
  n4_0182: { fused: "二ふつ日か酔よい", kanji: "二日酔い", kana: "ふつかよい" },
  // 中 read じゅう (as in 世界中, 一日中) is a special compound-only
  // reading not in kanjiapi's standard on_readings list for 中.
  n4_0239: { fused: "世せ界かい中じゅう", kanji: "世界中", kana: "せかいじゅう" },
  // Nested double-parens simplified to two adjacent single-level notes;
  // same content, cleaner to read.
  n4_0254: { fused: "（（人ひと）を（場ば所しょ）に/まで） 迎むかえに来くる", kanji: "（人を）（場所に/まで）迎えに来る", kana: "むかえにくる" },
  // Source gave zero furigana for this row at all (only row #284's
  // parenthetical note reveals the reading てん) -- filled by hand.
  n4_0306: { fused: "点/～点", kanji: "点", kana: "てん" },
  // 葉 alone (kun は) + gemination for the colloquial doubled form 葉っぱ;
  // the general gemination-tolerant matcher (built for compound-boundary
  // cases like 学校) incorrectly consumed the っ here as if it were part
  // of the reading annotation rather than real written okurigana.
  n4_0316: { fused: "葉/葉っぱ", kanji: "葉/葉っぱ", kana: "はっぱ" },
  // Isolated leftover row (basic N5-level word, meaning given as a bare
  // Han-Viet label "NHẤT" rather than a natural Vietnamese gloss) --
  // translated properly rather than dropped.
  n4_0333: { fused: "一", kanji: "一", kana: "いち", meaning: "một" },
  // Fused string used a different, non-furigana encoding for this one row
  // (kanji-form + full reading concatenated, not per-character ruby) --
  // reconstructed directly from the meaning + real dictionary form.
  n4_0334: { fused: "食べるたべる", kanji: "食べる", kana: "たべる" },
  n4_0335: { fused: "行くだりく", kanji: "行く", kana: "いく" },
  // 日本 read にほん: に alone is not a listed on/kun reading of 日 in
  // isolation (documented blind spot -- see onkun-classifier.mjs's own
  // header comment, which names this exact word).
  n4_0369: { fused: "日に本ほん食しょく", kanji: "日本食", kana: "にほんしょく" },
  // 相撲 (すもう) is a whole-word irregular reading.
  n4_0450: { fused: "相す撲もう", kanji: "相撲", kana: "すもう" },
  // Alternate-spelling suppression (correctly) stopped kana at the first
  // spelling's reading (おい), but 甥っ子 the fuller/more common casual
  // form actually reads differently (おいっこ) -- not just the same
  // reading spelled two ways, so it needs its own kana.
  n4_0515: { fused: "甥おい/甥おいっ子", kanji: "甥/甥っ子", kana: "おいっこ" },
  n4_0516: { fused: "姪めい/姪めいっ子", kanji: "姪/姪っ子", kana: "めいっこ" },
  // 息子 (むすこ) is a whole-word irregular reading.
  n4_0521: { fused: "息子むすこ", kanji: "息子", kana: "むすこ" },
  // 火傷 (やけど) is a whole-word irregular reading.
  n4_0643: { fused: "火傷やけど（する）", kanji: "火傷（する）", kana: "やけど" },
  // Source typo: じゅん should be じゅう (充電 charges/charging is
  // じゅうでん; じゅんでん isn't a word). 充's on reading is ジュウ.
  n4_0713: { fused: "（～を）充じゅん電でん（する）", kanji: "（～を）充電（する）", kana: "じゅうでん" },
  // 真面目 (まじめ) is a jukujikun compound -- 面's contribution to the
  // reading (じ) isn't one of 面's real on/kun readings, so the matcher
  // partially matched (真=ま) then got stuck, leaving "じめ" as a stray
  // literal suffix instead of being recognized as part of the same
  // irregular reading and dropped. Found via cross-validation against
  // onkun-classifier's independent full-word matcher, not the splitter's
  // own flags (which only fire on *zero*-length matches, not partial ones
  // -- this word slipped through that gap).
  n4_0554: { fused: "真面目まじめ", kanji: "真面目", kana: "まじめ" },
  // The remaining 5 overrides below were all found by a *precise* detector
  // (scripts/detect-bare-over-dotted.mjs), not guessed: it instruments the
  // splitter to log every decision where a bare (dot-less) kanjiapi kun
  // reading outscored a *dotted* one for the same character (the dot marks
  // exactly where okurigana starts, so losing to a bare/nanori-style
  // reading is the specific failure mode that produced 生うまれる -> "生る"
  // instead of "生まれる"). That scan flagged 14 decision points across all
  // 765 rows; 9 were already correct as shipped (single-kanji/no-okurigana
  // words like 咳/次/彼/最悪/交換/勝手に/支度 where the bare reading was
  // actually right) and are NOT overridden. Only these 5 were genuinely
  // wrong. (A first attempt at a *general* fix -- always prefer dotted over
  // bare -- was tried and measured against every row; it was a net
  // regression, 4 fixes vs 8 new breaks including this exact 生 case coming
  // out differently-wrong. Reverted; see split-n4-fused.mjs's bestMatch.)
  n4_0045: { fused: "生うまれる", kanji: "生まれる", kana: "うまれる" },
  n4_0148: { fused: "折おり紙がみ", kanji: "折り紙", kana: "おりがみ" },
  n4_0293: { fused: "話はなし合あう", kanji: "話し合う", kana: "はなしあう" },
  n4_0574: { fused: "（～に）勝かつ", kanji: "（～に）勝つ", kana: "かつ" },
  n4_0738: { fused: "お見み舞まい", kanji: "お見舞い", kana: "おみまい" },
}

const KANJI_RE = /[一-鿿々]/
const n5Keys = new Set(n5Vocab.map(v => `${v.kanji}|${v.kana}`))
const draftById = new Map(draft.map(d => [d.id, d]))

// Fail loudly rather than silently mis-patching if the source shifted.
let staleFailures = 0
for (const [id, entry] of Object.entries({ ...DROP_IDS, ...OVERRIDES })) {
  const d = draftById.get(id)
  if (!d) { console.error(`STALE: ${id} not found in current draft (was: "${entry.fused}")`); staleFailures++; continue }
  if (d.fused !== entry.fused) {
    console.error(`STALE: ${id} fused text changed. Expected ${JSON.stringify(entry.fused)}, got ${JSON.stringify(d.fused)}`)
    staleFailures++
  }
}
if (staleFailures > 0) {
  console.error(`\n${staleFailures} stale override(s) -- source data shifted under an id. Aborting rather than mis-applying overrides to the wrong words.`)
  process.exit(1)
}

const out = []
let dropped = 0
let overridden = 0
const crossDupes = []

for (const d of draft) {
  if (DROP_IDS[d.id]) { dropped++; continue }
  const o = OVERRIDES[d.id]
  const kanji = o?.kanji ?? d.kanji
  const kana = o?.kana ?? d.kana
  const meaningVi = o?.meaning ?? d.meaning
  if (o) overridden++

  if (n5Keys.has(`${kanji}|${kana}`)) crossDupes.push({ id: d.id, kanji, kana })

  out.push({
    id: d.id,
    kanji,
    kana,
    meanings: { vi: meaningVi, en: "" },
    pos: d.pos,
    verbGroup: d.verbGroup,
    adjType: d.adjType,
    jlptLevel: "N4",
    category: d.sectionTitle,
    tags: [],
    homophones: [],
    relatedWords: [],
    examples: [],
  })
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8")

console.log(`${draft.length} draft rows -> ${out.length} final entries (${dropped} dropped, ${overridden} hand-overridden).`)
console.log(`Cross-level duplicates with N5 (same kanji+kana, kept -- different level decks): ${crossDupes.length}`)
if (crossDupes.length) for (const c of crossDupes) console.log(`  ${c.id}: ${c.kanji} (${c.kana})`)

// Sanity: no kanji chars leaking into kana, no empty kanji, no whitespace.
let problems = 0
for (const e of out) {
  if (KANJI_RE.test(e.kana)) { console.error(`BAD: kanji char in kana -- ${e.id} ${e.kanji}/${e.kana}`); problems++ }
  if (!e.kanji) { console.error(`BAD: empty kanji -- ${e.id}`); problems++ }
  if (/\s/.test(e.kanji) || /\s/.test(e.kana)) { console.error(`BAD: whitespace -- ${e.id} ${e.kanji}/${e.kana}`); problems++ }
}
console.log(problems === 0 ? "Sanity checks passed." : `${problems} SANITY PROBLEMS -- fix before shipping.`)
