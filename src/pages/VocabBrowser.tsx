import { useState, useMemo, useEffect, useDeferredValue, useRef, memo } from "react"
import { vocabForLevel, allVocab, romajiCache } from "@/data/vocab"
import type { VocabEntry } from "@/types"
import { Furigana } from "@/components/ui/Furigana"
import { PosTag } from "@/components/ui/PosTag"
import { PitchAccent } from "@/components/ui/PitchAccent"
import { useVocabStore } from "@/store/vocab-store"
import { useSettingsStore } from "@/store/settings-store"
import { useTranslation } from "@/lib/useTranslation"
import { KanjiDrawer } from "@/components/kanji/KanjiDrawer"
import { SpeakButton } from "@/components/ui/SpeakButton"
import { prefetchVoicevox } from "@/lib/speech"
import { Watermark } from "@/components/ui/ScreenHeader"
import { groupKey, compareGroupKeys, isChapterKey } from "@/lib/vocab-grouping"
import { useProgressiveList } from "@/lib/useProgressiveList"

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false
  const tag = el.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || (el as HTMLElement).isContentEditable
}

// ---------------------------------------------------------------------------
// Memoized row – only the two rows that change selected state will re-render
// when the user clicks (instead of every single row in the list).
// ---------------------------------------------------------------------------
interface VocabRowProps {
  v: VocabEntry
  /** Pre-resolved index in the filtered array – avoids an O(n) findIndex on click. */
  index: number
  isSelected: boolean
  /** Passed as a scalar so React.memo can do a cheap equality check. */
  cardState: string
  onSelect: (index: number) => void
  localize: (m: { vi: string; en: string } | undefined | null) => string
}

const VocabRow = memo(function VocabRow({
  v,
  index,
  isSelected,
  cardState,
  onSelect,
  localize,
}: VocabRowProps) {
  return (
    // content-visibility lets the browser skip layout/paint for rows scrolled
    // off-screen -- after scrolling deep, hundreds of rows stay mounted, and
    // this keeps scrolling and theme switches from touching all of them.
    // A <div role="button"> rather than a real <button> -- SpeakButton below
    // needs to be a real, independently-clickable <button>, and a <button>
    // nested inside a <button> is invalid HTML (KanjiGroupCard uses the same
    // pattern for its own nested anchor-click button).
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(index)}
      onKeyDown={e => {
        // Ignore a keydown that bubbled up from the nested SpeakButton --
        // otherwise Enter/Space on it both speaks *and* opens the row.
        if (e.target !== e.currentTarget) return
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(index) }
      }}
      className={`w-full text-left px-4 py-3 border-b border-ink/20 flex items-center gap-4 hover:bg-surface transition-colors cursor-pointer [content-visibility:auto] [contain-intrinsic-size:auto_72px] ${
        isSelected ? "bg-ink text-paper" : ""
      }`}
    >
      <div className="flex-1">
        <div className="font-bold text-lg jp leading-tight flex items-center gap-2">
          <Furigana kanji={v.kanji} kana={v.kana} />
          <PitchAccent kana={v.kana} pitch={v.pitch} />
          <SpeakButton text={v.kana} />
        </div>
        <div className={`text-xs mt-0.5 ${isSelected ? "text-paper/70" : "text-muted"}`}>
          {localize(v.meanings).slice(0, 60)}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <PosTag pos={v.pos} verbGroup={v.verbGroup} />
        {cardState !== "new" && (
          <span
            className={`text-xs font-bold px-1.5 py-0.5 border border-current ${
              cardState === "mastered"
                ? "text-green"
                : cardState === "review"
                ? "text-yellow"
                : cardState === "learning"
                ? "text-blue"
                : "text-muted"
            }`}
          >
            {cardState}
          </span>
        )}
      </div>
    </div>
  )
})

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export function VocabBrowser() {
  // rawSearch drives the input and updates immediately; the list reads the
  // deferred copy, so React paints the keystroke first and renders the new
  // results as interruptible background work instead of blocking typing.
  const [rawSearch, setRawSearch] = useState("")
  const search = useDeferredValue(rawSearch)

  const [chapter, setChapter] = useState<string | null>(null)
  const [pos, setPos] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // Read the whole cards object once per render instead of calling getCard()
  // N times inside the render loop (each getCard() call was a separate store read).
  const cards = useVocabStore(s => s.cards)

  const level = useSettingsStore(s => s.level)
  const { t, localize } = useTranslation()

  const vocab = useMemo(() => vocabForLevel(level), [level])
  const CHAPTERS = useMemo(
    () => Array.from(new Set(vocab.map(groupKey))).sort(compareGroupKeys),
    [vocab]
  )
  // N4 (and 'all', which mixes both levels) can list both chapter numbers
  // and category names -- only fall back to the plain "All categories"
  // label when there's genuinely no chapter data to show alongside it.
  const hasChapterKeys = useMemo(() => CHAPTERS.some(isChapterKey), [CHAPTERS])
  const POS_LIST = useMemo(() => Array.from(new Set(vocab.map(v => v.pos))).sort(), [vocab])

  // Reset the group filter across a level switch -- a chapter number from
  // N5 or a category name from N4 has no meaning once vocab has switched.
  useEffect(() => setChapter(null), [level])

  const filtered = useMemo(() => {
    return vocab.filter(v => {
      if (chapter !== null && groupKey(v) !== chapter) return false
      if (pos !== null && v.pos !== pos) return false
      if (search) {
        const q = search.toLowerCase()
        // romajiCache.get() is an O(1) Map lookup – the pre-converted romaji
        // string was built once at startup, not re-derived here.
        return (
          v.kanji.includes(q) ||
          v.kana.includes(q) ||
          localize(v.meanings).toLowerCase().includes(q) ||
          (romajiCache.get(v.id)?.includes(q) ?? false)
        )
      }
      return true
    })
  }, [vocab, search, chapter, pos, localize])

  // O(1) id → index map so VocabRow.onClick doesn't do a linear findIndex.
  const filteredIndexMap = useMemo(
    () => new Map(filtered.map((v, i) => [v.id, i])),
    [filtered]
  )

  // Only a window of `filtered` is mounted at a time (see useProgressiveList)
  // -- the count, the index map, and the modal's prev/next all keep using the
  // full `filtered` array; only the row rendering is sliced.
  const listRef = useRef<HTMLDivElement>(null)
  const { visible, sentinelRef, hasMore } = useProgressiveList(filtered, 60, listRef)

  // Chapter header counts come from the full result set, not the rendered
  // window, so a partially-rendered chapter doesn't show a truncated total.
  const groupTotals = useMemo(() => {
    const totals = new Map<string, number>()
    for (const v of filtered) {
      const k = groupKey(v)
      totals.set(k, (totals.get(k) ?? 0) + 1)
    }
    return totals
  }, [filtered])

  const groupedByChapter = useMemo(() => {
    const map = new Map<string, VocabEntry[]>()
    for (const v of visible) {
      const k = groupKey(v)
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(v)
    }
    return [...map.entries()].sort(([a], [b]) => compareGroupKeys(a, b))
  }, [visible])

  // Derive selected ID so VocabRow receives a simple string for isSelected;
  // React.memo can then short-circuit with a cheap string comparison.
  const selectedId = selectedIndex !== null ? (filtered[selectedIndex]?.id ?? null) : null

  return (
    <div className="flex h-full overflow-hidden">
      {/* List panel */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <Watermark char="語" />
        {/* Toolbar */}
        <div className="p-4 border-b-3 border-structural flex gap-3 flex-wrap bg-surface">
          <input
            value={rawSearch}
            onChange={e => setRawSearch(e.target.value)}
            placeholder={t("vocab.searchPlaceholder")}
            className="flex-1 min-w-[200px] px-4 py-2 border-3 border-structural font-sans font-bold text-sm bg-paper focus:outline-none focus:shadow-[2px_2px_0px_var(--color-blue)]"
          />
          <select
            value={chapter ?? ""}
            onChange={e => setChapter(e.target.value || null)}
            className="px-3 py-2 border-3 border-structural font-bold text-sm bg-paper cursor-pointer"
          >
            <option value="">
              {level === "N5"
                ? t("vocab.allChapters")
                : hasChapterKeys
                ? t("vocab.allChaptersCategories")
                : t("vocab.allCategories")}
            </option>
            {CHAPTERS.map(c => (
              <option key={c} value={c}>
                {isChapterKey(c) ? t("common.chapterN", { n: c }) : c}
              </option>
            ))}
          </select>
          <select
            value={pos ?? ""}
            onChange={e => setPos(e.target.value || null)}
            className="px-3 py-2 border-3 border-structural font-bold text-sm bg-paper cursor-pointer"
          >
            <option value="">{t("vocab.allPos")}</option>
            {POS_LIST.map(p => (
              <option key={p} value={p}>
                {t(`pos.${p}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Count */}
        <div className="px-4 py-2 border-b-3 border-structural bg-paper text-xs font-bold uppercase tracking-wider text-muted">
          {t("common.wordsCount", { n: filtered.length })}
        </div>

        {/* Word list, grouped and sorted by chapter */}
        <div ref={listRef} className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
          {groupedByChapter.map(([chapterNum, items]) => (
            <div key={chapterNum}>
              <div className="sticky top-0 z-10 px-4 py-1.5 bg-ink text-paper text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <span>
                  {chapterNum === "?"
                    ? t("vocab.unknownChapter")
                    : isChapterKey(chapterNum)
                    ? t("common.chapterN", { n: chapterNum })
                    : chapterNum}
                </span>
                <span className="text-paper/60 font-bold">{groupTotals.get(chapterNum) ?? items.length}</span>
              </div>
              {items.map(v => (
                <VocabRow
                  key={v.id}
                  v={v}
                  index={filteredIndexMap.get(v.id)!}
                  isSelected={v.id === selectedId}
                  cardState={cards[v.id]?.state ?? "new"}
                  onSelect={setSelectedIndex}
                  localize={localize}
                />
              ))}
            </div>
          ))}
          {hasMore && <div ref={sentinelRef} className="h-px" aria-hidden="true" />}
        </div>
      </div>

      {/* Detail modal */}
      {selectedIndex !== null && filtered[selectedIndex] && (
        <VocabModal
          vocab={filtered[selectedIndex]}
          index={selectedIndex}
          total={filtered.length}
          onPrev={() => setSelectedIndex(i => (i !== null && i > 0 ? i - 1 : i))}
          onNext={() =>
            setSelectedIndex(i => (i !== null && i < filtered.length - 1 ? i + 1 : i))
          }
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </div>
  )
}

function VocabModal({
  vocab,
  index,
  total,
  onPrev,
  onNext,
  onClose,
}: {
  vocab: VocabEntry
  index: number
  total: number
  onPrev: () => void
  onNext: () => void
  onClose: () => void
}) {
  const { t, localize } = useTranslation()
  const [selectedKanji, setSelectedKanji] = useState<string | null>(null)
  const hasPrev = index > 0
  const hasNext = index < total - 1

  // A stroke-order drawing left open shouldn't linger behind a different word.
  useEffect(() => setSelectedKanji(null), [vocab.id])

  // Warms the VOICEVOX cache for this word and its examples as soon as the
  // modal opens -- by the time someone's actually read the word and reached
  // for a speaker button, the ~1-3s of synthesis has usually already
  // happened in the background, instead of them hearing it after a wait.
  // A no-op (see prefetchVoicevox) once VOICEVOX isn't the active backend.
  useEffect(() => {
    // Shortest first -- the bare word reading (fast to synthesize) is the
    // single most likely tap, and the queue is one-at-a-time, so it should
    // be the one ready soonest. Capped at the first example, not every one:
    // each sentence costs a few real seconds of the engine's CPU, and this
    // isn't the only place trying to prefetch something.
    prefetchVoicevox([vocab.kana, vocab.examples[0]?.ja ?? ""])
    // Whatever's still waiting to *start* (not already mid-fetch, which
    // finishes and gets cached regardless) is dropped once this word's no
    // longer the one on screen -- otherwise it competes for the engine's
    // CPU with whatever tap actually happens next, which is usually not in
    // this modal at all by the time this word's clips would have been done.
    return () => prefetchVoicevox([])
  }, [vocab])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(document.activeElement)) return
      // While the kanji drawer is open, let its own Escape handler close it
      // first rather than closing both layers on one keypress.
      if (selectedKanji !== null) return
      if (e.key === "Escape") {
        onClose()
        return
      }
      if (e.key === "ArrowLeft" && hasPrev) {
        e.preventDefault()
        onPrev()
        return
      }
      if (e.key === "ArrowRight" && hasNext) {
        e.preventDefault()
        onNext()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [selectedKanji, hasPrev, hasNext, onPrev, onNext, onClose])

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-30 bg-ink/40 lg:bg-ink/30 lg:backdrop-blur-sm"
      />
      <div className="fixed inset-0 z-30 flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          onClick={e => e.stopPropagation()}
          className="pointer-events-auto w-full max-w-lg max-h-[85dvh] overflow-y-auto border-3 border-structural shadow-[var(--shadow-brutal)] bg-paper"
        >
          {/* List navigation */}
          <div className="flex items-center gap-3 p-3 border-b-3 border-structural bg-surface">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              title={t("vocab.prevWord")}
              className="w-11 h-11 border-2 border-structural font-black text-lg flex items-center justify-center hover:bg-paper disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            <div className="flex-1 text-center text-xs font-bold uppercase tracking-wider text-muted">
              {index + 1} / {total}
            </div>
            <button
              onClick={onNext}
              disabled={!hasNext}
              title={t("vocab.nextWord")}
              className="w-11 h-11 border-2 border-structural font-black text-lg flex items-center justify-center hover:bg-paper disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
          </div>

          {/* Header */}
          <div className="p-4 sm:p-6 border-b-3 border-structural">
            <div className="flex justify-between items-start mb-4">
              <PosTag pos={vocab.pos} verbGroup={vocab.verbGroup} />
              <button onClick={onClose} className="font-black text-lg hover:text-red transition-colors">
                ×
              </button>
            </div>
            <div className="flex items-start gap-2 mb-3">
              <div className="text-[clamp(2rem,9vw,3rem)] font-black jp leading-none break-words">
                <Furigana kanji={vocab.kanji} kana={vocab.kana} onKanjiClick={setSelectedKanji} />
              </div>
              <SpeakButton text={vocab.kana} size="md" className="mt-2" />
            </div>
            {vocab.kanji !== vocab.kana && vocab.kana && (
              <div className="text-xl jp text-muted font-bold">{vocab.kana}</div>
            )}
            <PitchAccent kana={vocab.kana} pitch={vocab.pitch} size="md" showLabel className="mt-2" />
            <div className="font-bold text-lg mt-3">{localize(vocab.meanings)}</div>
            {vocab.chapter !== undefined && vocab.chapter > 0 && (
              <div className="text-xs text-muted uppercase tracking-wider mt-2 font-bold">
                {t("common.chapterN", { n: vocab.chapter })}
              </div>
            )}
            {vocab.category && (
              <div className="text-xs text-muted uppercase tracking-wider mt-2 font-bold">
                {vocab.category}
              </div>
            )}
          </div>

          {/* Examples */}
          {vocab.examples.length > 0 && (
            <div className="p-6 border-b-3 border-structural">
              <div className="text-xs font-black uppercase tracking-wider mb-4">
                {t("common.examples")}
              </div>
              {vocab.examples.map((ex, i) => (
                <div key={i} className="mb-4 last:mb-0">
                  <div className="flex items-start gap-2">
                    <div className="jp font-bold text-base">{ex.ja}</div>
                    <SpeakButton text={ex.ja} />
                  </div>
                  {ex.kana && <div className="jp text-xs text-muted mt-0.5">{ex.kana}</div>}
                  <div className="text-sm text-muted mt-1">{localize({ vi: ex.vi, en: ex.en })}</div>
                </div>
              ))}
            </div>
          )}

          {/* Homophones */}
          {vocab.homophones.length > 0 && (
            <div className="p-6">
              <div className="text-xs font-black uppercase tracking-wider mb-3">
                {t("vocab.homophones")}
              </div>
              <div className="flex flex-wrap gap-2">
                {vocab.homophones.map(id => {
                  const hw = allVocab.find(v => v.id === id)
                  if (!hw) return null
                  return (
                    <div key={id} className="border-3 border-structural px-3 py-1 shadow-[var(--shadow-brutal)]">
                      <div className="font-bold flex items-center gap-1.5">
                        <Furigana kanji={hw.kanji || hw.kana} kana={hw.kana} />
                        <PitchAccent kana={hw.kana} pitch={hw.pitch} />
                      </div>
                      <div className="text-xs text-muted">{localize(hw.meanings).slice(0, 20)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <KanjiDrawer char={selectedKanji} onClose={() => setSelectedKanji(null)} />
    </>
  )
}
