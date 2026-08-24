// One-time schema migration + translation for src/data/n5/verb-forms.json.
//
// Unlike counters.json, most display fields here are rendered through the
// <Ruby text={x} html={xRuby}/> component, which -- when `html` is present --
// renders it via dangerouslySetInnerHTML and ignores `text` entirely (see
// src/components/ui/Ruby.tsx). That means translating only the plain field
// (rule/note/etc.) would have ZERO visible effect wherever a *Ruby sibling
// field is set, since the Ruby field is what actually renders. So every
// field that has a *Ruby counterpart gets its counterpart converted too,
// with the same Vietnamese-substring-within-otherwise-Japanese-markup
// translated and the embedded <ruby>...</ruby> tags (which mark up
// language-neutral Japanese conjugation examples) left byte-identical.
//
// Idempotent: throws if a target field is already an object.
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, "../src/data/n5/verb-forms.json")
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"))

function bi(vi, en) {
  if (typeof vi !== "string") throw new Error(`expected string, got ${JSON.stringify(vi)}`)
  if (en === undefined) throw new Error(`no EN translation supplied for "${vi}"`)
  return { vi, en }
}

// ---------- groups ----------
const GROUP_NAME_EN = {
  "Nhóm 1 (Godan)": "Group 1 (Godan)",
  "Nhóm 2 (Ichidan)": "Group 2 (Ichidan)",
  "Nhóm 3 (Bất quy tắc)": "Group 3 (Irregular)",
}
const GROUP_NOTE_EN = {
  "Kết thúc bằng ～います (mọi động từ ます không thuộc nhóm 2/3, kể cả một số động từ đuôi ～えます, ～びます hiếm gặp)":
    "Ends in ～います (every ます verb not in group 2/3, including a handful of rarer ～えます/～びます verbs)",
  "Đa số kết thúc bằng ～えます, một số kết thúc bằng ～います":
    "Mostly ends in ～えます, with some ～います verbs too",
  "Chỉ gồm します/来ます và các động từ ghép N+します":
    "Just します/来ます and N+します compound verbs",
}
const SAMPLE_VI_EN = {
  "Đi": "Go", "Về": "Return", "Đọc": "Read", "Viết": "Write", "Mua": "Buy",
  "Nói": "Speak", "Cầm": "Hold", "Uống": "Drink", "Ăn": "Eat", "Ngủ": "Sleep",
  "Thức dậy": "Wake up", "Xem": "Watch", "Tắm": "Bathe", "Làm": "Do",
  "Đến": "Come", "Học": "Study", "Mua sắm": "Shop", "Du lịch": "Travel",
}
for (const g of data.groups) {
  g.name = bi(g.name, GROUP_NAME_EN[g.name])
  g.note = bi(g.note, GROUP_NOTE_EN[g.note])
  for (const s of g.sample) {
    s.meaning = bi(s.vi, SAMPLE_VI_EN[s.vi])
    delete s.vi
  }
}

// ---------- forms ----------
const FORM_TITLE_EN = {
  "Thể từ điển": "Dictionary form",
  "Thể phủ định": "Negative form",
  "Thể quá khứ": "Past form",
  "Thể て": "Te form",
  "Thể khả năng": "Potential form",
  "Thể khả năng quá khứ": "Past potential form",
  "Thể ý chí": "Volitional form",
  "Thể điều kiện": "Conditional form",
}
const FORM_MEANING_EN = {
  "Dạng gốc dùng trong từ điển, nói chuyện với bạn bè/người thân, và đứng trước rất nhiều mẫu ngữ pháp (きる, ことができる, まえに...).":
    "The base form used in dictionaries, casual speech with friends/family, and in front of many grammar patterns (きる, ことができる, まえに...).",
  "Không...": "Don't / doesn't...",
  "Đã...": "Did...",
  "Và... / Hãy.../ Đang.../ Xin phép... / Liên kết nhiều hành động":
    "And... / Please.../ -ing.../ May I.../ Linking multiple actions",
  "Có thể làm...": "Can do...",
  "Đã có thể / đã không thể làm...": "Was / wasn't able to do...",
  "Hãy... / Cùng... / Tôi sẽ...": "Let's... / Shall we... / I will...",
  "Nếu...": "If...",
}

// Rule/note plain-text -> English, reused across every form (most repeat verbatim).
const RULE_EN = {
  "います → う": "います → う",
  "ます → る": "ます → る",
  "bất quy tắc": "irregular",
  "います → あない": "います → あない",
  "ます → ない": "ます → ない",
  "quy tắc theo đuôi âm — xem bảng bên dưới": "sound-ending rule — see the table below",
  "ます → た": "ます → た",
  "ます → て": "ます → て",
  "います → えます": "います → えます",
  "ます → られます": "ます → られます",
  "V(khả năng)ます → V(khả năng)た形／なかった": "V(potential)ます → V(potential)た form／なかった",
  "います → おう": "います → おう",
  "ます → よう": "ます → よう",
  "います → えば": "います → えば",
  "ます → れば": "ます → れば",
  "ない → なければ": "ない → なければ",
}
// The one rule whose ruleRuby actually differs from rule (real <ruby> markup
// around 形) -- everywhere else ruleRuby === rule verbatim, confirmed against
// the source data before writing this script.
const RULE_RUBY_EN_OVERRIDE = {
  "V(khả năng)ます → V(khả năng)た形／なかった":
    "V(potential)ます → V(potential)た<ruby>形<rp>(</rp><rt>かたち</rt><rp>)</rp></ruby>／なかった",
}
const NOTE_EN = {
  "": "",
  "します→する、来ます→来る": "します→する、来ます→来る",
  "riêng động từ đuôi ～います → ～わない (không phải ～あない)": "except for verbs ending in ～います → ～わない (not ～あない)",
  "します→しない、来ます→来ない": "します→しない、来ます→来ない",
  "giống hệt quy tắc thể て nhưng đổi て/で → た/だ": "identical to the て-form rule, just swap て/で → た/だ",
  "します→した、来ます→来た": "します→した、来ます→来た",
  "します→して、来ます→来て": "します→して、来ます→来て",
  "します→できます、来ます→来られます": "します→できます、来ます→来られます",
  "chia thể khả năng thành nhóm 2 rồi áp quy tắc た/ない như bình thường": "conjugate the potential form as a group-2 verb, then apply the normal た/ない rule",
  "します→しよう、来ます→来よう": "します→しよう、来ます→来よう",
  "します→すれば、来ます→来れば": "します→すれば、来ます→来れば",
  "行かない → 行かなければ": "行かない → 行かなければ",
}
// Only entries whose *Ruby counterpart differs from the plain field (i.e.
// actually contains <ruby> tags) need a distinct EN ruby string; everywhere
// else the EN ruby field is just the EN plain field re-used verbatim.
const NOTE_RUBY_EN_OVERRIDE = {
  "します→する、来ます→来る":
    "します→する、<ruby>来<rp>(</rp><rt>き</rt><rp>)</rp></ruby>ます→<ruby>来<rp>(</rp><rt>く</rt><rp>)</rp></ruby>る",
  "します→しない、来ます→来ない":
    "します→しない、<ruby>来<rp>(</rp><rt>き</rt><rp>)</rp></ruby>ます→<ruby>来<rp>(</rp><rt>こ</rt><rp>)</rp></ruby>ない",
  "します→した、来ます→来た":
    "します→した、<ruby>来<rp>(</rp><rt>き</rt><rp>)</rp></ruby>ます→<ruby>来<rp>(</rp><rt>き</rt><rp>)</rp></ruby>た",
  "します→して、来ます→来て":
    "します→して、<ruby>来<rp>(</rp><rt>き</rt><rp>)</rp></ruby>ます→<ruby>来<rp>(</rp><rt>き</rt><rp>)</rp></ruby>て",
  "します→できます、来ます→来られます":
    "します→できます、<ruby>来<rp>(</rp><rt>き</rt><rp>)</rp></ruby>ます→<ruby>来<rp>(</rp><rt>こ</rt><rp>)</rp></ruby>られます",
  "します→しよう、来ます→来よう":
    "します→しよう、<ruby>来<rp>(</rp><rt>き</rt><rp>)</rp></ruby>ます→<ruby>来<rp>(</rp><rt>こ</rt><rp>)</rp></ruby>よう",
  "します→すれば、来ます→来れば":
    "します→すれば、<ruby>来<rp>(</rp><rt>き</rt><rp>)</rp></ruby>ます→<ruby>来<rp>(</rp><rt>く</rt><rp>)</rp></ruby>れば",
  "行かない → 行かなければ":
    "<ruby>行<rp>(</rp><rt>い</rt><rp>)</rp></ruby>かない → <ruby>行<rp>(</rp><rt>い</rt><rp>)</rp></ruby>かなければ",
}

const SENTENCE_VI_EN = {
  "Hôm nay tôi không đi học.": "I'm not going to school today.",
  "Hôm qua tôi đã xem phim.": "I watched a movie yesterday.",
  "Sáng thức dậy, ăn sáng rồi đi học.": "I wake up, eat breakfast, then go to school.",
  "Đọc sách rồi đi ngủ.": "I read a book, then go to sleep.",
  "Thầy/Cô vui lòng nói lại một lần nữa.": "Teacher, please say that once more.",
  "Tôi có thể nói tiếng Nhật.": "I can speak Japanese.",
  "Hôm nay tôi có thể xem phim.": "I can watch a movie today.",
  "Hôm qua tôi không ngủ được.": "I wasn't able to sleep last night.",
  "Cùng đi nhé.": "Let's go together.",
  "Mệt rồi, nghỉ thôi.": "I'm tired, let's take a break.",
  "Nếu có thời gian thì tôi sẽ đi.": "I'll go if I have time.",
}

const EXCEPTIONS_EN = {
  "買います → 買わない（không phải 買あない）": "買います → 買わない (not 買あない)",
  "行きます → 行った（không theo quy tắc きます→いた）": "行きます → 行った (doesn't follow the きます→いた rule)",
  "行きます → 行って（không phải 行いて）": "行きます → 行って (not 行いて)",
  "します → できます（không phải する dạng khả năng thông thường）": "します → できます (not する's ordinary potential form)",
}

for (const form of data.forms) {
  form.title = bi(form.title, FORM_TITLE_EN[form.title])
  form.meaning = bi(form.meaning, FORM_MEANING_EN[form.meaning])

  for (const r of form.rules) {
    const ruleEn = RULE_EN[r.rule]
    if (ruleEn === undefined) throw new Error(`no EN for rule "${r.rule}"`)
    const ruleRubyEn = RULE_RUBY_EN_OVERRIDE[r.rule] ?? ruleEn
    r.rule = bi(r.rule, ruleEn)
    r.ruleRuby = bi(r.ruleRuby, ruleRubyEn)

    const noteEn = NOTE_EN[r.note]
    if (noteEn === undefined) throw new Error(`no EN for note "${r.note}"`)
    const noteRubyEn = NOTE_RUBY_EN_OVERRIDE[r.note] ?? noteEn
    r.note = bi(r.note, noteEn)
    r.noteRuby = bi(r.noteRuby, noteRubyEn)
  }

  for (const s of form.sentenceExamples) {
    const en = SENTENCE_VI_EN[s.vi]
    if (en === undefined) throw new Error(`no EN for sentence "${s.vi}"`)
    s.meaning = bi(s.vi, en)
    delete s.vi
  }

  form.exceptions = form.exceptions.map((e) => {
    const en = EXCEPTIONS_EN[e]
    if (en === undefined) throw new Error(`no EN for exception "${e}"`)
    return bi(e, en)
  })
}

// exceptionsRuby EN overrides (the ones that actually contain <ruby> tags)
const EXCEPTIONS_RUBY_EN_OVERRIDE = {
  "nai": ["<ruby>買<rp>(</rp><rt>か</rt><rp>)</rp></ruby>います → <ruby>買<rp>(</rp><rt>か</rt><rp>)</rp></ruby>わない (not <ruby>買<rp>(</rp><rt>がい</rt><rp>)</rp></ruby>あない)"],
  "ta": ["<ruby>行<rp>(</rp><rt>い</rt><rp>)</rp></ruby>きます → <ruby>行<rp>(</rp><rt>おこな</rt><rp>)</rp></ruby>った (doesn't follow the きます→いた rule)"],
  "te": ["<ruby>行<rp>(</rp><rt>い</rt><rp>)</rp></ruby>きます → <ruby>行<rp>(</rp><rt>おこな</rt><rp>)</rp></ruby>って (not <ruby>行<rp>(</rp><rt>おこな</rt><rp>)</rp></ruby>いて)"],
  "potential": ["します → できます (not する's ordinary potential form)"],
}
for (const form of data.forms) {
  const override = EXCEPTIONS_RUBY_EN_OVERRIDE[form.id]
  if (form.exceptionsRuby && form.exceptionsRuby.length > 0) {
    form.exceptionsRuby = form.exceptionsRuby.map((html, i) => bi(html, override[i]))
  } else {
    form.exceptionsRuby = (form.exceptionsRuby || []).map(html => bi(html, html))
  }
}

// ---------- cheatSheet ----------
const HEADER_EN = { "Thể": "Form", "Nhóm 1": "Group 1", "Nhóm 2": "Group 2", "Nhóm 3": "Group 3" }
data.cheatSheet.headers = data.cheatSheet.headers.map(h => bi(h, HEADER_EN[h]))

const CELL_EN = {
  "Dictionary (từ điển)": "Dictionary",
  "ない (phủ định)": "ない (negative)",
  "Potential (khả năng)": "Potential",
  "た (quá khứ)": "た (past)",
  "て (nối tiếp)": "て (connective)",
  "Volitional (ý chí)": "Volitional",
  "ば (điều kiện)": "ば (conditional)",
  "quy tắc đặc biệt (xem bảng て/た)": "special rule (see て/た table)",
}
data.cheatSheet.rows = data.cheatSheet.rows.map(row =>
  row.map(cell => bi(cell, CELL_EN[cell] ?? cell))
)
// rowsRuby cells: only the "quy tắc đặc biệt..." cell is pure Vietnamese with
// no <ruby> tag of its own; everything else already contains real <ruby>
// markup around language-neutral Japanese conjugations, so EN = VI there.
data.cheatSheet.rowsRuby = data.cheatSheet.rowsRuby.map(row =>
  row.map(cell => bi(cell, CELL_EN[cell] ?? cell))
)

// ---------- keyExceptions ----------
const KEY_EXCEPTIONS_EN = {
  "行きます → 行って（thể て）": "行きます → 行って (て form)",
  "行きます → 行った（thể た）": "行きます → 行った (た form)",
  "買います → 買わない（thể ない, không phải 買あない）": "買います → 買わない (ない form, not 買あない)",
  "します → できる（thể khả năng, không chia theo quy tắc thường）": "します → できる (potential form, doesn't conjugate by the normal rule)",
  "来ます → 来られる（thể khả năng）": "来ます → 来られる (potential form)",
}
data.keyExceptions = data.keyExceptions.map(e => bi(e, KEY_EXCEPTIONS_EN[e]))

const KEY_EXCEPTIONS_RUBY_EN = [
  "<ruby>行<rp>(</rp><rt>い</rt><rp>)</rp></ruby>きます → <ruby>行<rp>(</rp><rt>おこな</rt><rp>)</rp></ruby>って (て form)",
  "<ruby>行<rp>(</rp><rt>い</rt><rp>)</rp></ruby>きます → <ruby>行<rp>(</rp><rt>おこな</rt><rp>)</rp></ruby>った (た form)",
  "<ruby>買<rp>(</rp><rt>か</rt><rp>)</rp></ruby>います → <ruby>買<rp>(</rp><rt>か</rt><rp>)</rp></ruby>わない (ない form, not <ruby>買<rp>(</rp><rt>がい</rt><rp>)</rp></ruby>あない)",
  "します → できる (potential form, doesn't conjugate by the normal rule)",
  "<ruby>来<rp>(</rp><rt>き</rt><rp>)</rp></ruby>ます → <ruby>来<rp>(</rp><rt>こ</rt><rp>)</rp></ruby>られる (potential form)",
]
data.keyExceptionsRuby = data.keyExceptionsRuby.map((html, i) => bi(html, KEY_EXCEPTIONS_RUBY_EN[i]))

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n")
console.log("verb-forms.json localized successfully.")
