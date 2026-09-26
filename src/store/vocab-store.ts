import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SRSCard } from "@/types"
import { scheduleCard, isDue } from "@/lib/srs"

// Every query takes the vocab ids to scope it to rather than reading the
// vocabulary itself: this store is used by the Sidebar, which is part of the
// startup bundle, and importing the ~700KB vocab JSON here would put all of
// it on the critical path of the very first paint. Callers pass ids from
// their own (lazily loaded) copy of @/data/vocab.

interface VocabStore {
  cards: Record<string, SRSCard>
  totalReviewed: number

  getCard: (vocabId: string) => SRSCard
  getDueCardsFor: (ids: string[]) => SRSCard[]
  getNewCardsFor: (ids: string[], limit?: number) => SRSCard[]
  getScheduledCardsFor: (ids: string[]) => SRSCard[]
  reviewCard: (vocabId: string, cardType: string, rating: number) => void
}

function makeDefaultCard(vocabId: string, cardType = 'kanji-meaning'): SRSCard {
  return {
    vocabId,
    cardType,
    interval: 0,
    repetition: 0,
    easeFactor: 2.5, // SM-2's standard starting ease factor
    lastReview: null,
    nextReview: null,
    reviewCount: 0,
    lapseCount: 0,
    state: 'new',
  }
}

export const useVocabStore = create<VocabStore>()(
  persist(
    (set, get) => ({
      cards: {},
      totalReviewed: 0,

      getCard: (vocabId) => {
        return get().cards[vocabId] ?? makeDefaultCard(vocabId)
      },

      getDueCardsFor: (ids) => {
        const { cards } = get()
        return ids
          .map(id => cards[id] ?? makeDefaultCard(id))
          .filter(c => c.state !== 'new' && isDue(c))
      },

      getNewCardsFor: (ids, limit) => {
        const { cards } = get()
        const news = ids.filter(id => !cards[id] || cards[id].state === 'new')
        return (limit === undefined ? news : news.slice(0, limit)).map(id => makeDefaultCard(id))
      },

      getScheduledCardsFor: (ids) => {
        const { cards } = get()
        return ids
          .map(id => cards[id])
          .filter((c): c is SRSCard => !!c && c.state !== 'new' && !isDue(c))
      },

      reviewCard: (vocabId, cardType, rating) => {
        const card = { ...get().getCard(vocabId), cardType }
        const updated = scheduleCard(card, rating)
        set(state => ({
          cards: { ...state.cards, [vocabId]: updated },
          totalReviewed: state.totalReviewed + 1,
        }))
      },
    }),
    // Renamed from 'kotodori-vocab': the SM-2 schema swap this session
    // changes every SRSCard field, so old localStorage data under the old
    // key is deliberately abandoned rather than migrated -- the user
    // explicitly OK'd a full reset ("no harm... I'm not familiar with
    // FSRS, I'm more like the OG [SM-2] enjoyer"). Reusing the old key
    // would have silently mixed the new field shape with leftover
    // stability/difficulty values on every previously-reviewed card.
    { name: 'tori-vocab' }
  )
)
