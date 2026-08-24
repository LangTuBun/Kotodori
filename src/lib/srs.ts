import type { SRSCard } from "@/types"

// Classic SM-2 (SuperMemo-2) scheduler -- replaced this session's
// FSRS-inspired stability/difficulty scheduler at the user's explicit
// request (personal project; the previous algorithm wasn't SM-2, despite
// an initial "switch back to SM-2" framing -- see handoff.md).

const AGAIN = 1, HARD = 2, GOOD = 3, EASY = 4

// Standard SM-2 uses a 0-5 quality scale; this app's UI only exposes 4
// Anki-style buttons. Map them the same way Anki's own SM-2-derived
// scheduler does: AGAIN is a full lapse (q=0), and HARD/GOOD/EASY are all
// "correct" recalls of increasing quality (q=3/4/5) -- used only to drive
// the ease-factor adjustment below, not the interval branching itself.
const QUALITY: Record<number, number> = { [AGAIN]: 0, [HARD]: 3, [GOOD]: 4, [EASY]: 5 }

export function scheduleCard(card: SRSCard, rating: number): SRSCard {
  let { interval, repetition, easeFactor, lapseCount, reviewCount } = card
  const quality = QUALITY[rating] ?? 3

  if (rating === AGAIN) {
    repetition = 0
    interval = 1
    lapseCount += 1
  } else {
    if (repetition === 0) interval = 1
    else if (repetition === 1) interval = 6
    else interval = Math.max(1, Math.round(interval * easeFactor))
    repetition += 1
  }

  // SM-2's ease-factor update, applied every review (correct or not).
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))

  const now = new Date()
  const next = new Date()
  next.setDate(now.getDate() + interval)
  reviewCount += 1

  return {
    ...card,
    interval,
    repetition,
    easeFactor,
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
