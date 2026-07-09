import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useVocabStore } from "@/store/vocab-store"
import { Button } from "@/components/ui/Button"
import { Furigana } from "@/components/ui/Furigana"
import { PosTag } from "@/components/ui/PosTag"
import { RATING } from "@/lib/srs"
import vocabData from "@/data/n5/vocabulary.json"
import type { VocabEntry } from "@/types"

const vocab = vocabData as VocabEntry[]
const BATCH = 20

type ReviewCard = { vocabId: string; cardType: string; entry: VocabEntry }

export function Review() {
  const navigate = useNavigate()
  const { getDueCards, getNewCards, reviewCard, updateStreak } = useVocabStore()
  const [queue, setQueue] = useState<ReviewCard[]>([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [reviewed, setReviewed] = useState(0)

  useEffect(() => {
    const due = getDueCards()
    const newCards = getNewCards(Math.max(0, BATCH - due.length))
    const all = [...due, ...newCards]
    const cards: ReviewCard[] = all
      .map(c => {
        const entry = vocab.find(v => v.id === c.vocabId)
        if (!entry) return null
        return { vocabId: c.vocabId, cardType: c.cardType, entry }
      })
      .filter((c): c is ReviewCard => c !== null)
      .slice(0, BATCH)
    setQueue(cards)
    updateStreak()
  }, [getDueCards, getNewCards, updateStreak])

  const current = queue[idx]

  const handleRating = (rating: number) => {
    if (!current) return
    reviewCard(current.vocabId, current.cardType, rating)
    setReviewed(r => r + 1)
    if (idx + 1 >= queue.length) {
      setDone(true)
    } else {
      setIdx(i => i + 1)
      setFlipped(false)
    }
  }

  if (queue.length === 0) {
    return (
      <div className="p-8 max-w-xl">
        <div className="border-b-3 border-ink pb-6 mb-8">
          <h1 className="text-5xl font-black">Review</h1>
        </div>
        <div className="border-3 border-ink p-8 shadow-[5px_5px_0px_#00cc66] text-center">
          <div className="text-2xl font-black mb-2 text-green">All done!</div>
          <div className="text-muted font-bold mb-6">No cards due right now. Come back later!</div>
          <Button onClick={() => navigate('/')}>Back to dashboard</Button>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="p-8 max-w-xl">
        <div className="border-b-3 border-ink pb-6 mb-8">
          <h1 className="text-5xl font-black">Done!</h1>
        </div>
        <div className="border-3 border-ink p-8 shadow-[5px_5px_0px_#00cc66] text-center">
          <div className="text-7xl font-black mb-3">{reviewed}</div>
          <div className="text-sm font-bold uppercase tracking-wider text-muted mb-6">cards reviewed</div>
          <div className="flex gap-3 justify-center">
            <Button variant="yellow" onClick={() => { setDone(false); setIdx(0); setFlipped(false); setReviewed(0); setQueue([]); }}>
              Study More
            </Button>
            <Button onClick={() => navigate('/')}>Dashboard</Button>
          </div>
        </div>
      </div>
    )
  }

  const { entry, cardType } = current
  const progress = ((idx) / queue.length) * 100

  return (
    <div className="p-8 max-w-2xl">
      {/* Progress */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-4 bg-surface border-3 border-ink">
          <div className="h-full bg-yellow transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="font-black text-sm whitespace-nowrap">{idx + 1} / {queue.length}</span>
      </div>

      {/* Card */}
      <div
        className="border-3 border-ink shadow-[6px_6px_0px_#0a0a0a] p-8 bg-paper mb-6 cursor-pointer min-h-[300px] flex flex-col items-center justify-center text-center transition-all hover:shadow-[8px_8px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5"
        onClick={() => setFlipped(true)}
      >
        {!flipped ? (
          <>
            <div className="text-xs font-bold uppercase tracking-widest text-muted mb-6">
              {cardType === 'meaning' ? 'What does this mean?' :
               cardType === 'reading' ? 'How do you read this?' : 'What word?'}
            </div>
            <div className="text-6xl font-black jp leading-none mb-4">
              {cardType === 'meaning' ? (
                <Furigana kanji={entry.kanji} kana={entry.kana} />
              ) : cardType === 'reading' ? (
                entry.kanji || entry.kana
              ) : (
                entry.meanings.vi
              )}
            </div>
            {cardType === 'word' && entry.kana && (
              <div className="jp text-muted text-xl">{entry.kana}</div>
            )}
            <div className="mt-8 text-xs text-muted font-bold uppercase tracking-wider">
              Tap to reveal
            </div>
          </>
        ) : (
          <>
            <PosTag pos={entry.pos} verbGroup={entry.verbGroup} />
            <div className="text-5xl font-black jp leading-none my-4">
              <Furigana kanji={entry.kanji} kana={entry.kana} />
            </div>
            <div className="text-2xl font-bold mb-2">{entry.meanings.vi}</div>
            {entry.chapter > 0 && (
              <div className="text-xs text-muted font-bold uppercase">Chapter {entry.chapter}</div>
            )}
            {entry.examples.length > 0 && (
              <div className="mt-6 text-left w-full border-t-3 border-ink pt-4">
                <div className="jp text-sm font-bold">{entry.examples[0].ja}</div>
                <div className="text-xs text-muted mt-1">{entry.examples[0].vi}</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Rating buttons */}
      {flipped ? (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Again', sub: '<1m', rating: RATING.AGAIN, variant: 'red' },
            { label: 'Hard', sub: '~6m', rating: RATING.HARD, variant: 'secondary' },
            { label: 'Good', sub: '1d', rating: RATING.GOOD, variant: 'green' },
            { label: 'Easy', sub: '4d', rating: RATING.EASY, variant: 'yellow' },
          ].map(({ label, sub, rating, variant }) => (
            <Button
              key={label}
              variant={variant as any}
              className="flex flex-col gap-0.5 py-3"
              onClick={() => handleRating(rating)}
            >
              <span className="font-black">{label}</span>
              <span className="text-xs opacity-70 font-bold">{sub}</span>
            </Button>
          ))}
        </div>
      ) : (
        <Button variant="primary" className="w-full text-lg py-4" onClick={() => setFlipped(true)}>
          Show Answer
        </Button>
      )}
    </div>
  )
}
