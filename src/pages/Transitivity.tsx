import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { transitivityPatterns, verbPairs, IRREGULAR_PATTERN_ID } from "@/data/transitivity"
import { getGrammar } from "@/data/grammar"
import type { VerbTransitivityPair } from "@/types"
import { Furigana } from "@/components/ui/Furigana"
import { Card } from "@/components/ui/Card"
import { Reveal } from "@/components/ui/Reveal"
import { useTranslation } from "@/lib/useTranslation"
import { useSettingsStore } from "@/store/settings-store"
import { Watermark } from "@/components/ui/ScreenHeader"

const TRANS_COLOR = "var(--color-blue)"
const INTRANS_COLOR = "var(--color-green)"

export function Transitivity() {
  const navigate = useNavigate()
  const { t, localize } = useTranslation()
  const level = useSettingsStore(s => s.level)
  const [search, setSearch] = useState("")
  const [activePattern, setActivePattern] = useState<string | null>(null)

  const query = search.trim().toLowerCase()
  const matches = useMemo(() => {
    if (!query) return null
    return new Set(
      verbPairs
        .filter(p => {
          const haystack = [
            p.transitive.kanji, p.transitive.kana, p.transitive.meaning.vi, p.transitive.meaning.en,
            p.intransitive.kanji, p.intransitive.kana, p.intransitive.meaning.vi, p.intransitive.meaning.en,
          ].join(" ").toLowerCase()
          return haystack.includes(query)
        })
        .map(p => p.id)
    )
  }, [query])

  const patternsToShow = activePattern ? transitivityPatterns.filter(pt => pt.id === activePattern) : transitivityPatterns

  // Chapter 19 grammar (Nを+他動詞, N（は/が）+自動詞, てある x2) -- level-aware
  // like VerbForms' relatedGrammar, so an N5-only view shows nothing rather
  // than a cross-link to a point outside the current scope.
  const relatedGrammar = useMemo(
    () => getGrammar(level).filter(g => g.category === "transitive-intransitive"),
    [level]
  )

  return (
    <div className="h-full overflow-y-auto">
      <div className="relative max-w-5xl mx-auto p-6 overflow-hidden">
        <Watermark char="対" />

        {/* Header */}
        <div className="mb-8">
          <div className="text-xs font-bold uppercase tracking-widest text-muted mb-2">N4 · 自動詞と他動詞</div>
          <div className="text-4xl font-black leading-tight">
            <Furigana kanji="自動詞と他動詞" kana="じどうしとたどうし" />
          </div>
          <div className="text-sm font-bold uppercase tracking-wider text-muted mt-1">{t('transitivity.subtitle')}</div>
        </div>

        {/* Concept explainer -- を vs が */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="jp font-black text-xl" style={{ color: TRANS_COLOR }}>他動詞</span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted">{t('transitivity.transitive')}</span>
            </div>
            <p className="text-sm text-muted leading-relaxed mb-3">{t('transitivity.transitiveExplain')}</p>
            <div className="border-2 border-structural rounded-[var(--radius-sm)] bg-surface px-3 py-2 text-sm font-bold">
              <Furigana kanji="誰かが窓を開けました。" kana="だれかがまどをあけました。" />
              <div className="text-xs font-normal text-muted mt-1">{t('transitivity.exampleTransitiveCaption')}</div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="jp font-black text-xl" style={{ color: INTRANS_COLOR }}>自動詞</span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted">{t('transitivity.intransitive')}</span>
            </div>
            <p className="text-sm text-muted leading-relaxed mb-3">{t('transitivity.intransitiveExplain')}</p>
            <div className="border-2 border-structural rounded-[var(--radius-sm)] bg-surface px-3 py-2 text-sm font-bold">
              <Furigana kanji="窓が開いています。" kana="まどがあいています。" />
              <div className="text-xs font-normal text-muted mt-1">{t('transitivity.exampleIntransitiveCaption')}</div>
            </div>
          </Card>
        </div>

        {/* Chapter 19 tie-in -- てある vs ている (vs ておく, prose-only: no
            grammar point for it in the dataset yet) */}
        <div className="border-3 border-structural bg-yellow/20 p-5 mb-8">
          <div className="text-xs font-black uppercase tracking-wider mb-3">{t('transitivity.chapterTieIn')}</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div className="border-2 border-structural rounded-[var(--radius-sm)] bg-paper p-3">
              <div className="jp font-black text-sm mb-1">他動詞 + てある</div>
              <Furigana className="text-sm font-bold" kanji="窓が開けてあります。" kana="まどがあけてあります。" />
              <p className="text-xs text-muted mt-2 leading-relaxed">{t('transitivity.teAruNote')}</p>
            </div>
            <div className="border-2 border-structural rounded-[var(--radius-sm)] bg-paper p-3">
              <div className="jp font-black text-sm mb-1">自動詞 + ている</div>
              <Furigana className="text-sm font-bold" kanji="窓が開いています。" kana="まどがあいています。" />
              <p className="text-xs text-muted mt-2 leading-relaxed">{t('transitivity.teIruNote')}</p>
            </div>
            <div className="border-2 border-structural rounded-[var(--radius-sm)] bg-paper p-3">
              <div className="jp font-black text-sm mb-1">他動詞 + ておく</div>
              <Furigana className="text-sm font-bold" kanji="窓を開けておきます。" kana="まどをあけておきます。" />
              <p className="text-xs text-muted mt-2 leading-relaxed">{t('transitivity.teOkuNote')}</p>
            </div>
          </div>
          <p className="text-xs text-muted leading-relaxed">{t('transitivity.chapterTieInFooter')}</p>

          {relatedGrammar.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 mt-4">
              {relatedGrammar.map(g => (
                <button
                  key={g.id}
                  onClick={() => navigate(`/grammar?point=${g.id}`)}
                  className="group shrink-0 w-56 text-left border-3 border-structural bg-paper p-3 cursor-pointer transition-all hover:shadow-[var(--shadow-brutal-hover)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                  style={{ borderLeftWidth: '6px', borderLeftColor: 'var(--color-blue)' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="jp font-bold text-sm leading-snug">{g.pattern}</div>
                    <span className="shrink-0 mt-0.5 text-muted group-hover:text-ink group-hover:translate-x-0.5 transition-all">→</span>
                  </div>
                  <div className="text-xs mt-2 leading-relaxed text-muted">{localize(g.meaning)}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pattern recognition table */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="font-black text-base">{t('transitivity.patternsTitle')}</span>
            {activePattern && (
              <button onClick={() => setActivePattern(null)} className="text-xs font-bold text-muted hover:text-red underline cursor-pointer">
                {t('transitivity.clearPatternFilter')}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {transitivityPatterns.map(pt => {
              const isIrregular = pt.id === IRREGULAR_PATTERN_ID
              const active = activePattern === pt.id
              return (
                <button
                  key={pt.id}
                  onClick={() => setActivePattern(active ? null : pt.id)}
                  className={`text-left border-3 p-3 cursor-pointer transition-all ${
                    active ? 'border-ink bg-ink text-paper' : 'border-structural bg-paper hover:shadow-[var(--shadow-brutal-hover)] hover:-translate-x-0.5 hover:-translate-y-0.5'
                  }`}
                >
                  <div className="font-mono font-black text-sm mb-1">
                    {isIrregular ? t('transitivity.irregular') : pt.label}
                  </div>
                  {!isIrregular && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                      <span className={active ? 'opacity-80' : ''} style={{ color: active ? undefined : INTRANS_COLOR }}>{pt.intransitiveEnding}</span>
                      <span className="opacity-50">⇄</span>
                      <span className={active ? 'opacity-80' : ''} style={{ color: active ? undefined : TRANS_COLOR }}>{pt.transitiveEnding}</span>
                    </div>
                  )}
                  <p className={`text-xs leading-relaxed ${active ? 'opacity-90' : 'text-muted'}`}>{localize(pt.description)}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('transitivity.searchPlaceholder')}
            className="w-full px-4 py-2 border-3 border-structural font-sans font-bold text-sm bg-paper focus:outline-none focus:shadow-[2px_2px_0px_var(--color-blue)]"
          />
        </div>

        {/* Verb pair list, grouped by pattern */}
        <div className="mb-8 space-y-8">
          {patternsToShow.map(pt => {
            const pairs = verbPairs.filter(p => p.patternId === pt.id && (!matches || matches.has(p.id)))
            if (pairs.length === 0) return null
            return (
              <div key={pt.id}>
                <div className="flex items-baseline gap-2 mb-3 border-b-2 border-structural pb-1.5">
                  <span className="font-mono font-black text-sm">
                    {pt.id === IRREGULAR_PATTERN_ID ? t('transitivity.irregular') : pt.label}
                  </span>
                  <span className="text-xs font-bold text-muted">{t('common.wordsCount', { n: pairs.length })}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pairs.map((p, i) => <VerbPairCard key={p.id} pair={p} index={i} localize={localize} t={t} />)}
                </div>
              </div>
            )
          })}
          {matches && matches.size === 0 && (
            <p className="text-sm text-muted text-center py-8">{t('transitivity.noResults')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function VerbPairCard({
  pair, index, localize, t,
}: {
  pair: VerbTransitivityPair
  index: number
  localize: (m: { vi: string; en: string } | undefined | null) => string
  t: (key: string, vars?: Record<string, string | number>) => string
}) {
  return (
    <Reveal index={index} className="h-full">
      <Card className="p-0 overflow-hidden h-full flex flex-col">
        <VerbHalfRow half={pair.transitive} label={t('transitivity.transitiveTag')} color={TRANS_COLOR} particle="を" localize={localize} />
        <div className="border-t-2 border-dashed border-structural/40" />
        <VerbHalfRow half={pair.intransitive} label={t('transitivity.intransitiveTag')} color={INTRANS_COLOR} particle="が" localize={localize} />
        {pair.note && (
          <div className="px-4 py-2.5 border-t-3 border-structural bg-red/5 text-xs text-red font-bold leading-relaxed">
            {localize(pair.note)}
          </div>
        )}
      </Card>
    </Reveal>
  )
}

function VerbHalfRow({
  half, label, color, particle, localize,
}: {
  half: VerbTransitivityPair['transitive']
  label: string
  color: string
  particle: string
  localize: (m: { vi: string; en: string } | undefined | null) => string
}) {
  return (
    <div className="p-4 flex-1">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <Furigana className="text-xl font-black" kanji={half.kanji} kana={half.kana} />
        <span
          className="font-mono shrink-0 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2 border-structural rounded-[var(--radius-sm)] text-paper"
          style={{ backgroundColor: color }}
        >
          {label} {particle}
        </span>
      </div>
      <div className="text-sm font-bold text-muted mb-2">{localize(half.meaning)}</div>
      <div className="border-2 border-structural rounded-[var(--radius-sm)] bg-surface px-3 py-2">
        <Furigana className="text-sm font-bold" kanji={half.example.ja} kana={half.example.kana} />
        <div className="text-xs font-normal text-muted mt-1">{localize(half.example)}</div>
      </div>
    </div>
  )
}
