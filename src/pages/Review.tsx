import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useVocabStore } from "@/store/vocab-store"
import { Button } from "@/components/ui/Button"
import { Furigana } from "@/components/ui/Furigana"
import { PosTag } from "@/components/ui/PosTag"
import { RATING } from "@/lib/srs"
import { onkunTone } from "@/lib/kanji"
import { useTranslation } from "@/lib/useTranslation"
import vocabData from "@/data/n5/vocabulary.json"
import kanjiData from "@/data/n5/kanji.json"
import type { VocabEntry, KanjiChapter, KanjiGroup, KanjiWord, SRSCard } from "@/types"

const vocab = vocabData as VocabEntry[]
const kanjiChapters = kanjiData.chapters as KanjiChapter[]
const CHAPTERS = Array.from({ length: 14 }, (_, i) => i + 1)
const POS_LIST = Array.from(new Set(vocab.map(v => v.pos))).sort()
const COUNT_PRESETS = [10, 20, 30, 50] as const

type Mode = 'vocab' | 'kanji'
type Phase = 'setup' | 'session' | 'done'

type VocabReviewCard = { kind: 'vocab'; id: string; cardType: string; entry: VocabEntry }
type KanjiReviewCard = {
  kind: 'kanji'; id: string; cardType: string
  word: KanjiWord; group: KanjiGroup; chapterNum: number
}
type ReviewCard = VocabReviewCard | KanjiReviewCard

// A flashcard-able unit for kanji mode is a single word within a leading-kanji
// group, not the group itself — so a group with 4 words yields 4 cards.
type KanjiPoolEntry = { id: string; word: KanjiWord; group: KanjiGroup; chapterNum: number }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function Review() {
  const navigate = useNavigate()
  const { getDueCardsFor, getNewCardsFor, getScheduledCardsFor, reviewCard, updateStreak } = useVocabStore()
  const { t } = useTranslation()

  const [mode, setMode] = useState<Mode>('vocab')
  const [chapter, setChapter] = useState<number | null>(null)
  const [pos, setPos] = useState<string | null>(null)
  const [countPreset, setCountPreset] = useState<number | 'all'>(20)

  const [phase, setPhase] = useState<Phase>('setup')
  const [queue, setQueue] = useState<ReviewCard[]>([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState(0)

  const vocabPool = useMemo(
    () => vocab.filter(v => (chapter === null || v.chapter === chapter) && (pos === null || v.pos === pos)),
    [chapter, pos]
  )

  const kanjiPool = useMemo(() => {
    const result: KanjiPoolEntry[] = []
    for (const c of kanjiChapters) {
      if (chapter !== null && c.chapter !== chapter) continue
      for (const g of c.groups) {
        g.words.forEach((word, wi) => {
          result.push({ id: `${g.id}::w${wi}`, word, group: g, chapterNum: c.chapter })
        })
      }
    }
    return result
  }, [chapter])

  const poolIds = mode === 'vocab' ? vocabPool.map(v => v.id) : kanjiPool.map(x => x.id)
  const poolSize = poolIds.length
  const dueCount = getDueCardsFor(poolIds).length
  const effectiveCount = countPreset === 'all' ? poolSize : Math.min(countPreset, poolSize)

  function startSession() {
    const due = getDueCardsFor(poolIds)
    const scheduled = getScheduledCardsFor(poolIds)
    const fresh = getNewCardsFor(poolIds, effectiveCount)
    const selected: SRSCard[] = [...due, ...fresh, ...scheduled].slice(0, effectiveCount)

    const cards: ReviewCard[] = shuffle(selected)
      .map((c): ReviewCard | null => {
        if (mode === 'vocab') {
          const entry = vocab.find(v => v.id === c.vocabId)
          return entry ? { kind: 'vocab', id: c.vocabId, cardType: c.cardType, entry } : null
        }
        const found = kanjiPool.find(x => x.id === c.vocabId)
        return found ? { kind: 'kanji', id: c.vocabId, cardType: 'kanji', word: found.word, group: found.group, chapterNum: found.chapterNum } : null
      })
      .filter((c): c is ReviewCard => c !== null)

    setQueue(cards)
    setIdx(0)
    setFlipped(false)
    setReviewed(0)
    setPhase('session')
    updateStreak()
  }

  const current = queue[idx]

  // Split so a keyboard rating can flash the button before the card actually
  // advances (mouse clicks advance immediately — see RatingBar).
  const commitRating = (rating: number) => {
    if (!current) return
    reviewCard(current.id, current.cardType, rating)
    setReviewed(r => r + 1)
  }
  const advanceCard = () => {
    if (idx + 1 >= queue.length) {
      setPhase('done')
    } else {
      setIdx(i => i + 1)
      setFlipped(false)
    }
  }

  function backToSetup() {
    setPhase('setup')
    setQueue([])
  }

  if (phase === 'setup') {
    return (
      <ReviewSetup
        mode={mode} setMode={setMode}
        chapter={chapter} setChapter={setChapter}
        pos={pos} setPos={setPos}
        countPreset={countPreset} setCountPreset={setCountPreset}
        poolSize={poolSize} dueCount={dueCount} effectiveCount={effectiveCount}
        onStart={startSession}
      />
    )
  }

  if (phase === 'done') {
    return (
      <div className="p-8 max-w-xl">
        <div className="border-b-3 border-ink pb-6 mb-8">
          <h1 className="text-5xl font-black">{t('review.done')}</h1>
        </div>
        <div className="border-3 border-ink p-8 shadow-[5px_5px_0px_#00cc66] text-center">
          <div className="text-7xl font-black mb-3">{reviewed}</div>
          <div className="text-sm font-bold uppercase tracking-wider text-muted mb-6">
            {mode === 'vocab' ? t('review.wordsReviewed') : t('review.kanjiReviewed')}
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="yellow" onClick={backToSetup}>{t('review.continueReview')}</Button>
            <Button onClick={() => navigate('/')}>{t('review.dashboardBtn')}</Button>
          </div>
        </div>
      </div>
    )
  }

  // phase === 'session'
  const progress = (idx / queue.length) * 100

  return (
    <div className="p-8 max-w-2xl">
      {/* Progress */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={backToSetup}
          title={t('review.changeFilter')}
          className="shrink-0 w-9 h-9 border-3 border-ink font-black flex items-center justify-center hover:bg-surface transition-colors"
        >
          ×
        </button>
        <div className="flex-1 h-4 bg-surface border-3 border-ink">
          <div className="h-full bg-yellow transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="font-black text-sm whitespace-nowrap">{idx + 1} / {queue.length}</span>
      </div>

      {current.kind === 'vocab' ? (
        <VocabCardView card={current} flipped={flipped} onFlip={() => setFlipped(true)} />
      ) : (
        <KanjiCardView card={current} flipped={flipped} onFlip={() => setFlipped(true)} />
      )}

      <RatingBar flipped={flipped} onFlip={() => setFlipped(true)} onRate={commitRating} onAdvance={advanceCard} />
    </div>
  )
}

function ReviewSetup({
  mode, setMode, chapter, setChapter, pos, setPos, countPreset, setCountPreset,
  poolSize, dueCount, effectiveCount, onStart,
}: {
  mode: Mode; setMode: (m: Mode) => void
  chapter: number | null; setChapter: (c: number | null) => void
  pos: string | null; setPos: (p: string | null) => void
  countPreset: number | 'all'; setCountPreset: (c: number | 'all') => void
  poolSize: number; dueCount: number; effectiveCount: number
  onStart: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="p-8 max-w-3xl">
      <div className="border-b-3 border-ink pb-6 mb-8">
        <h1 className="text-5xl font-black">{t('review.title')}</h1>
        <p className="text-muted font-bold mt-2 uppercase tracking-widest text-sm">{t('review.chooseScope')}</p>
      </div>

      <div className="border-3 border-ink shadow-[6px_6px_0px_#0a0a0a] bg-paper">
        {/* Mode tabs */}
        <div className="grid grid-cols-2 border-b-3 border-ink">
          <button
            onClick={() => setMode('vocab')}
            className={`py-4 border-r-3 border-ink font-black text-sm uppercase tracking-wider cursor-pointer transition-all ${mode === 'vocab' ? 'bg-ink text-paper' : 'hover:bg-surface'}`}
          >
            {t('review.vocabTab')}
          </button>
          <button
            onClick={() => setMode('kanji')}
            className={`py-4 font-black text-sm uppercase tracking-wider cursor-pointer transition-all ${mode === 'kanji' ? 'bg-ink text-paper' : 'hover:bg-surface'}`}
          >
            {t('review.kanjiTab')} <span className="opacity-60 normal-case font-bold">(漢字)</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Chapter filter */}
          <FilterSection label={t('review.chapterLabel')}>
            <ChipRow>
              <Chip active={chapter === null} onClick={() => setChapter(null)}>{t('common.all')}</Chip>
              {CHAPTERS.map(c => (
                <Chip key={c} active={chapter === c} onClick={() => setChapter(chapter === c ? null : c)}>
                  {t('common.chapterN', { n: c })}
                </Chip>
              ))}
            </ChipRow>
          </FilterSection>

          {/* Category filter (vocab only) */}
          {mode === 'vocab' && (
            <FilterSection label={t('review.posLabel')}>
              <ChipRow>
                <Chip active={pos === null} onClick={() => setPos(null)}>{t('common.all')}</Chip>
                {POS_LIST.map(p => (
                  <Chip key={p} active={pos === p} onClick={() => setPos(pos === p ? null : p)}>
                    {t(`pos.${p}`)}
                  </Chip>
                ))}
              </ChipRow>
            </FilterSection>
          )}

          {/* Count */}
          <FilterSection label={t('review.countLabel')}>
            <ChipRow>
              {COUNT_PRESETS.map(n => (
                <Chip key={n} active={countPreset === n} onClick={() => setCountPreset(n)}>{n} {t('review.wordsSuffix')}</Chip>
              ))}
              <Chip active={countPreset === 'all'} onClick={() => setCountPreset('all')}>{t('common.all')} ({poolSize})</Chip>
            </ChipRow>
          </FilterSection>
        </div>

        {/* Summary + start */}
        <div className="border-t-3 border-ink p-6 bg-surface flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm font-bold">
            {poolSize === 0 ? (
              <span className="text-red">{mode === 'vocab' ? t('review.noMatchWords') : t('review.noMatchKanji')}</span>
            ) : (
              <>
                <span className="text-red">{dueCount} {t('review.due')}</span>
                <span className="text-muted"> · {poolSize} {mode === 'vocab' ? t('review.wordsInScope') : t('review.kanjiInScope')} · {t('review.willReview')} </span>
                <span>{effectiveCount}</span>
              </>
            )}
          </div>
          <Button variant="primary" size="lg" disabled={effectiveCount === 0} onClick={onStart}>
            {t('review.start')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-black uppercase tracking-widest text-muted mb-2">{label}</div>
      {children}
    </div>
  )
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 border-2 border-ink font-black text-xs cursor-pointer transition-all ${active ? 'bg-ink text-paper' : 'hover:bg-surface'}`}
    >
      {children}
    </button>
  )
}

function VocabCardView({ card, flipped, onFlip }: { card: VocabReviewCard; flipped: boolean; onFlip: () => void }) {
  const { entry, cardType } = card
  const { t, localize } = useTranslation()
  return (
    <div
      className="border-3 border-ink shadow-[6px_6px_0px_#0a0a0a] p-8 bg-paper mb-6 cursor-pointer min-h-[300px] flex flex-col items-center justify-center text-center transition-all hover:shadow-[8px_8px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5"
      onClick={onFlip}
    >
      {!flipped ? (
        <>
          <div className="text-xs font-bold uppercase tracking-widest text-muted mb-6">
            {cardType === 'meaning' ? t('review.whatMeaning') :
             cardType === 'reading' ? t('review.howRead') : t('review.whatWord')}
          </div>
          <div className="text-6xl font-black jp leading-none mb-4">
            {cardType === 'meaning' ? (
              <Furigana kanji={entry.kanji} kana={entry.kana} />
            ) : cardType === 'reading' ? (
              entry.kanji || entry.kana
            ) : (
              localize(entry.meanings)
            )}
          </div>
          {cardType === 'word' && entry.kana && (
            <div className="jp text-muted text-xl">{entry.kana}</div>
          )}
          <div className="mt-8 text-xs text-muted font-bold uppercase tracking-wider">
            {t('review.tapReveal')}
          </div>
        </>
      ) : (
        <>
          <PosTag pos={entry.pos} verbGroup={entry.verbGroup} />
          <div className="text-5xl font-black jp leading-none my-4">
            <Furigana kanji={entry.kanji} kana={entry.kana} />
          </div>
          <div className="text-2xl font-bold mb-2">{localize(entry.meanings)}</div>
          {entry.chapter > 0 && (
            <div className="text-xs text-muted font-bold uppercase">{t('common.chapterN', { n: entry.chapter })}</div>
          )}
          {entry.examples.length > 0 && (
            <div className="mt-6 text-left w-full border-t-3 border-ink pt-4">
              <div className="jp text-sm font-bold">{entry.examples[0].ja}</div>
              <div className="text-xs text-muted mt-1">{localize({ vi: entry.examples[0].vi, en: entry.examples[0].en })}</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function KanjiCardView({ card, flipped, onFlip }: { card: KanjiReviewCard; flipped: boolean; onFlip: () => void }) {
  const { word, group, chapterNum } = card
  const { t } = useTranslation()
  // Real example sentences don't exist yet for individual kanji words (or
  // for vocab entries in general — vocabulary.json's examples[] is empty
  // app-wide), so context comes from real sibling words in the same
  // leading-kanji family instead of fabricated sentences.
  const siblings = group.words.filter(w => w !== word).slice(0, 3)

  return (
    <div
      className="border-3 border-ink shadow-[6px_6px_0px_#0a0a0a] p-8 bg-paper mb-6 cursor-pointer min-h-[300px] flex flex-col items-center justify-center text-center transition-all hover:shadow-[8px_8px_0px_#0a0a0a] hover:-translate-x-0.5 hover:-translate-y-0.5"
      onClick={onFlip}
    >
      {!flipped ? (
        <>
          <div className="text-xs font-bold uppercase tracking-widest text-muted mb-6">
            {t('review.kanjiQuestion')}
          </div>
          <div className="text-6xl font-black jp leading-[2.2] mb-4">
            <Furigana kanji={word.kanji} kana={word.kana} />
          </div>
          <div className="mt-8 text-xs text-muted font-bold uppercase tracking-wider">
            {t('review.tapReveal')}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3">
            {word.hanviet && (
              <span className="text-sm font-black px-2 py-1 border-2 border-ink bg-surface">{word.hanviet}</span>
            )}
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: onkunTone(word.onkun) }}>
              {word.onkun}
            </span>
            <span className="text-xs text-muted font-bold uppercase ml-auto">{t('common.chapterN', { n: chapterNum })}</span>
          </div>
          <div className="text-5xl font-black jp leading-[2] mb-4">
            <Furigana kanji={word.kanji} kana={word.kana} />
          </div>
          <div className="text-2xl font-bold mb-2">{word.meaning}</div>
          <div className="text-xs text-muted font-bold uppercase tracking-wider">
            {t('review.sameGroup')} <span className="jp text-sm text-ink">{group.anchor}</span>
          </div>

          {siblings.length > 0 && (
            <div className="mt-6 text-left w-full border-t-3 border-ink pt-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">{t('review.siblingWords')}</div>
              <ul className="space-y-1.5">
                {siblings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="jp font-bold leading-snug shrink-0 min-w-[3.5rem]">
                      <Furigana kanji={w.kanji} kana={w.kana} />
                    </span>
                    <span className="flex-1 min-w-0 leading-snug">
                      <span>{w.meaning}</span>
                      <span className="text-muted text-xs ml-1.5">({w.hanviet})</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider shrink-0 pt-0.5" style={{ color: onkunTone(w.onkun) }}>
                      {w.onkun}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const RATING_BUTTONS = [
  { key: '1', labelKey: 'again', sub: '<1m', rating: RATING.AGAIN, variant: 'red' },
  { key: '2', labelKey: 'hard', sub: '~6m', rating: RATING.HARD, variant: 'secondary' },
  { key: '3', labelKey: 'good', sub: '1d', rating: RATING.GOOD, variant: 'green' },
  { key: '4', labelKey: 'easy', sub: '4d', rating: RATING.EASY, variant: 'yellow' },
] as const

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || (el as HTMLElement).isContentEditable
}

function RatingBar({ flipped, onFlip, onRate, onAdvance }: {
  flipped: boolean; onFlip: () => void
  onRate: (rating: number) => void; onAdvance: () => void
}) {
  const [flashRating, setFlashRating] = useState<number | null>(null)
  const [flashFlip, setFlashFlip] = useState(false)
  const { t } = useTranslation()

  // Space flips the card; 1/2/3/4 rate it once the answer is showing.
  // Only one of the two is ever live at a time (rating buttons don't exist
  // pre-flip), and neither fires while the user is typing into a future
  // <input>/<textarea>.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(document.activeElement)) return

      if (!flipped) {
        if (e.key !== ' ' && e.code !== 'Space') return
        e.preventDefault()
        setFlashFlip(true)
        onFlip()
        return
      }

      const match = RATING_BUTTONS.find(b => b.key === e.key)
      if (!match) return
      e.preventDefault()
      setFlashRating(match.rating)
      onRate(match.rating)
      // Hold the flash long enough to be seen before the card advances.
      setTimeout(onAdvance, 150)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [flipped, onFlip, onRate, onAdvance])

  useEffect(() => {
    if (flashRating === null) return
    const timer = setTimeout(() => setFlashRating(null), 150)
    return () => clearTimeout(timer)
  }, [flashRating])

  useEffect(() => {
    if (!flashFlip) return
    const timer = setTimeout(() => setFlashFlip(false), 150)
    return () => clearTimeout(timer)
  }, [flashFlip])

  if (!flipped) {
    return (
      <Button
        variant="primary"
        className={`w-full text-lg py-4 transition-all ${flashFlip ? 'shadow-none translate-x-0.5 translate-y-0.5' : ''}`}
        onClick={onFlip}
      >
        {t('review.showAnswer')} <span className="text-xs opacity-60 font-bold ml-1">{t('review.spaceHint')}</span>
      </Button>
    )
  }
  return (
    <div className="grid grid-cols-4 gap-3">
      {RATING_BUTTONS.map(({ key, labelKey, sub, rating, variant }) => (
        <Button
          key={labelKey}
          variant={variant as any}
          className={`relative flex flex-col gap-0.5 py-3 transition-all ${
            flashRating === rating ? 'shadow-none translate-x-0.5 translate-y-0.5' : ''
          }`}
          onClick={() => { onRate(rating); onAdvance() }}
        >
          <span className="absolute top-1 left-1.5 text-[10px] font-bold opacity-50">{key}</span>
          <span className="font-black">{t(`review.rating.${labelKey}`)}</span>
          <span className="text-xs opacity-70 font-bold">{sub}</span>
        </Button>
      ))}
    </div>
  )
}
