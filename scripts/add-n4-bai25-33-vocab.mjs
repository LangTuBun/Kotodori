// Second pass for chapters 24-33, after apply-n4-chapters-25-33.mjs:
//
// 1. Retags 16 existing vocabulary.json entries that data/vocab_n4_25_33.md
//    clearly refers to but the kana/kanji matcher couldn't resolve on its
//    own -- mostly because the entry's `kana` field holds only the bare verb
//    reading (e.g. n4_0740 kana "だす") while the doc's cell bundles a
//    bracketed usage note into the headword text the matcher compares
//    against (e.g. "年を取る" with no brackets at all, vs the entry's
//    bracket-wrapped "（年を）取る"). Confirmed by hand against
//    data/vocab_n4_25_33.md, one at a time (see inline comments).
// 2. Adds 15 genuinely new entries (n4_0777-0791) for words with no existing
//    vocabulary.json entry at all, verified absent by kana/kanji search
//    first (not just an unmatched-by-the-script false negative).
//
// One-shot, not re-runnable idempotently -- guarded by an id-range check.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const vocabPath = path.join(__dirname, "..", "src/data/n4/vocabulary.json")
const vocab = JSON.parse(fs.readFileSync(vocabPath, "utf8"))

if (vocab.some(e => e.id === "n4_0777")) {
  throw new Error("n4_0777 already exists -- this script has already been run, aborting to avoid duplicates.")
}

const byId = new Map(vocab.map(e => [e.id, e]))

// --- 1. Retag existing entries ---------------------------------------
const RETAG = {
  n4_0202: 25, // （年を）取る "già đi" == "年を取る (としをとる)" bài 25 STT10
  n4_0444: 27, // できる "đã xong, đã chín" == bài 27 STT49
  n4_0272: 29, // （丸を）つける "khoanh tròn" == "(丸を) つける" bài 29 STT24
  n4_0295: 30, // （宝くじに/が）当たる "trúng xổ số" == bài 30 STT35
  n4_0307: 31, // （点/～点）を取る "được ~ điểm" == "(点/〜点を) 取る" bài 31 STT20
  n4_0740: 31, // （熱を）出す "bị sốt" == "(熱を) 出す" bài 31 STT12
  n4_0493: 32, // ～つ目 "thứ (tự) ~" == "〜目 (〜め)" bài 32 STT25 (same ordinal-suffix concept)
  n4_0754: 32, // （〜に）満足（する） == bài 32 STT37
  n4_0755: 32, // （〜を）計画（する） == bài 32 STT38
  n4_0756: 32, // （〜を）希望（する） == bài 32 STT39
  n4_0757: 32, // （〜を）想像（する） == bài 32 STT40
  n4_0758: 32, // （〜を）予想（する） == bài 32 STT41
  n4_0329: 33, // （お）刺身 == bài 33 STT9
  n4_0387: 33, // （お）刺身定食 == bài 33 STT10
  n4_0354: 33, // ございます（ござる） == bài 33 STT23
  n4_0353: 33, // （〜を）いたします（いたす） == bài 33 STT24
}

let retagged = 0
for (const [id, chapter] of Object.entries(RETAG)) {
  const entry = byId.get(id)
  if (!entry) throw new Error(`Retag target ${id} not found`)
  if (entry.chapter !== undefined) throw new Error(`Retag target ${id} already has chapter ${entry.chapter}`)
  entry.chapter = chapter
  retagged++
}

// --- 2. New entries ----------------------------------------------------
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
  entry("n4_0777", "不足", "ふそく", "thiếu, không đủ", "shortage, insufficiency", "noun", null, null, "Khác", 24),
  entry("n4_0778", "睡眠不足", "すいみんぶそく", "thiếu ngủ", "lack of sleep, sleep deprivation", "noun", null, null, "Khác", 24),
  entry("n4_0779", "運動不足", "うんどうぶそく", "thiếu vận động", "lack of exercise", "noun", null, null, "Khác", 24),
  entry("n4_0780", "電気代", "でんきだい", "tiền điện", "electricity bill", "noun", null, null, "Khác", 25),
  entry("n4_0781", "水道代", "すいどうだい", "tiền nước", "water bill", "noun", null, null, "Khác", 25),
  entry("n4_0782", "元の所", "もとのところ", "chỗ cũ", "the original place, where it was before", "noun", null, null, "Khác", 27),
  entry("n4_0783", "（〜に）掛ける", "かける", "ngồi", "to sit down (on something)", "verb-group2", 2, null, "Động từ", 29),
  entry("n4_0784", "（〜を）発表（する）", "はっぴょう", "phát biểu", "to present, announce, give a presentation", "verb-group3", 3, null, "Động từ", 29),
  entry("n4_0785", "（〜に）入学（する）", "にゅうがく", "nhập học", "to enroll, enter school", "verb-group3", 3, null, "Động từ", 30),
  entry("n4_0786", "別 / 別の日", "べつ / べつのひ", "khác / ngày khác", "different / another day", "noun", null, null, "Khác", 31),
  entry("n4_0787", "都合がいい", "つごうがいい", "rảnh, tiện", "convenient, to be free", "expression", null, null, "Khác", 31),
  entry("n4_0788", "都合が悪い", "つごうがわるい", "bận", "inconvenient, to be busy/unavailable", "expression", null, null, "Khác", 31),
  entry("n4_0789", "（〜を）交渉（する）", "こうしょう", "đàm phán, thương lượng", "to negotiate", "verb-group3", 3, null, "Động từ", 32),
  entry("n4_0790", "110番", "ひゃくとおばん", "110 (số điện thoại cảnh sát bên Nhật)", "110 (Japan's police emergency number)", "noun", null, null, "Khác", 32),
  entry("n4_0791", "119番", "ひゃくじゅうきゅうばん", "119 (số điện thoại cứu hỏa bên Nhật)", "119 (Japan's fire/ambulance emergency number)", "noun", null, null, "Khác", 32),
]

vocab.push(...NEW_ENTRIES)
fs.writeFileSync(vocabPath, JSON.stringify(vocab, null, 2) + "\n")
console.log(`Retagged ${retagged} existing entries.`)
console.log(`Added ${NEW_ENTRIES.length} new entries (n4_0777-n4_0791). New total: ${vocab.length}`)
