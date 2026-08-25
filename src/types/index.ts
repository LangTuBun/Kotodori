export interface VocabEntry {
  id: string
  kanji: string
  kana: string
  meanings: { vi: string; en: string }
  pos: string
  verbGroup: number | null
  adjType: string | null
  jlptLevel: string
  // N5 words carry a textbook `chapter` (1-15, source: kanjis.tex chapters
  // + the N5-supplement chapter). N4's original source was a thematic word
  // list with no chapters -- those entries carry `category` instead. A
  // second, chaptered N4 source (Bài 15-24 only, see apply-n4-chapters.mjs)
  // has since backfilled `chapter` (15-24) onto the ~424 matching entries;
  // chapters 1-14 and 25-33 aren't sourced yet, so most N4 entries still
  // have `category` only and omit `chapter`. Both fields can be present at
  // once. Never treat a missing chapter as chapter 0 -- 0 is a corruption
  // signal in this codebase's history, not a valid "no chapter" value.
  chapter?: number
  category?: string
  tags: string[]
  homophones: string[]
  relatedWords: string[]
  examples: Array<{ ja: string; kana: string; vi: string; en: string }>
}

// -- Grammar Expansion V2 -----------------------------------------------
// Adds a deeper taxonomy (formation rules, pragmatics, pitfalls, rich
// examples) on top of the original GrammarPoint fields below, rather than
// a parallel "EnhancedGrammarPoint" the app would have to discriminate
// between. New fields are optional so legacy/unmigrated records (and any
// consumer that hasn't been updated) keep working untouched; migrated
// records populate them. See scripts/migrate-grammar-v2.mjs.
export type PosType = 'verb' | 'i-adj' | 'na-adj' | 'noun' | 'phrase'
export type ToneType = 'formal' | 'casual' | 'polite' | 'written' | 'spoken' | 'keigo' | 'neutral'

export interface ConnectionRule {
  pos: PosType
  form: string // e.g. 'Dictionary form (辞書形)', 'て-form', 'Stem (ます-stem)'
  particle?: string // optional connecting particle, e.g. 'の', 'な'
  exampleStr: string // e.g. '食べる ＋ ほうがいい'
}

export interface Pragmatics {
  tones: ToneType[]
  intent?: string // what the speaker achieves, e.g. 'Giving advice'
  emotionalNuance?: string // e.g. 'Can sound bossy or condescending to superiors'
  speakerStance?: string // e.g. 'Subjective opinion based on observation'
}

export interface GrammarPitfall {
  type: 'false_friend' | 'common_mistake' | 'nuance_trap'
  title: string
  description: { vi: string; en: string }
  examples?: {
    incorrect: string
    correct: string
    explanation?: { vi: string; en: string }
  }[]
  relatedGrammarId?: string // id of the easily-confused pattern
}

export type ExampleCategory = 'standard' | 'casual' | 'polite' | 'negative' | 'question' | 'edge_case'

export interface EnhancedGrammarExample {
  category: ExampleCategory
  ja: string
  jaRuby?: string
  kana: string
  romaji: string
  vi: string
  en: string
  contextualExplanation: { vi: string; en: string } // brief breakdown
  audioStub?: string // e.g. 'g_136_ex1.mp3' or absent
}

export interface GrammarPoint {
  id: string
  num: string
  pattern: string
  patternRomaji?: string
  patternRuby?: string
  meaning: { vi: string; en: string }
  category: string
  jlptLevel: string
  chapter: number
  order: number
  explanation: { vi: string; en: string }
  nuances: string[]
  examples: Array<{ ja: string; jaRuby?: string; kana: string; vi: string; en: string }>
  relatedGrammar: string[]
  tags: string[]
  requiredVerbForm: string[]

  // Grammar Expansion V2 (optional -- absent/empty on unmigrated records)
  formationRules?: ConnectionRule[]
  pragmatics?: Pragmatics
  notesAndPitfalls?: GrammarPitfall[]
  richExamples?: EnhancedGrammarExample[]
  opposingGrammar?: string[]
}

// Alias for spec-compliance with the Grammar Expansion V2 design doc --
// same shape as GrammarPoint, since the new fields live on it directly.
export type EnhancedGrammarPoint = GrammarPoint

export interface GrammarCategory {
  slug: string
  romanNumeral: string
  order: number
  title: { vi: string; en: string }
  count: number
}

export interface VerbGroupSample {
  masu: string
  masuRuby?: string
  meaning: { vi: string; en: string }
}

export interface VerbGroup {
  id: number
  name: { vi: string; en: string }
  note: { vi: string; en: string }
  sample: VerbGroupSample[]
}

export interface VerbFormRule {
  group: number | string
  rule: { vi: string; en: string }
  ruleRuby?: { vi: string; en: string }
  note: { vi: string; en: string }
  noteRuby?: { vi: string; en: string }
}

export interface VerbFormExample {
  group: number | string
  masu: string
  masuRuby?: string
  result: string
  resultRuby?: string
  resultNeg?: string
  resultNegRuby?: string
}

export interface VerbGroup1Ending {
  endings: string
  endingsRuby?: string
  result: string
  resultRuby?: string
  example: string
  exampleRuby?: string
}

export interface VerbFormSentenceExample {
  ja: string
  jaRuby?: string
  meaning: { vi: string; en: string }
}

export interface VerbForm {
  id: string
  title: { vi: string; en: string }
  titleJa: string
  titleJaRuby?: string
  meaning: { vi: string; en: string }
  rules: VerbFormRule[]
  group1Endings?: VerbGroup1Ending[]
  examples: VerbFormExample[]
  sentenceExamples: VerbFormSentenceExample[]
  exceptions: { vi: string; en: string }[]
  exceptionsRuby?: { vi: string; en: string }[]
}

export interface VerbFormsData {
  groups: VerbGroup[]
  forms: VerbForm[]
  cheatSheet: { headers: { vi: string; en: string }[]; rows: { vi: string; en: string }[][]; rowsRuby?: { vi: string; en: string }[][] }
  keyExceptions: { vi: string; en: string }[]
  keyExceptionsRuby?: { vi: string; en: string }[]
}

export interface HomophoneGroup {
  id: string
  reading: string
  words: Array<{ vocabId: string; kanji: string; meaning: { vi: string; en: string } }>
  difficultyScore: number
}

export interface KanjiWord {
  kanji: string
  kana: string
  hanviet: string
  meaning: { vi: string; en: string }
  onkun: string
  curated?: boolean
}

export interface KanjiGroup {
  id: string
  anchor: string
  kana: string | null
  hanviet: string | null
  meaning: { vi: string; en: string } | null
  onkun: string | null
  onyomi: string[]
  kunyomi: string[]
  words: KanjiWord[]
}

export interface KanjiChapter {
  chapter: number
  groupCount: number
  wordCount: number
  groups: KanjiGroup[]
}

export interface KanjiVgComponent {
  element: string
  position: string | null
  isRadical: boolean
}

export interface KanjiVgEntry {
  viewBox: string
  strokes: string[]
  components: KanjiVgComponent[]
}

export type KanjiVgData = Record<string, KanjiVgEntry>

export interface RadicalNameEntry {
  hanviet: string
  curated: boolean
}

export type RadicalNamesData = Record<string, RadicalNameEntry>

export interface CounterRow {
  number: string
  kanji: string
  kana: string
  romaji?: string
  meaning?: { vi: string; en: string }
  note?: { vi: string; en: string }
  isQuestion?: boolean
  isException?: boolean
}

export type CounterColumn = 'number' | 'kanji' | 'kana' | 'romaji' | 'meaning' | 'note'

export interface CounterCategory {
  id: string
  title: { vi: string; en: string }
  shortTitle: { vi: string; en: string }
  counter?: string
  counterKana?: string
  usage?: { vi: string; en: string }
  columns: CounterColumn[]
  rows: CounterRow[]
  footnote?: { vi: string; en: string }
  wide?: boolean
}

export interface CounterBigNumberExample {
  kanji: string
  kana: string
  romaji: string
  meaning: { vi: string; en: string }
}

export interface CountersData {
  title: { vi: string; en: string }
  intro: { vi: string; en: string }
  categories: CounterCategory[]
  bigNumberExamples: CounterBigNumberExample[]
}

export type SRSState = 'new' | 'learning' | 'review' | 'mastered'

export interface SRSCard {
  vocabId: string
  cardType: string
  // Classic SM-2 (SuperMemo-2) fields -- see src/lib/srs.ts. Replaced this
  // session's FSRS-inspired stability/difficulty fields at the user's
  // request (personal project, explicitly OK with resetting all schedules).
  interval: number
  repetition: number
  easeFactor: number
  lastReview: string | null
  nextReview: string | null
  reviewCount: number
  lapseCount: number
  state: SRSState
}
