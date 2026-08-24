// Adds the 11 words from TuVung_va_Hyougen_N4_Bai15_24.md that
// apply-n4-chapters.mjs couldn't match to any existing n4/vocabulary.json
// entry -- genuine gaps, not near-duplicates (those 9 rows were judged
// redundant with an existing entry and intentionally left out; see
// handoff.md's Known Gaps for the full unmatched-rows breakdown).
//
// Two of these (紹介（する）, 質問（する）) trace back to rows in the
// *original* TuVung_N4_DungMori.md that were silently dropped by the
// original build pipeline (stored there as a bare "（する）" with the
// headword missing) rather than mis-parsed -- there was never a
// vocabulary.json entry for them until now.
//
// One-shot, not re-runnable idempotently (would duplicate on a second run)
// -- guarded by an id-range check so re-running is at least a loud no-op
// rather than silent duplication.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const vocabPath = path.join(__dirname, "..", "src/data/n4/vocabulary.json")
const vocab = JSON.parse(fs.readFileSync(vocabPath, "utf8"))

if (vocab.some(e => e.id === "n4_0766")) {
  throw new Error("n4_0766 already exists -- this script has already been run, aborting to avoid duplicates.")
}

function entry(id, kanji, kana, vi, en, pos, verbGroup, adjType, category, chapter) {
  return {
    id, kanji, kana,
    meanings: { vi, en },
    pos, verbGroup, adjType,
    jlptLevel: "N4",
    category,
    chapter,
    tags: [], homophones: [], relatedWords: [], examples: [],
  }
}

const NEW_ENTRIES = [
  entry("n4_0766", "速い", "はやい", "nhanh", "fast, quick", "adj-i", null, "i", "Tính từ đuôi -i", 16),
  entry("n4_0767", "早い", "はやい", "sớm, chóng (khoẻ)", "early; quick (to recover)", "adj-i", null, "i", "Tính từ đuôi -i", 17),
  entry("n4_0768", "（～を）（人に）紹介（する）", "しょうかい", "giới thiệu ～ (với ai đó)", "to introduce (someone to someone)", "verb-group3", 3, null, "Động từ", 17),
  entry("n4_0769", "動く", "うごく", "di chuyển, chuyển động", "to move", "verb-group1", 1, null, "Động từ", 19),
  entry("n4_0770", "建つ", "たつ", "được xây dựng", "to be built", "verb-group1", 1, null, "Động từ", 19),
  entry("n4_0771", "かかる", "かかる", "được treo", "to be hung, to hang", "verb-group1", 1, null, "Động từ", 19),
  entry("n4_0772", "だって", "だって", "bởi vì...", "because, but", "conjunction", null, null, "Khác", 19),
  entry("n4_0773", "僕", "ぼく", "tôi, tớ (đại từ nhân xưng của nam giới)", "I, me (used by males)", "noun", null, null, "Danh từ - Con người, Gia đình, Xã hội", 19),
  entry("n4_0774", "（人に）（～を）感謝（する）", "かんしゃ", "cảm ơn, biết ơn (ai) về (điều gì đó)", "to thank, to be grateful (to someone for something)", "verb-group3", 3, null, "Động từ", 22),
  entry("n4_0775", "（人に）（～を）質問（する）", "しつもん", "hỏi, đặt câu hỏi", "to ask a question", "verb-group3", 3, null, "Động từ", 24),
  entry("n4_0776", "目が悪い", "めがわるい", "thị lực kém", "to have poor eyesight", "expression", null, null, "Khác", 24),
]

vocab.push(...NEW_ENTRIES)
fs.writeFileSync(vocabPath, JSON.stringify(vocab, null, 2) + "\n")
console.log(`Added ${NEW_ENTRIES.length} entries (n4_0766-n4_0776). New total: ${vocab.length}`)
