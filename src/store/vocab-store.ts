import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SRSCard } from "@/types"
import { scheduleCard, isDue } from "@/lib/srs"
import { vocabForLevel } from "@/data/vocab"
import { useSettingsStore } from "@/store/settings-store"

// The no-arg get*Cards()/getStats() methods below are the "current level"
// convenience surface Sidebar/Dashboard use -- they read the active level
// from settings-store directly (a plain cross-store read, not a subscribe;
// settings-store never imports this store back, so no cycle) rather than
// requiring every caller to thread the level through. Anything that needs a
// specific/custom scope (Review's chapter+POS filters, a combined N5+N4
// pool) should keep using the *For(ids) variants instead.
function currentLevelVocab() {
  return vocabForLevel(useSettingsStore.getState().level)
}

interface VocabStore {
  cards: Record<string, SRSCard>
  streak: number
  lastStudyDate: string | null
  totalReviewed: number

  getCard: (vocabId: string) => SRSCard
  getDueCards: () => SRSCard[]
  getNewCards: (limit?: number) => SRSCard[]
  getDueCardsFor: (ids: string[]) => SRSCard[]
  getNewCardsFor: (ids: string[], limit?: number) => SRSCard[]
  getScheduledCardsFor: (ids: string[]) => SRSCard[]
  reviewCard: (vocabId: string, cardType: string, rating: number) => void
  updateStreak: () => void
  getStats: () => { total: number; new: number; learning: number; review: number; mastered: number }
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
      streak: 0,
      lastStudyDate: null,
      totalReviewed: 0,

      getCard: (vocabId) => {
        return get().cards[vocabId] ?? makeDefaultCard(vocabId)
      },

      getDueCards: () => {
        return get().getDueCardsFor(currentLevelVocab().map(v => v.id)).slice(0, 50)
      },

      getNewCards: (limit = 10) => {
        return get().getNewCardsFor(currentLevelVocab().map(v => v.id), limit)
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

      updateStreak: () => {
        const today = new Date().toDateString()
        const { lastStudyDate, streak } = get()
        if (lastStudyDate === today) return
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const newStreak = lastStudyDate === yesterday.toDateString() ? streak + 1 : 1
        set({ streak: newStreak, lastStudyDate: today })
      },

      getStats: () => {
        const { cards } = get()
        const all = currentLevelVocab()
        const counts = { total: all.length, new: 0, learning: 0, review: 0, mastered: 0 }
        for (const v of all) {
          const c = cards[v.id]
          if (!c || c.state === 'new') counts.new++
          else if (c.state === 'learning') counts.learning++
          else if (c.state === 'review') counts.review++
          else if (c.state === 'mastered') counts.mastered++
        }
        return counts
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
