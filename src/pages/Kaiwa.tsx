import { memo, useCallback, useDeferredValue, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { kaiwaQuestions, kaiwaSets, kaiwaTopics } from "@/data/kaiwa"
import { getGrammarLinks } from "@/data/grammar-links"
import { n5 as n5GrammarLinks, n4 as n4GrammarLinks } from "virtual:grammar-index"
import type { GrammarLink, KaiwaQuestion } from "@/types"
import { Furigana } from "@/components/ui/Furigana"
import { Card } from "@/components/ui/Card"
import { Reveal } from "@/components/ui/Reveal"
import { SpeakButton } from "@/components/ui/SpeakButton"
import { Watermark } from "@/components/ui/ScreenHeader"
import { useTranslation } from "@/lib/useTranslation"
import { useSettingsStore, type Level } from "@/store/settings-store"
import { useProgressiveList } from "@/lib/useProgressiveList"

type Localize = (m: { vi: string; en: string } | undefined | null) => string
type T = (key: string, vars?: Record<string, string | number>) => string

const questionsById: Record<string, KaiwaQuestion> = Object.fromEntries(kaiwaQuestions.map(q => [q.id, q]))

// Which level a cross-linked grammar id belongs to -- needed because Kaiwa
// deliberately mixes N5 and N4 patterns, but /grammar?point=<id> only
// resolves against whatever level the sidebar currently has selected (see
// Grammar.tsx's level-scoped `grammar.find`). A chip click switches the
// sidebar level first so the target always resolves, regardless of what a
// learner happened to have selected while browsing Kaiwa.
const grammarLevelById: Record<string, Level> = Object.fromEntries([
  ...n5GrammarLinks.map(g => [g.id, "N5" as Level]),
  ...n4GrammarLinks.map(g => [g.id, "N4" as Level]),
])

function haystackOf(q: KaiwaQuestion) {
  return [q.ja, q.kana, q.answer.ja, q.answer.vi, q.tip.vi, kaiwaTopics[q.topic]?.vi]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

export function Kaiwa() {
  const routerNavigate = useNavigate()
  const navigate = useCallback((to: string) => { routerNavigate(to) }, [routerNavigate])
  const { t, localize } = useTranslation()
  const level = useSettingsStore(s => s.level)
  const setLevel = useSettingsStore(s => s.setLevel)
  const [search, setSearch] = useState("")
  // Input reads `search`; the list reads the deferred copy so typing paints
  // first and the card re-render never blocks the next keystroke.
  const deferredSearch = useDeferredValue(search)

  // Grammar chips mix N5 and N4 patterns by design (see grammarLevelById
  // above), so chip labels always resolve from the combined set regardless
  // of the sidebar's current level -- same reasoning as Usage.tsx's
  // level-scoped lookup, just scoped to "all" instead of the live level.
  const grammarById = useMemo(
    () => Object.fromEntries(getGrammarLinks("all").map(g => [g.id, g])) as Record<string, GrammarLink>,
    []
  )

  const query = deferredSearch.trim().toLowerCase()

  const visibleSets = useMemo(() => {
    return kaiwaSets
      .map(set => ({
        set,
        questions: set.questionIds.map(id => questionsById[id]).filter(q => !query || haystackOf(q).includes(query)),
      }))
      .filter(entry => entry.questions.length > 0)
  }, [query])

  // Sets mount a few at a time as the pane scrolls instead of all at once.
  const scrollRef = useRef<HTMLDivElement>(null)
  const { visible, sentinelRef, hasMore } = useProgressiveList(visibleSets, 4, scrollRef)

  // Stable identity so the memoized QuestionCards don't re-render on every
  // keystroke.
  const openGrammar = useCallback((g: GrammarLink) => {
    const target = grammarLevelById[g.id]
    if (target && level !== "all" && level !== target) setLevel(target)
    navigate(`/grammar?point=${g.id}`)
  }, [level, setLevel, navigate])

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto pb-[env(safe-area-inset-bottom)]">
      <div className="relative max-w-5xl mx-auto p-6 overflow-hidden">
        <Watermark char="話" />

        {/* Header */}
        <div className="mb-8">
          <div className="text-xs font-bold uppercase tracking-widest text-muted mb-2">N5 · N4 · 会話練習</div>
          <div className="text-4xl font-black leading-tight">
            <Furigana kanji="会話練習" kana="かいわれんしゅう" />
          </div>
          <div className="text-sm font-bold uppercase tracking-wider text-muted mt-1">{t("kaiwa.subtitle")}</div>
          <p className="text-sm text-muted leading-relaxed mt-3 max-w-2xl">{t("kaiwa.intro")}</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t("kaiwa.searchPlaceholder")}
            className="w-full px-4 py-2 border-3 border-structural font-sans font-bold text-sm bg-paper focus:outline-none focus:shadow-[2px_2px_0px_var(--color-blue)]"
          />
        </div>

        <div className="space-y-10 mb-8">
          {visible.map(({ set, questions }, i) => (
            <Reveal key={set.id} index={i}>
              <div>
                <div className="flex items-baseline gap-2 mb-3 border-b-2 border-structural pb-1.5">
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest w-7 h-7 shrink-0 flex items-center justify-center border-2 border-structural rounded-full bg-ink text-paper">
                    {set.id}
                  </span>
                  <span className="font-black text-sm">{t("kaiwa.setLabel", { n: set.id })}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {questions.map(q => (
                    <QuestionCard
                      key={`${set.id}-${q.id}`}
                      question={q}
                      t={t}
                      localize={localize}
                      grammarById={grammarById}
                      onGrammarClick={openGrammar}
                    />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
          {hasMore && <div ref={sentinelRef} className="h-px" />}
        </div>

        {visibleSets.length === 0 && (
          <p className="text-sm text-muted text-center py-8">{t("kaiwa.noResults")}</p>
        )}
      </div>
    </div>
  )
}

const QuestionCard = memo(function QuestionCard({
  question, t, localize, grammarById, onGrammarClick,
}: {
  question: KaiwaQuestion
  t: T
  localize: Localize
  grammarById: Record<string, GrammarLink>
  onGrammarClick: (g: GrammarLink) => void
}) {
  const [open, setOpen] = useState(false)
  const linkedGrammar = (question.grammarIds ?? []).map(id => grammarById[id]).filter((g): g is GrammarLink => !!g)

  return (
    <Card className="cv-auto p-0 overflow-hidden h-full flex flex-col">
      <div className="p-4 flex-1">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted mb-1.5">
          {localize(kaiwaTopics[question.topic])}
        </div>
        <div className="flex items-start gap-1.5 mb-3">
          <Furigana className="text-sm font-black leading-snug" kanji={question.ja} kana={question.kana} />
          <SpeakButton text={question.ja} />
        </div>

        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="text-xs font-black uppercase tracking-wider text-accent hover:underline cursor-pointer"
        >
          {open ? t("kaiwa.hideAnswer") : t("kaiwa.showAnswer")}
        </button>

        {open && (
          <div className="mt-3 space-y-2.5">
            <div className="border-2 border-structural rounded-[var(--radius-sm)] bg-surface px-3 py-2">
              <div className="flex items-start gap-1.5">
                <Furigana className="text-sm font-bold" kanji={question.answer.ja} kana={question.answer.kana} />
                <SpeakButton text={question.answer.ja} />
              </div>
              <div className="text-xs font-normal text-muted mt-1">{localize(question.answer)}</div>
            </div>

            <p className="text-xs leading-relaxed text-ink">{localize(question.tip)}</p>

            {linkedGrammar.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {linkedGrammar.map(g => (
                  <button
                    key={g.id}
                    onClick={() => onGrammarClick(g)}
                    className="group shrink-0 w-48 text-left border-3 border-structural bg-paper p-2.5 cursor-pointer transition-[box-shadow,transform] hover:shadow-[var(--shadow-brutal-hover)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                    style={{ borderLeftWidth: "6px", borderLeftColor: "var(--color-blue)" }}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="jp font-bold text-xs leading-snug">{g.pattern}</div>
                      <span className="shrink-0 mt-0.5 text-muted group-hover:text-ink group-hover:translate-x-0.5 transition-transform text-xs">→</span>
                    </div>
                    <div className="text-[11px] mt-1.5 leading-relaxed text-muted">{localize(g.meaning)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
})
