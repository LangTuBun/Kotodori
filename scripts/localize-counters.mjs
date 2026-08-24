// One-time schema migration + translation for src/data/n5/counters.json --
// converts every VI-only display field to { vi, en }, same pattern as the
// grammar-categories.json migration. Structural fields (number/kanji/kana/
// romaji/isQuestion/isException/wide/columns/counter/counterKana) are left
// untouched -- they're language-neutral or already handled by Furigana/jp
// styling in Counters.tsx.
//
// Idempotent: bails out (throws) if a field is already an object rather
// than a string, so re-running after a partial hand-edit won't silently
// double-wrap anything.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, "../src/data/n5/counters.json")
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"))

function bi(vi, en) {
  if (typeof vi !== "string") throw new Error(`expected a string, got ${JSON.stringify(vi)} -- already migrated?`)
  return { vi, en }
}

// Per-category English unit words, keyed by category id -- mirrors the
// generic Vietnamese classifier ("cái"/"con"/"chiếc"/"cuốn"/"người") each
// category's rows use, since English has no equivalent classifier system.
const UNIT_EN = {
  "people": { one: "person", many: "people", q: "How many people?" },
  "generic-small": { one: "item", many: "items", q: "How many items?" },
  "small-animals": { one: "animal", many: "animals", q: "How many animals?" },
  "flat-thin": { one: "sheet", many: "sheets", q: "How many sheets?" },
  "long-cylindrical": { one: "item", many: "items", q: "How many items?" },
  "machines-vehicles": { one: "unit", many: "units", q: "How many units?" },
  "books": { one: "copy", many: "copies", q: "How many copies?" },
  "money": { q: "How much money?" },
  "calendar-days": { q: "Which day?" },
  "calendar-months": { q: "Which month?" },
  "hours": { q: "What time?" },
  "minutes": { q: "How many minutes?" },
  "age": { q: "How old?" },
}

const NOTE_EN = {
  "ひゃく→びゃく": "ひゃく→びゃく",
  "ひゃく→ぴゃく (âm ngắt)": "ひゃく→ぴゃく (gemination)",
  "せん→ぜん": "せん→ぜん",
  "せん→っせん (âm ngắt)": "せん→っせん (gemination)",
  "1 vạn": "1 man (万)",
  "10 vạn": "10 man (万)",
  "100 vạn": "100 man (万)",
  "không phải じゅうよんにち": "not じゅうよんにち",
  "không phải にじゅうにち": "not にじゅうにち",
  "không phải にじゅうよんにち": "not にじゅうよんにち",
  "không phải よんがつ": "not よんがつ",
  "không phải なながつ": "not なながつ",
  "không phải きゅうがつ": "not きゅうがつ",
  "không phải よんじ": "not よんじ",
  "không phải ななじ": "not ななじ",
  "không phải きゅうじ": "not きゅうじ",
  "cách đọc đặc biệt, không phải にじゅっさい": "special reading, not にじゅっさい",
}

const CATEGORY_EN = {
  "basic-numbers": {
    title: "1. Basic numbers and large-number counting",
    shortTitle: "Basic numbers",
    usage: "The foundation for combining with every other counter. Japanese groups large numbers by 万 (10,000s) rather than by thousands the way English does.",
    footnote: "The red cells (300/600/800 and 3,000/8,000) have a special sound shift on the leading consonant of 百/千 -- they don't attach directly the way the other numbers do.",
  },
  "people": {
    title: "2. Counting people (人 - にん)",
    shortTitle: "Counting people",
  },
  "generic-small": {
    title: "3. Counting small, generic objects (つ)",
    shortTitle: "Generic objects",
    usage: "Used for objects with no specific counter, or an unclear/irregular shape.",
    footnote: 'From 11 onward, just use the plain number without adding "つ".',
  },
  "small-animals": {
    title: "4. Counting small animals (匹 - ひき)",
    shortTitle: "Small animals",
    usage: "Used for dogs, cats, fish, insects, etc.",
  },
  "flat-thin": {
    title: "5a. Counting flat, thin objects (枚 - まい)",
    shortTitle: "Flat, thin objects",
    usage: "Used for: paper, shirts, CDs, tickets, etc.",
    footnote: "Just add the basic number + まい.",
  },
  "long-cylindrical": {
    title: "5b. Counting long, cylindrical objects (本 - ほん)",
    shortTitle: "Long, cylindrical objects",
    usage: "Used for: pens, bottles, umbrellas, trees, etc. (note: has sound shifts)",
  },
  "machines-vehicles": {
    title: "5c. Counting machines and vehicles (台 - だい)",
    shortTitle: "Machines, vehicles",
    usage: "Used for: TVs, computers, cars, bicycles, etc.",
    footnote: "Just add the basic number + だい.",
  },
  "books": {
    title: "5d. Counting books (冊 - さつ)",
    shortTitle: "Books",
    usage: "Used for: books, notebooks, magazines, dictionaries, etc. (note: has sound shifts)",
  },
  "money": {
    title: "6. Counting money (円 - えん)",
    shortTitle: "Counting money",
    usage: "Simple rule: number + えん.",
    footnote: 'For prices, instead of asking with "何" (what), Japanese uses "いくら" -- how much.',
  },
  "calendar-days": {
    title: "7. Days of the month (日 - にち)",
    shortTitle: "Days of the month",
    usage: "The 1st through the 10th each have their own irregular reading that must be memorized. From the 11th onward it follows the Sino-Japanese number + にち rule, EXCEPT for 14, 20, and 24.",
    footnote: "The general rule from the 11th onward (except 14/20/24): Sino-Japanese reading (音読み) + にち. Example: 15 = じゅうご + にち = じゅうごにち.",
  },
  "calendar-months": {
    title: "8. Months of the year (月 - がつ)",
    shortTitle: "Months of the year",
    usage: "Most months combine the Sino-Japanese number + がつ, but 4, 7, and 9 do NOT follow the usual rule.",
  },
  "hours": {
    title: "9. Hours (時 - じ)",
    shortTitle: "Hours",
    usage: "Sino-Japanese number + じ, but 4, 7, and 9 do NOT follow the usual rule.",
  },
  "minutes": {
    title: "10. Minutes (分 - ふん / ぷん)",
    shortTitle: "Minutes",
    usage: "分 is read ぷん after 1, 3, 4, 6, 8, 10 (a gemination/aspirated shift); every other number reads it as the plain ふん.",
    footnote: "Memory aid: 1・3・4・6・8・10 minutes → ぷん (crisp); everything else → ふん (plain).",
  },
  "age": {
    title: "11. Age (歳 - さい)",
    shortTitle: "Age",
    usage: "Number + さい, with gemination at 1/8/10. 20 years old has its own completely irregular reading: はたち.",
  },
}

// Top-level
data.title = bi(data.title, "A complete guide to counting in Japanese")
data.intro = bi(
  data.intro,
  "Numbers, people, objects, animals, money, dates, time, and age -- a full rundown of Japanese counters (助数詞) and the sound-shift/irregular readings most commonly seen at N5 level."
)

for (const cat of data.categories) {
  const en = CATEGORY_EN[cat.id]
  if (!en) throw new Error(`no English translation table entry for category "${cat.id}"`)
  cat.title = bi(cat.title, en.title)
  cat.shortTitle = bi(cat.shortTitle, en.shortTitle)
  if (cat.usage !== undefined) cat.usage = bi(cat.usage, en.usage)
  if (cat.footnote !== undefined) cat.footnote = bi(cat.footnote, en.footnote)

  const unit = UNIT_EN[cat.id]
  for (const row of cat.rows) {
    if (row.meaning !== undefined) {
      if (row.isQuestion) {
        row.meaning = bi(row.meaning, unit.q)
      } else {
        const n = row.number
        const en1 = n === "1" ? `1 ${unit.one}` : `${n} ${unit.many}`
        row.meaning = bi(row.meaning, en1)
      }
    }
    if (row.note !== undefined) {
      const translated = NOTE_EN[row.note]
      if (translated === undefined) throw new Error(`no English translation for note "${row.note}" (category ${cat.id}, number ${row.number})`)
      row.note = bi(row.note, translated)
    }
  }
}

const BIG_NUM_EN = {
  "15.000 (1 vạn 5 ngàn)": "15,000 (1 man 5 thousand)",
  "150.000 (15 vạn)": "150,000 (15 man)",
  "1.250.000 (125 vạn)": "1,250,000 (125 man)",
}
for (const ex of data.bigNumberExamples) {
  const translated = BIG_NUM_EN[ex.meaning]
  if (translated === undefined) throw new Error(`no English translation for bigNumberExamples meaning "${ex.meaning}"`)
  ex.meaning = bi(ex.meaning, translated)
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n")
console.log("counters.json localized successfully.")
