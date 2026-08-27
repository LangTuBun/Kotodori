import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import verbFormsData from "@/data/n5/verb-forms.json"
import { allGrammar, getGrammar, getGrammarCategories, getGrammarTips } from "@/data/grammar"
import type { GrammarPoint, ToneType, VerbFormsData } from "@/types"
import { Ruby } from "@/components/ui/Ruby"
import { Watermark } from "@/components/ui/ScreenHeader"
import { useTranslation } from "@/lib/useTranslation"
import { useSettingsStore, type Level } from "@/store/settings-store"
import { CollapsibleFilters } from "@/components/ui/CollapsibleFilters"
import { FormationMatrix } from "@/components/ui/FormationMatrix"
import { NotesAndTrapsCallout } from "@/components/ui/NotesAndTrapsCallout"
import { InteractiveExampleCard } from "@/components/ui/InteractiveExampleCard"

// Cross-references (relatedGrammar/opposingGrammar/notesAndPitfalls[].relatedGrammarId)
// can point across the N5/N4 boundary, so id -> pattern lookups always use the
// full combined set rather than whatever `level` currently has selected.
const patternById: Record<string, string> = Object.fromEntries(allGrammar.map(g => [g.id, g.pattern]))
const grammarById: Record<string, GrammarPoint> = Object.fromEntries(allGrammar.map(g => [g.id, g]))

const ALL_TONES: ToneType[] = ['formal', 'polite', 'casual', 'spoken', 'written', 'keigo', 'neutral']

// requiredVerbForm cross-links only exist for N5 grammar (verb-forms.json is
// N5-only, see handoff.md) -- the pill filter and its badges are simply
// inert (never match) on N4/all-scope grammar points rather than hidden.
const verbForms = (verbFormsData as unknown as VerbFormsData).forms

const LEVELS: { value: Level; label: string }[] = [
  { value: 'N5', label: 'N5' },
  { value: 'N4', label: 'N4' },
  { value: 'all', label: 'N5+N4' },
]

const ACCENTS = ['yellow', 'blue', 'red', 'green'] as const
const ACCENT_HEX: Record<string, string> = {
  yellow: 'var(--color-yellow)', blue: 'var(--color-blue)', red: 'var(--color-red)', green: 'var(--color-green)',
}
function accentFor(order: number) {
  return ACCENTS[(order - 1) % ACCENTS.length]
}

export function Grammar() {
  const { t, localize } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const level = useSettingsStore(s => s.level)
  const setLevel = useSettingsStore(s => s.setLevel)
  const grammar = useMemo(() => getGrammar(level), [level])
  const categories = useMemo(() => getGrammarCategories(level), [level])
  const tips = useMemo(() => getGrammarTips(level), [level])
  const [search, setSearch] = useState("")
  const [cat, setCat] = useState<string | null>(null)
  const [verbForm, setVerbForm] = useState<string | null>(null)
  const [tone, setTone] = useState<ToneType | null>(null)
  const [selected, setSelected] = useState<GrammarPoint | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [showTips, setShowTips] = useState(false)
  const [showFurigana, setShowFurigana] = useState(true)
  const [showRomaji, setShowRomaji] = useState(false)

  // Jumps the detail drawer to another grammar point by id -- used by
  // cross-reference links (notesAndPitfalls, relatedGrammar, opposingGrammar).
  // Deliberately does not touch `level`/`cat`: the target may belong to the
  // other JLPT level or a different category than what's currently listed,
  // and the drawer renders fine either way (category badge just degrades to
  // blank via the existing optional chaining below).
  function jumpTo(id: string) {
    const point = grammarById[id]
    if (point) setSelected(point)
  }

  // A stale category/point selection from before a level switch has no
  // meaning in the new level's category set -- clear it rather than showing
  // a detail drawer or filter chip for a point that's no longer listed.
  useEffect(() => {
    setCat(null)
    setTone(null)
    setSelected(null)
  }, [level])

  // Cross-navigation from the Verb Forms tab: /grammar?point=<id> opens
  // that point's detail drawer and makes sure its category is expanded.
  useEffect(() => {
    const pointId = searchParams.get('point')
    if (!pointId) return
    const point = grammar.find(g => g.id === pointId)
    if (point) {
      setSelected(point)
      setCollapsed(s => ({ ...s, [point.category]: false }))
    }
    setSearchParams(prev => { prev.delete('point'); return prev }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Which tones actually occur in the current level's data -- only render
  // tone filter chips that could possibly match something.
  const availableTones = useMemo(
    () => ALL_TONES.filter(tn => grammar.some(g => g.pragmatics?.tones?.includes(tn))),
    [grammar]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return grammar.filter(g => {
      if (cat && g.category !== cat) return false
      if (verbForm && !g.requiredVerbForm?.includes(verbForm)) return false
      if (tone && !g.pragmatics?.tones?.includes(tone)) return false
      if (q) {
        return (
          g.pattern.toLowerCase().includes(q) ||
          localize(g.meaning).toLowerCase().includes(q) ||
          g.num.includes(q) ||
          (g.patternRomaji?.toLowerCase().includes(q) ?? false) ||
          (g.tags?.some(tg => tg.toLowerCase().includes(q)) ?? false)
        )
      }
      return true
    })
  }, [grammar, search, cat, verbForm, tone, localize])

  const byCategory = useMemo(() => {
    const map = new Map<string, GrammarPoint[]>()
    for (const g of filtered) {
      if (!map.has(g.category)) map.set(g.category, [])
      map.get(g.category)!.push(g)
    }
    return map
  }, [filtered])

  const visibleCategories = categories.filter(c => byCategory.has(c.slug))

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main list */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Uses 法 rather than 文 here -- the empty-state right panel (below)
            already shows a giant 文, and the two would visually double up
            whenever nothing is selected. 文法 (bunpou) = "grammar" together. */}
        <Watermark char="法" />
        {/* Toolbar */}
        <div className="p-4 border-b-3 border-structural flex gap-3 bg-surface flex-wrap items-center">
          <div role="group" aria-label="JLPT level" className="inline-flex border-2 border-structural rounded-[var(--radius-sm)] overflow-hidden shrink-0">
            {LEVELS.map(({ value, label }, i) => (
              <button
                key={value}
                type="button"
                aria-pressed={level === value}
                onClick={() => setLevel(value)}
                className={`px-2.5 py-1 font-mono text-xs font-black uppercase tracking-wider cursor-pointer transition-colors ${
                  i > 0 ? 'border-l-2 border-structural' : ''
                } ${level === value ? 'bg-ink text-paper' : 'bg-paper hover:bg-surface'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('grammar.searchPlaceholder')}
            className="flex-1 min-w-[200px] px-4 py-2 border-3 border-structural font-bold text-sm bg-paper focus:outline-none"
          />
          <button
            onClick={() => setShowTips(s => !s)}
            className={`px-3 py-2 border-3 font-bold text-xs uppercase tracking-wider cursor-pointer transition-all ${showTips ? 'border-ink bg-ink text-paper' : 'border-structural bg-paper hover:bg-yellow'}`}
          >
            {t('grammar.tips')}
          </button>
          <div className="w-full text-xs font-bold uppercase tracking-wider text-muted">
            {t('grammar.countOfTotal', { filtered: filtered.length, total: grammar.length })}
          </div>
        </div>

        {/* Category + verb-form filters (collapsible on mobile) */}
        <CollapsibleFilters
          label="Filters"
          activeLabel={
            [cat ? categories.find(c => c.slug === cat)?.romanNumeral : null,
             verbForm ? verbForms.find(f => f.id === verbForm)?.titleJa : null,
             tone ? t(`grammar.tone.${tone}`) : null]
              .filter(Boolean).join(' · ') || t('common.all')
          }
          isFiltered={cat !== null || verbForm !== null || tone !== null}
        >
          {/* Category chips */}
          <div className="w-full flex gap-2 flex-wrap">
            <button
              onClick={() => setCat(null)}
              className={`px-3 py-1.5 border-2 rounded-[var(--radius-sm)] font-black text-xs cursor-pointer transition-all ${cat === null ? 'border-ink bg-ink text-paper' : 'border-structural hover:bg-surface'}`}
            >
              {t('common.all')}
            </button>
            {categories.map(c => (
              <button
                key={c.slug}
                onClick={() => setCat(prev => prev === c.slug ? null : c.slug)}
                className={`px-3 py-1.5 border-2 rounded-[var(--radius-sm)] font-black text-xs cursor-pointer transition-all ${cat === c.slug ? 'border-ink bg-ink text-paper' : 'border-structural hover:bg-surface'}`}
                title={localize(c.title)}
              >
                {c.romanNumeral} <span className="opacity-60">({c.count})</span>
              </button>
            ))}
          </div>

          {/* Verb-form pill filter */}
          <div className="w-full flex items-center gap-2 flex-wrap pt-2 mt-1 border-t border-ink/10">
            <span className="text-[10px] font-black uppercase tracking-widest shrink-0 text-muted">
              {t('grammar.filterByVerbForm')}
            </span>
            {verbForms.map(f => {
              const active = verbForm === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setVerbForm(prev => prev === f.id ? null : f.id)}
                  className={`px-3 py-1.5 border-2 border-structural rounded-[var(--radius-sm)] font-black text-xs cursor-pointer transition-all ${active ? 'bg-blue text-paper' : 'hover:bg-surface'}`}
                  title={localize(f.title)}
                >
                  {f.titleJa}
                </button>
              )
            })}
            {verbForm && (
              <button onClick={() => setVerbForm(null)} className="text-xs font-bold text-muted hover:text-red underline cursor-pointer">
                {t('grammar.clearFilter')}
              </button>
            )}
          </div>

          {/* Tone pill filter -- only shown once some enriched points carry
              pragmatics.tones data for the current level. */}
          {availableTones.length > 0 && (
            <div className="w-full flex items-center gap-2 flex-wrap pt-2 mt-1 border-t border-ink/10">
              <span className="text-[10px] font-black uppercase tracking-widest shrink-0 text-muted">
                {t('grammar.filterByTone')}
              </span>
              {availableTones.map(tn => {
                const active = tone === tn
                return (
                  <button
                    key={tn}
                    onClick={() => setTone(prev => prev === tn ? null : tn)}
                    className={`px-3 py-1.5 border-2 border-structural rounded-[var(--radius-sm)] font-black text-xs cursor-pointer transition-all ${active ? 'bg-green text-paper' : 'hover:bg-surface'}`}
                  >
                    {t(`grammar.tone.${tn}`)}
                  </button>
                )
              })}
              {tone && (
                <button onClick={() => setTone(null)} className="text-xs font-bold text-muted hover:text-red underline cursor-pointer">
                  {t('grammar.clearFilter')}
                </button>
              )}
            </div>
          )}
        </CollapsibleFilters>

        {showTips && (
          <div className="px-4 py-3 border-b-3 border-structural bg-yellow/30">
            <ul className="space-y-1.5">
              {tips.map((tip, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="font-black">•</span>
                  <span>{localize(tip)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Category sections */}
        <div key={`${cat}|${verbForm}|${tone}|${search}`} className="flex-1 overflow-y-auto p-4 space-y-6 animate-fade-in">
          {visibleCategories.length === 0 && (
            <div className="text-center text-muted py-12 font-bold">{t('grammar.noResults')}</div>
          )}
          {visibleCategories.map(c => {
            const items = byCategory.get(c.slug) || []
            const accent = accentFor(c.order)
            const isCollapsed = collapsed[c.slug]
            return (
              <div key={c.slug} id={`cat-${c.slug}`}>
                <button
                  onClick={() => setCollapsed(s => ({ ...s, [c.slug]: !s[c.slug] }))}
                  className="w-full flex items-center gap-3 mb-3 text-left cursor-pointer group"
                >
                  <span
                    className="text-xs font-black px-2 py-1 border-2 border-structural rounded-[var(--radius-sm)] shrink-0"
                    style={{ backgroundColor: ACCENT_HEX[accent] }}
                  >
                    {c.romanNumeral}
                  </span>
                  <span className="font-black text-base flex-1 group-hover:underline">{localize(c.title)}</span>
                  <span className="text-xs font-bold text-muted">{items.length}</span>
                  <span className="text-sm font-black text-muted w-4 text-center">{isCollapsed ? '+' : '−'}</span>
                </button>

                {!isCollapsed && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {items.map(g => (
                      <GrammarCard
                        key={g.id}
                        g={g}
                        accent={accent}
                        selected={selected?.id === g.id}
                        onClick={() => setSelected(g)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail drawer -- full-screen overlay below `lg` (there's no room for
          a second pane at phone/tablet widths), a fixed side panel at `lg`+ */}
      {selected ? (
        <div className="fixed inset-0 z-40 lg:static lg:z-auto lg:w-96 lg:flex-shrink-0 overflow-y-auto bg-paper border-l-3 border-structural">
          <div className="p-6 border-b-3 border-structural">
            <button onClick={() => setSelected(null)} className="text-muted hover:text-red font-black mb-4 cursor-pointer">× {t('common.close')}</button>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black px-2 py-0.5 border-2 border-structural rounded-[var(--radius-sm)]" style={{ backgroundColor: ACCENT_HEX[accentFor(categories.find(c => c.slug === selected.category)?.order ?? 1)] }}>
                {categories.find(c => c.slug === selected.category)?.romanNumeral}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted">#{selected.num} · {localize(categories.find(c => c.slug === selected.category)?.title)}</span>
            </div>
            <div className="text-3xl font-black leading-tight mb-1">
              <Ruby text={selected.pattern} html={selected.patternRuby} />
            </div>
            {selected.patternRomaji && (
              <div className="text-xs font-mono text-muted mb-2">{selected.patternRomaji}</div>
            )}
            <div className="text-lg font-bold">{localize(selected.meaning)}</div>

            {selected.pragmatics && selected.pragmatics.tones.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selected.pragmatics.tones.map(tn => (
                  <span key={tn} className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 border-2 border-structural rounded-[var(--radius-sm)] text-muted">
                    {t(`grammar.tone.${tn}`)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {selected.pragmatics && (selected.pragmatics.intent || selected.pragmatics.speakerStance || selected.pragmatics.emotionalNuance) && (
            <div className="p-6 border-b-3 border-structural space-y-2">
              <div className="text-xs font-black uppercase tracking-wider">{t('grammar.pragmatics.title')}</div>
              {selected.pragmatics.intent && (
                <div className="text-sm"><span className="font-bold text-muted">{t('grammar.pragmatics.intent')}: </span>{localize(selected.pragmatics.intent)}</div>
              )}
              {selected.pragmatics.speakerStance && (
                <div className="text-sm"><span className="font-bold text-muted">{t('grammar.pragmatics.stance')}: </span>{localize(selected.pragmatics.speakerStance)}</div>
              )}
              {selected.pragmatics.emotionalNuance && (
                <div className="text-sm"><span className="font-bold text-muted">{t('grammar.pragmatics.nuance')}: </span>{localize(selected.pragmatics.emotionalNuance)}</div>
              )}
            </div>
          )}

          {selected.formationRules && selected.formationRules.length > 0 && (
            <div className="p-6 border-b-3 border-structural">
              <div className="text-xs font-black uppercase tracking-wider mb-3">{t('grammar.formation.title')}</div>
              <FormationMatrix rules={selected.formationRules} />
            </div>
          )}

          {selected.richExamples && selected.richExamples.length > 0 ? (
            <div className="p-6 border-b-3 border-structural">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="text-xs font-black uppercase tracking-wider">{t('grammar.examples.richTitle')}</div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    aria-pressed={showFurigana}
                    onClick={() => setShowFurigana(s => !s)}
                    className={`px-2 py-1 border-2 border-structural rounded-[var(--radius-sm)] text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${showFurigana ? 'bg-ink text-paper' : 'bg-paper hover:bg-surface'}`}
                  >
                    {t('grammar.examples.showFurigana')}
                  </button>
                  <button
                    type="button"
                    aria-pressed={showRomaji}
                    onClick={() => setShowRomaji(s => !s)}
                    className={`px-2 py-1 border-2 border-structural rounded-[var(--radius-sm)] text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${showRomaji ? 'bg-ink text-paper' : 'bg-paper hover:bg-surface'}`}
                  >
                    {t('grammar.examples.showRomaji')}
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {selected.richExamples.map((ex, i) => (
                  <InteractiveExampleCard
                    key={i}
                    example={ex}
                    showFurigana={showFurigana}
                    showRomaji={showRomaji}
                    accentHex={ACCENT_HEX[accentFor(categories.find(c => c.slug === selected.category)?.order ?? 1)]}
                    patternById={patternById}
                    onJumpTo={jumpTo}
                  />
                ))}
              </div>
            </div>
          ) : selected.examples && selected.examples.length > 0 && (
            <div className="p-6 border-b-3 border-structural">
              <div className="text-xs font-black uppercase tracking-wider mb-4">{t('common.examples')}</div>
              {selected.examples.map((ex, i) => (
                <div key={i} className="mb-5 last:mb-0 border-l-3 pl-4" style={{ borderColor: ACCENT_HEX[accentFor(categories.find(c => c.slug === selected.category)?.order ?? 1)] }}>
                  <div className="font-bold text-lg leading-snug">
                    <Ruby text={ex.ja} html={ex.jaRuby} />
                  </div>
                  {ex.vi && <div className="text-sm text-muted mt-1">{localize({ vi: ex.vi, en: ex.en })}</div>}
                </div>
              ))}
            </div>
          )}

          {selected.notesAndPitfalls && selected.notesAndPitfalls.length > 0 && (
            <div className="p-6 border-b-3 border-structural">
              <div className="text-xs font-black uppercase tracking-wider mb-3">{t('grammar.notes.title')}</div>
              <NotesAndTrapsCallout pitfalls={selected.notesAndPitfalls} onJumpTo={jumpTo} patternById={patternById} />
            </div>
          )}

          {((selected.relatedGrammar && selected.relatedGrammar.length > 0) || (selected.opposingGrammar && selected.opposingGrammar.length > 0)) && (
            <div className="p-6 space-y-3">
              {selected.relatedGrammar && selected.relatedGrammar.length > 0 && (
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-1.5">{t('grammar.related')}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.relatedGrammar.map(id => (
                      <button key={id} onClick={() => jumpTo(id)} className="jp px-2 py-1 border-2 border-structural rounded-[var(--radius-sm)] text-xs font-bold hover:bg-surface cursor-pointer">
                        {patternById[id] ?? id}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {selected.opposingGrammar && selected.opposingGrammar.length > 0 && (
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-1.5">{t('grammar.opposing')}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.opposingGrammar.map(id => (
                      <button key={id} onClick={() => jumpTo(id)} className="jp px-2 py-1 border-2 border-red/50 rounded-[var(--radius-sm)] text-xs font-bold text-red hover:bg-red/10 cursor-pointer">
                        {patternById[id] ?? id}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="w-80 hidden lg:flex items-center justify-center text-muted flex-shrink-0 border-l-3 border-structural">
          <div className="text-center p-8">
            <div className="text-6xl jp mb-4">文</div>
            <div className="font-bold text-sm uppercase tracking-wider">{t('grammar.selectPrompt')}</div>
            <div className="text-xs mt-1">{t('grammar.hoverHint')}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function GrammarCard({ g, accent, selected, onClick }: { g: GrammarPoint; accent: string; selected: boolean; onClick: () => void }) {
  const { localize } = useTranslation()
  const ex = g.examples[0]
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`w-full text-left p-3 border-3 transition-all duration-100 cursor-pointer ${
          selected ? 'border-ink bg-ink text-paper' : 'border-structural bg-paper hover:shadow-[var(--shadow-brutal)] hover:-translate-x-0.5 hover:-translate-y-0.5'
        }`}
        style={!selected ? { borderLeftWidth: '6px', borderLeftColor: ACCENT_HEX[accent] } : undefined}
      >
        {g.requiredVerbForm?.length > 0 && (
          <div className="absolute top-1.5 right-1.5 flex gap-1">
            {g.requiredVerbForm.map(f => (
              <span
                key={f}
                className={`text-[9px] font-black px-1.5 py-0.5 border ${selected ? 'border-paper/40 text-paper/80' : 'border-ink bg-blue text-paper'}`}
              >
                {f}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-start gap-2">
          <span className={`text-[10px] font-black shrink-0 pt-0.5 ${selected ? 'text-paper/60' : 'text-muted'}`}>#{g.num}</span>
          <div className="flex-1 min-w-0">
            <div className="font-black text-sm leading-snug break-words pr-14">
              <Ruby text={g.pattern} html={g.patternRuby} />
            </div>
            <div className={`text-xs mt-1 ${selected ? 'text-paper/70' : 'text-muted'}`}>
              {localize(g.meaning) || '—'}
            </div>
          </div>
        </div>
      </button>

      {/* Hover preview -- sticky-hover on tap reads as broken on touch, and
          the same content is already one tap away in the detail drawer, so
          this only shows at `lg`+ where a real mouse hover is available. */}
      {ex && (
        <div className="hidden lg:block pointer-events-none absolute left-0 right-0 top-full mt-1.5 z-30 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-150">
          <div className="bg-ink text-paper border-3 border-ink shadow-[var(--shadow-brutal)] p-3">
            <div className="font-bold text-sm leading-snug">
              <Ruby text={ex.ja} html={ex.jaRuby} />
            </div>
            {ex.vi && <div className="text-xs text-paper/70 mt-1">{localize({ vi: ex.vi, en: ex.en })}</div>}
          </div>
        </div>
      )}
    </div>
  )
}
