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
  pattern: string
  meaning: { vi: string; en: string }
  category: string
  jlptLevel: string
  chapter: number
  explanation: { vi: string; en: string }
  nuances: string[]
  examples: Array<{ ja: string; kana: string; vi: string; en: string }>
  relatedGrammar: string[]
  tags: string[]
}

export interface HomophoneGroup {
  id: string
  reading: string
  words: Array<{ vocabId: string; kanji: string; meaning: { vi: string; en: string } }>
  difficultyScore: number
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
