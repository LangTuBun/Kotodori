export interface VocabEntry {
  id: string
  kanji: string
  kana: string
  meanings: { vi: string; en: string }
  pos: string
  verbGroup: number | null
  adjType: string | null
  jlptLevel: string
  chapter: number
  tags: string[]
  homophones: string[]
  relatedWords: string[]
  examples: Array<{ ja: string; kana: string; vi: string; en: string }>
}

export interface GrammarPoint {
  id: string
  num: string
  pattern: string
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
}

export interface GrammarCategory {
  slug: string
  romanNumeral: string
  order: number
  title: string
  count: number
}

export interface VerbGroupSample {
  masu: string
  masuRuby?: string
  vi: string
}

export interface VerbGroup {
  id: number
  name: string
  note: string
  sample: VerbGroupSample[]
}

export interface VerbFormRule {
  group: number | string
  rule: string
  ruleRuby?: string
  note: string
  noteRuby?: string
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
  vi: string
}

export interface VerbForm {
  id: string
  title: string
  titleJa: string
  titleJaRuby?: string
  meaning: string
  rules: VerbFormRule[]
  group1Endings?: VerbGroup1Ending[]
  examples: VerbFormExample[]
  sentenceExamples: VerbFormSentenceExample[]
  exceptions: string[]
  exceptionsRuby?: string[]
}

export interface VerbFormsData {
  groups: VerbGroup[]
  forms: VerbForm[]
  cheatSheet: { headers: string[]; rows: string[][]; rowsRuby?: string[][] }
  keyExceptions: string[]
  keyExceptionsRuby?: string[]
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
  meaning: string
  onkun: string
  curated?: boolean
}

export interface KanjiGroup {
  id: string
  anchor: string
  kana: string | null
  hanviet: string | null
  meaning: string | null
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

export type SRSState = 'new' | 'learning' | 'review' | 'mastered'

export interface SRSCard {
  vocabId: string
  cardType: string
  stability: number
  difficulty: number
  lastReview: string | null
  nextReview: string | null
  reviewCount: number
  lapseCount: number
  state: SRSState
}
