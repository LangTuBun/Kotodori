import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useVocabStore } from "@/store/vocab-store"
import { useSettingsStore } from "@/store/settings-store"
import { Button } from "@/components/ui/Button"
import { Furigana } from "@/components/ui/Furigana"
import { PosTag } from "@/components/ui/PosTag"
import { PitchAccent } from "@/components/ui/PitchAccent"
import { RATING } from "@/lib/srs"
import { onkunTone } from "@/lib/kanji"
import { useTranslation } from "@/lib/useTranslation"
import { vocabForLevel } from "@/data/vocab"
import { n5KanjiChapters, n4KanjiChapters } from "@/data/kanji"
import type { VocabEntry, KanjiChapter, KanjiGroup, KanjiWord, SRSCard } from "@/types"
import { Watermark } from "@/components/ui/ScreenHeader"
import type { Level } from "@/store/settings-store"
import { groupKey, compareGroupKeys, isChapterKey } from "@/lib/vocab-grouping"

// N5's chapter 15 ("N5 supplement") and N4's chapter 15 (Bai 15) both use
// the identical k15_gN group-id scheme (see Kanji.tsx's own src-tagging for
// the same collision) -- so kanji-mode review card ids are tagged with
// their source level too, e.g. "N5:k15_g1::w0" vs "N4:k15_g1::w0". This
// changes every existing kanji-mode SRS card id; that's fine only because
// this session's SM-2 migration (see srs.ts) already resets every card's
// schedule regardless of id, per the user's explicit go-ahead -- don't
// repeat this rename casually once cards are live under the new scheme.
type Src = 'N5' | 'N4'
function taggedKanjiChapters(level: Level): Array<KanjiChapter & { src: Src }> {
  const n5 = n5KanjiChapters.map(c => ({ ...c, src: 'N5' as const }))
  const n4 = n4KanjiChapters.map(c => ({ ...c, src: 'N4' as const }))
  if (level === 'N5') return n5
  if (level === 'N4') return n4
  return [...n5, ...n4]
}
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
  const { getDueCardsFor, getNewCardsFor, getScheduledCardsFor, reviewCard } = useVocabStore()
  const level = useSettingsStore(s => s.level)
  const { t } = useTranslation()

  const [mode, setMode] = useState<Mode>('vocab')
  const kanjiChapters = useMemo(() => taggedKanjiChapters(level), [level])

  const vocab = useMemo(() => vocabForLevel(level), [level])
  const POS_LIST = useMemo(() => Array.from(new Set(vocab.map(v => v.pos))).sort(), [vocab])
  // Same chapter/category grouping VocabBrowser uses: chapter number where
  // one's been backfilled (N5 always, N4 for Bài 15-24), thematic category
  // otherwise -- one unified filter axis instead of picking a single scheme
  // per level (which is what left N4 without a chapter option at all).
  const GROUPS = useMemo(() => Array.from(new Set(vocab.map(groupKey))).sort(compareGroupKeys), [vocab])
  const hasChapterKeys = useMemo(() => GROUPS.some(isChapterKey), [GROUPS])
  const allChapterKeys = useMemo(() => GROUPS.every(isChapterKey), [GROUPS])

  // Kanji-mode chapters are always plain numbers (no category fallback --
  // every kanji entry is chaptered), so this stays a separate numeric axis
  // rather than folding into `group` above.
  const kanjiChapterNums = useMemo(
    () => Array.from(new Set(kanjiChapters.map(c => c.chapter))).sort((a, b) => a - b),
    [kanjiChapters]
  )

  const [group, setGroup] = useState<string | null>(null)
  const [kanjiChapter, setKanjiChapter] = useState<number | null>(null)
  const [pos, setPos] = useState<string | null>(null)
  const [countPreset, setCountPreset] = useState<number | 'all'>(20)

  // A chapter number or category name from one level has no meaning after
  // switching levels (matches VocabBrowser's same reset).
  useEffect(() => { setGroup(null); setKanjiChapter(null); setPos(null) }, [level])

  const [phase, setPhase] = useState<Phase>('setup')
  const [queue, setQueue] = useState<ReviewCard[]>([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState(0)

  const vocabPool = useMemo(
    () => vocab.filter(v =>
      (group === null || groupKey(v) === group) &&
      (pos === null || v.pos === pos)
    ),
    [vocab, group, pos]
  )

  const kanjiPool = useMemo(() => {
    const result: KanjiPoolEntry[] = []
    for (const c of kanjiChapters) {
      if (kanjiChapter !== null && c.chapter !== kanjiChapter) continue
      for (const g of c.groups) {
        g.words.forEach((word, wi) => {
          result.push({ id: `${c.src}:${g.id}::w${wi}`, word, group: g, chapterNum: c.chapter })
        })
      }
    }
    return result
  }, [kanjiChapter, kanjiChapters])

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
  }

  const current = queue[idx]

  // Again/Hard requeue the card a few cards ahead so it resurfaces later in
  // this same session (Anki-style relearning), instead of only coming back
  // whenever its FSRS nextReview date is up. Good/Easy don't requeue — those
  // ratings are trusted to the normal schedule.
  const REQUEUE_GAP = 4

  // Split so a keyboard rating can flash the button before the card actually
  // advances (mouse clicks advance immediately — see RatingBar).
  const commitRating = (rating: number) => {
    if (!current) return
    reviewCard(current.id, current.cardType, rating)
    setReviewed(r => r + 1)
    if (rating === RATING.AGAIN || rating === RATING.HARD) {
      setQueue(q => {
        const insertAt = Math.min(q.length, idx + 1 + REQUEUE_GAP)
        const next = [...q]
        next.splice(insertAt, 0, current)
        return next
      })
    }
  }
  const advanceCard = (rating: number) => {
    const requeued = rating === RATING.AGAIN || rating === RATING.HARD
    const nextLength = queue.length + (requeued ? 1 : 0)
    if (idx + 1 >= nextLength) {
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
        group={group} setGroup={setGroup} groups={GROUPS} hasChapterKeys={hasChapterKeys} allChapterKeys={allChapterKeys}
        kanjiChapter={kanjiChapter} setKanjiChapter={setKanjiChapter} kanjiChapterNums={kanjiChapterNums}
        pos={pos} setPos={setPos} posList={POS_LIST}
        countPreset={countPreset} setCountPreset={setCountPreset}
        poolSize={poolSize} dueCount={dueCount} effectiveCount={effectiveCount}
        onStart={startSession}
      />
    )
  }

  if (phase === 'done') {
    return (
      <div className="p-4 sm:p-8 max-w-xl">
        <div className="border-b-3 border-structural pb-6 mb-8">
          <h1 className="text-[clamp(2rem,8vw,3rem)] font-black">{t('review.done')}</h1>
        </div>
        <div className="border-3 border-structural p-4 sm:p-8 shadow-[5px_5px_0px_var(--color-green)] text-center">
          <div className="text-5xl sm:text-7xl font-black mb-3">{reviewed}</div>
          <div className="text-sm font-bold uppercase tracking-wider text-muted mb-6">
            {mode === 'vocab' ? t('review.wordsReviewed') : t('review.kanjiReviewed')}
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="yellow" onClick={backToSetup}>{t('review.continueReview')}</Button>
            <Button onClick={() => navigate('/')}>{t('review.homeBtn')}</Button>
          </div>
        </div>
      </div>
    )
  }

  // phase === 'session'
  const progress = (idx / queue.length) * 100

  return (
    <div className="p-4 sm:p-8 max-w-2xl">
      {/* Progress */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={backToSetup}
          title={t('review.changeFilter')}
          className="shrink-0 w-9 h-9 border-3 border-structural font-black flex items-center justify-center hover:bg-surface transition-colors"
        >
          ×
        </button>
        <div className="flex-1 h-4 bg-surface border-3 border-structural overflow-hidden">
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
  mode, setMode,
  group, setGroup, groups, hasChapterKeys, allChapterKeys,
  kanjiChapter, setKanjiChapter, kanjiChapterNums,
  pos, setPos, posList,
  countPreset, setCountPreset,
  poolSize, dueCount, effectiveCount, onStart,
}: {
  mode: Mode; setMode: (m: Mode) => void
  group: string | null; setGroup: (g: string | null) => void; groups: string[]; hasChapterKeys: boolean; allChapterKeys: boolean
  kanjiChapter: number | null; setKanjiChapter: (c: number | null) => void; kanjiChapterNums: number[]
  pos: string | null; setPos: (p: string | null) => void; posList: string[]
  countPreset: number | 'all'; setCountPreset: (c: number | 'all') => void
  poolSize: number; dueCount: number; effectiveCount: number
  onStart: () => void
}) {
  const { t } = useTranslation()
  // "Chapter" when every group key is a chapter number (N5), "Chapter /
  // Category" when it's a mix (N4, all), "Category" if somehow no chapter
  // keys exist at all -- mirrors VocabBrowser's own dropdown-label logic.
  const groupLabel = allChapterKeys
    ? t('review.chapterLabel')
    : hasChapterKeys ? t('review.chapterCategoryLabel') : t('review.categoryLabel')
  return (
    <div className="relative p-4 sm:p-8 max-w-3xl overflow-hidden">
      <Watermark char="復" />
      <div className="border-b-3 border-structural pb-6 mb-8">
        <h1 className="text-[clamp(2rem,8vw,3rem)] font-black">{t('review.title')}</h1>
        <p className="text-muted font-bold mt-2 uppercase tracking-widest text-sm">{t('review.chooseScope')}</p>
      </div>

      <div className="border-3 border-structural shadow-[var(--shadow-brutal)] bg-paper overflow-hidden">
        {/* Mode tabs */}
        <div className="grid grid-cols-2 border-b-3 border-structural">
          <button
            onClick={() => setMode('vocab')}
            className={`py-4 border-r-3 border-structural font-black text-sm uppercase tracking-wider cursor-pointer transition-all ${mode === 'vocab' ? 'bg-ink text-paper' : 'hover:bg-surface'}`}
          >
            {t('review.vocabTab')}
          </button>
          <button
            onClick={() => setMode('kanji')}
            className={`py-4 font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${mode === 'kanji' ? 'bg-ink text-paper' : 'hover:bg-surface'}`}
          >
            {t('review.kanjiTab')} <span className="opacity-60 normal-case font-bold">(漢字)</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Vocab: unified chapter/category filter (same grouping as
              VocabBrowser). Kanji: plain chapter filter -- every kanji entry
              is chaptered on both levels, so this is always available. */}
          {mode === 'vocab' ? (
            <FilterSection label={groupLabel}>
              <ChipRow>
                <Chip active={group === null} onClick={() => setGroup(null)}>{t('common.all')}</Chip>
                {groups.map(g => (
                  <Chip key={g} active={group === g} onClick={() => setGroup(group === g ? null : g)}>
                    {g === '?' ? t('vocab.unknownChapter') : isChapterKey(g) ? t('common.chapterN', { n: g }) : g}
                  </Chip>
                ))}
              </ChipRow>
            </FilterSection>
          ) : (
            <FilterSection label={t('review.chapterLabel')}>
              <ChipRow>
                <Chip active={kanjiChapter === null} onClick={() => setKanjiChapter(null)}>{t('common.all')}</Chip>
                {kanjiChapterNums.map(c => (
                  <Chip key={c} active={kanjiChapter === c} onClick={() => setKanjiChapter(kanjiChapter === c ? null : c)}>
                    {t('common.chapterN', { n: c })}
                  </Chip>
                ))}
              </ChipRow>
            </FilterSection>
          )}

          {/* Category filter (vocab only) */}
          {mode === 'vocab' && (
            <FilterSection label={t('review.posLabel')}>
              <ChipRow>
                <Chip active={pos === null} onClick={() => setPos(null)}>{t('common.all')}</Chip>
                {posList.map(p => (
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
        <div className="border-t-3 border-structural p-6 bg-surface flex flex-wrap items-center justify-between gap-4">
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
      className={`px-3 py-1.5 border-2 rounded-[var(--radius-sm)] font-black text-xs cursor-pointer transition-all ${active ? 'border-ink bg-ink text-paper' : 'border-structural hover:bg-surface'}`}
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
      className="border-3 border-structural shadow-[var(--shadow-brutal)] p-4 sm:p-8 bg-paper mb-6 cursor-pointer min-h-[300px] flex flex-col items-center justify-center text-center transition-all hover:shadow-[var(--shadow-brutal-hover)] hover:-translate-x-0.5 hover:-translate-y-0.5"
      onClick={onFlip}
    >
      {!flipped ? (
        <>
          <div className="text-xs font-bold uppercase tracking-widest text-muted mb-6">
            {cardType === 'meaning' ? t('review.whatMeaning') :
             cardType === 'reading' ? t('review.howRead') : t('review.whatWord')}
          </div>
          <div className="text-[clamp(2.25rem,10vw,3.75rem)] font-black jp leading-none mb-4 break-words">
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
          <div className="text-[clamp(2rem,9vw,3rem)] font-black jp leading-none my-4 break-words">
            <Furigana kanji={entry.kanji} kana={entry.kana} />
          </div>
          <PitchAccent kana={entry.kana} pitch={entry.pitch} size="md" showLabel className="mb-2" />
          <div className="text-2xl font-bold mb-2">{localize(entry.meanings)}</div>
          {entry.chapter !== undefined && entry.chapter > 0 && (
            <div className="text-xs text-muted font-bold uppercase">{t('common.chapterN', { n: entry.chapter })}</div>
          )}
          {entry.category && (
            <div className="text-xs text-muted font-bold uppercase">{entry.category}</div>
          )}
          {entry.examples.length > 0 && (
            <div className="mt-6 text-left w-full border-t-3 border-structural pt-4">
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
  const { t, localize } = useTranslation()
  // Real example sentences don't exist yet for individual kanji words (or
  // for vocab entries in general — vocabulary.json's examples[] is empty
  // app-wide), so context comes from real sibling words in the same
  // leading-kanji family instead of fabricated sentences.
  const siblings = group.words.filter(w => w !== word).slice(0, 3)

  return (
    <div
      className="border-3 border-structural shadow-[var(--shadow-brutal)] p-4 sm:p-8 bg-paper mb-6 cursor-pointer min-h-[300px] flex flex-col items-center justify-center text-center transition-all hover:shadow-[var(--shadow-brutal-hover)] hover:-translate-x-0.5 hover:-translate-y-0.5"
      onClick={onFlip}
    >
      {!flipped ? (
        <>
          <div className="text-xs font-bold uppercase tracking-widest text-muted mb-6">
            {t('review.kanjiQuestion')}
          </div>
          <div className="text-[clamp(2.25rem,10vw,3.75rem)] font-black jp leading-[2.2] mb-4 break-words">
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
              <span className="text-sm font-black px-2 py-1 border-2 border-structural rounded-[var(--radius-sm)] bg-surface">{word.hanviet}</span>
            )}
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: onkunTone(word.onkun) }}>
              {word.onkun}
            </span>
            <span className="text-xs text-muted font-bold uppercase ml-auto">{t('common.chapterN', { n: chapterNum })}</span>
          </div>
          <div className="text-[clamp(2rem,9vw,3rem)] font-black jp leading-[2] mb-4 break-words">
            <Furigana kanji={word.kanji} kana={word.kana} />
          </div>
          <div className="text-2xl font-bold mb-2">{localize(word.meaning)}</div>
          <div className="text-xs text-muted font-bold uppercase tracking-wider">
            {t('review.sameGroup')} <span className="jp text-sm text-ink">{group.anchor}</span>
          </div>

          {siblings.length > 0 && (
            <div className="mt-6 text-left w-full border-t-3 border-structural pt-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">{t('review.siblingWords')}</div>
              <ul className="space-y-1.5">
                {siblings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="jp font-bold leading-snug shrink-0 min-w-[3.5rem]">
                      <Furigana kanji={w.kanji} kana={w.kana} />
                    </span>
                    <span className="flex-1 min-w-0 leading-snug">
                      <span>{localize(w.meaning)}</span>
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

// Binary rating only (Forgot/Remembered) -- casual use, not strict SM-2
// drilling. The underlying reviewCard/SM-2 math is untouched; this just
// always feeds it one of the two extremes (RATING.AGAIN / RATING.GOOD)
// instead of exposing all four quality buckets.
const RATING_BUTTONS = [
  { key: '1', labelKey: 'forgot', sub: 'Learn again', rating: RATING.AGAIN, variant: 'red' },
  { key: '2', labelKey: 'remembered', sub: 'Got it', rating: RATING.GOOD, variant: 'green' },
] as const

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || (el as HTMLElement).isContentEditable
}

function RatingBar({ flipped, onFlip, onRate, onAdvance }: {
  flipped: boolean; onFlip: () => void
  onRate: (rating: number) => void; onAdvance: (rating: number) => void
}) {
  const [flashRating, setFlashRating] = useState<number | null>(null)
  const [flashFlip, setFlashFlip] = useState(false)
  const { t } = useTranslation()

  // Space flips the card; 1/2 rate it once the answer is showing.
  // Only one of the two is ever live at a time (rating buttons don't exist
  // pre-flip), and neither fires while the user is typing into a future
  // <input>/<textarea>.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(document.activeElement)) return

      if (!flipped) {
        const isSpace = e.key === ' ' || e.code === 'Space'
        const isEnter = e.key === 'Enter'
        if (!isSpace && !isEnter) return
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
      setTimeout(() => onAdvance(match.rating), 150)
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
    <div className="grid grid-cols-2 gap-3">
      {RATING_BUTTONS.map(({ key, labelKey, sub, rating, variant }) => (
        <Button
          key={labelKey}
          variant={variant as any}
          className={`relative flex flex-col gap-0.5 py-3 transition-all ${
            flashRating === rating ? 'shadow-none translate-x-0.5 translate-y-0.5' : ''
          }`}
          onClick={() => { onRate(rating); onAdvance(rating) }}
        >
          <span className="absolute top-1 left-1.5 text-[10px] font-bold opacity-50">{key}</span>
          <span className="font-black">{t(`review.rating.${labelKey}`)}</span>
          <span className="text-xs opacity-70 font-bold">{sub}</span>
        </Button>
      ))}
    </div>
  )
}
