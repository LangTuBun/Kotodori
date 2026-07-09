import type { SRSCard } from "@/types"

const AGAIN = 1, HARD = 2, GOOD = 3, EASY = 4

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

export function scheduleCard(card: SRSCard, rating: number): SRSCard {
  const now = new Date()
  const next = new Date()
  let { stability, difficulty, lapseCount, reviewCount } = card

  if (card.state === 'new') {
    if (rating === AGAIN) { stability = 0.4; difficulty = 0.8 }
    else if (rating === HARD) { stability = 0.7; difficulty = 0.6 }
    else if (rating === GOOD) { stability = 1; difficulty = 0.3 }
    else { stability = 1.5; difficulty = 0.15 }
  } else {
    const retrievability = Math.exp(-daysBetween(new Date(card.lastReview!), now) / stability)
    if (rating === AGAIN) {
      lapseCount += 1
      stability = Math.max(0.5, stability * 0.2)
      difficulty = Math.min(1, difficulty + 0.2)
    } else {
      const factor = rating === HARD ? 0.8 : rating === EASY ? 1.3 : 1.0
      stability = stability * (1 + 0.9 * Math.exp(0.1 * (1 - retrievability)) * factor)
      difficulty = Math.max(0.1, difficulty - 0.03 * (rating - 3))
    }
  }

  const interval = Math.max(1, Math.round(stability * 9 / difficulty))
  next.setDate(now.getDate() + interval)
  reviewCount += 1

  return {
    ...card,
    stability,
    difficulty,
    lapseCount,
    reviewCount,
    lastReview: now.toISOString(),
    nextReview: next.toISOString(),
    state: rating === AGAIN ? 'learning' : interval >= 21 ? 'mastered' : 'review',
  }
}

export function isDue(card: SRSCard): boolean {
  if (card.state === 'new') return true
  if (!card.nextReview) return true
  return new Date(card.nextReview) <= new Date()
}

export const RATING = { AGAIN: 1, HARD: 2, GOOD: 3, EASY: 4 }
