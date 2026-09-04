import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { synonymGroups, collocationGroups, auxiliaryVerbs } from "@/data/usage"
import { getGrammar } from "@/data/grammar"
import type {
  AuxiliaryVerb, CollocationEntry, CollocationGroup, GrammarPoint, SynonymGroup, SynonymWord,
} from "@/types"
import { Furigana } from "@/components/ui/Furigana"
import { Card } from "@/components/ui/Card"
import { PosTag } from "@/components/ui/PosTag"
import { Reveal } from "@/components/ui/Reveal"
import { Watermark } from "@/components/ui/ScreenHeader"
import { useTranslation } from "@/lib/useTranslation"
import { useSettingsStore } from "@/store/settings-store"

// For CollocationGroupSection's "⇄ compare with" link -- resolves a
// contrastId to its partner's display pattern regardless of which group
// (or filtered subset) is currently rendering.
const collocationPatternById: Record<string, string> = Object.fromEntries(
  collocationGroups.flatMap(g => g.entries.map(e => [e.id, e.pattern]))
)

type Localize = (m: { vi: string; en: string } | undefined | null) => string
type T = (key: string, vars?: Record<string, string | number>) => string

type Tab = "synonyms" | "particles" | "auxiliary"

const TABS: { id: Tab; glyph: string; kana: string }[] = [
  { id: "synonyms", glyph: "類", kana: "るいぎご" },
  { id: "particles", glyph: "格", kana: "かくじょし" },
  { id: "auxiliary", glyph: "補", kana: "ほじょどうし" },
]

const PARTICLE_COLOR: Record<string, string> = {
  に: "var(--color-blue)",
  を: "var(--color-red)",
  が: "var(--color-green)",
  と: "var(--color-yellow)",
}

function haystackOf(parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(" ").toLowerCase()
}

function synonymWordHaystack(w: SynonymWord) {
  return haystackOf([w.kanji, w.kana, w.meaning.vi, w.meaning.en, w.nuance.vi, w.nuance.en])
}

function collocationHaystack(e: CollocationEntry) {
  return haystackOf([
    e.pattern, e.verb.kanji, e.verb.kana, e.verb.meaning.vi, e.verb.meaning.en,
    e.explanation.vi, e.explanation.en,
  ])
}

function auxiliaryHaystack(a: AuxiliaryVerb) {
  return haystackOf([a.pattern, a.colloquial, a.meaning.vi, a.meaning.en, a.nuance.vi, a.nuance.en])
}

function scrollToEntry(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: "smooth", block: "center" })
  el.style.transition = "box-shadow 150ms ease"
  const prev = el.style.boxShadow
  el.style.boxShadow = "0 0 0 3px var(--color-accent)"
  window.setTimeout(() => { el.style.boxShadow = prev }, 900)
}

export function Usage() {
  const navigate = useNavigate()
  const { t, localize } = useTranslation()
  const level = useSettingsStore(s => s.level)
  const [tab, setTab] = useState<Tab>("synonyms")
  const [search, setSearch] = useState("")

  // AuxiliaryVerb.grammarIds cross-links into grammar.ts, whose /grammar
  // route only resolves points inside the CURRENTLY selected level's list
  // (see Grammar.tsx's own point-lookup effect) -- scoping this lookup to
  // getGrammar(level) rather than the full combined set means a chip only
  // ever shows (and its navigate() only ever lands) when the target point
  // actually exists in what's on screen, same reasoning as Transitivity.tsx's
  // relatedGrammar.
  const grammarById = useMemo(
    () => Object.fromEntries(getGrammar(level).map(g => [g.id, g])) as Record<string, GrammarPoint>,
    [level]
  )

  const query = search.trim().toLowerCase()

  const filteredSynonymGroups = useMemo(() => {
    if (!query) return synonymGroups
    return synonymGroups
      .map(g => ({ ...g, words: g.words.filter(w => synonymWordHaystack(w).includes(query)) }))
      .filter(g => g.words.length > 0)
  }, [query])

  const filteredCollocationGroups = useMemo(() => {
    if (!query) return collocationGroups
    return collocationGroups
      .map(g => ({ ...g, entries: g.entries.filter(e => collocationHaystack(e).includes(query)) }))
      .filter(g => g.entries.length > 0)
  }, [query])

  const filteredAuxiliaryVerbs = useMemo(() => {
    if (!query) return auxiliaryVerbs
    return auxiliaryVerbs.filter(a => auxiliaryHaystack(a).includes(query))
  }, [query])

  const noResults =
    (tab === "synonyms" && filteredSynonymGroups.length === 0) ||
    (tab === "particles" && filteredCollocationGroups.length === 0) ||
    (tab === "auxiliary" && filteredAuxiliaryVerbs.length === 0)

  return (
    <div className="h-full overflow-y-auto">
      <div className="relative max-w-5xl mx-auto p-6 overflow-hidden">
        <Watermark char="別" />

        {/* Header */}
        <div className="mb-8">
          <div className="text-xs font-bold uppercase tracking-widest text-muted mb-2">N5 · N4 · 使い方とニュアンス</div>
          <div className="text-4xl font-black leading-tight">
            <Furigana kanji="使い方とニュアンス" kana="つかいかたとニュアンス" />
          </div>
          <div className="text-sm font-bold uppercase tracking-wider text-muted mt-1">{t("usage.subtitle")}</div>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {TABS.map(tb => {
            const active = tab === tb.id
            return (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className={`text-left border-3 p-3 cursor-pointer transition-all ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-structural bg-paper hover:shadow-[var(--shadow-brutal-hover)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="jp font-black text-xl leading-none">{tb.glyph}</span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider opacity-70">{tb.kana}</span>
                </div>
                <div className="font-black text-sm">{t(`usage.tabs.${tb.id}`)}</div>
              </button>
            )
          })}
        </div>

        {/* Tab intro */}
        <p className="text-sm text-muted leading-relaxed mb-6">{t(`usage.intro.${tab}`)}</p>

        {/* Search */}
        <div className="mb-8">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t("usage.searchPlaceholder")}
            className="w-full px-4 py-2 border-3 border-structural font-sans font-bold text-sm bg-paper focus:outline-none focus:shadow-[2px_2px_0px_var(--color-blue)]"
          />
        </div>

        {tab === "synonyms" && (
          <div className="space-y-8 mb-8">
            {filteredSynonymGroups.map((g, i) => (
              <SynonymGroupCard key={g.id} group={g} index={i} t={t} localize={localize} />
            ))}
          </div>
        )}

        {tab === "particles" && (
          <div className="space-y-10 mb-8">
            {filteredCollocationGroups.map((g, i) => (
              <CollocationGroupSection key={g.id} group={g} index={i} t={t} localize={localize} />
            ))}
          </div>
        )}

        {tab === "auxiliary" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 items-start">
            {filteredAuxiliaryVerbs.map((a, i) => (
              <AuxiliaryVerbCard key={a.id} entry={a} index={i} t={t} localize={localize} navigate={navigate} grammarById={grammarById} />
            ))}
          </div>
        )}

        {noResults && (
          <p className="text-sm text-muted text-center py-8">{t("usage.noResults")}</p>
        )}
      </div>
    </div>
  )
}

function TrapBox({ label, text }: { label: string; text: string }) {
  return (
    <div className="px-4 py-2.5 border-t-3 border-structural bg-red/5">
      <div className="text-[10px] font-black uppercase tracking-wider text-red mb-1">{label}</div>
      <p className="text-xs text-red font-bold leading-relaxed">{text}</p>
    </div>
  )
}

// -- Synonyms & Nuances --------------------------------------------------

function SynonymGroupCard({
  group, index, t, localize,
}: { group: SynonymGroup; index: number; t: T; localize: Localize }) {
  return (
    <Reveal index={index}>
      <div>
        <div className="flex items-baseline justify-between gap-3 mb-3 border-b-2 border-structural pb-1.5">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="jp font-black text-lg text-accent shrink-0">{group.glossJa}</span>
            <span className="font-bold text-sm text-muted truncate">{localize(group.title)}</span>
          </div>
          <span className="font-mono text-xs font-bold text-muted shrink-0">{t("common.wordsCount", { n: group.words.length })}</span>
        </div>

        {group.note && (
          <div className="border-3 border-structural bg-yellow/20 p-3 mb-3">
            <p className="text-xs text-ink font-bold leading-relaxed">{localize(group.note)}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {group.words.map(w => (
            <Card key={w.kanji} className="p-0 overflow-hidden h-full flex flex-col">
              <div className="p-4 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <Furigana className="text-xl font-black" kanji={w.kanji} kana={w.kana} />
                  <PosTag pos={w.pos} verbGroup={w.verbGroup} />
                </div>
                <div className="text-sm font-bold text-muted mb-2">{localize(w.meaning)}</div>
                <p className="text-xs leading-relaxed mb-3">{localize(w.nuance)}</p>
                <div className="border-2 border-structural rounded-[var(--radius-sm)] bg-surface px-3 py-2">
                  <Furigana className="text-sm font-bold" kanji={w.example.ja} kana={w.example.kana} />
                  <div className="text-xs font-normal text-muted mt-1">{localize(w.example)}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Reveal>
  )
}

// -- Verb-Particle Collocations ------------------------------------------

function CollocationGroupSection({
  group, index, t, localize,
}: { group: CollocationGroup; index: number; t: T; localize: Localize }) {
  return (
    <Reveal index={index}>
      <div>
        <div className="mb-3">
          <div className="font-black text-base">{localize(group.title)}</div>
          <p className="text-xs text-muted leading-relaxed mt-1">{localize(group.description)}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {group.entries.map(e => (
            <div key={e.id} id={e.id} className="scroll-mt-24">
              <Card className="p-0 overflow-hidden h-full flex flex-col">
                <div className="p-4 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="jp font-mono font-black text-base">{e.pattern}</span>
                    <span
                      className="font-mono shrink-0 text-[10px] font-black uppercase tracking-widest w-6 h-6 flex items-center justify-center border-2 border-structural rounded-full text-paper jp"
                      style={{ backgroundColor: PARTICLE_COLOR[e.particle] ?? "var(--color-muted)" }}
                    >
                      {e.particle}
                    </span>
                  </div>
                  <div className="text-sm font-bold mb-1">
                    <Furigana kanji={e.verb.kanji} kana={e.verb.kana} /> — <span className="text-muted font-normal">{localize(e.verb.meaning)}</span>
                  </div>
                  <p className="text-xs leading-relaxed mt-2 mb-3">{localize(e.explanation)}</p>
                  <div className="border-2 border-structural rounded-[var(--radius-sm)] bg-surface px-3 py-2">
                    <Furigana className="text-sm font-bold" kanji={e.example.ja} kana={e.example.kana} />
                    <div className="text-xs font-normal text-muted mt-1">{localize(e.example)}</div>
                  </div>
                  {e.contrastId && collocationPatternById[e.contrastId] && (
                    <button
                      onClick={() => scrollToEntry(e.contrastId!)}
                      className="mt-3 text-xs font-bold text-accent hover:underline cursor-pointer"
                    >
                      ⇄ {t("usage.compareWith")} <span className="jp">{collocationPatternById[e.contrastId]}</span>
                    </button>
                  )}
                </div>
                {e.trap && <TrapBox label={t("usage.trapLabel")} text={localize(e.trap)} />}
              </Card>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  )
}

// -- Auxiliary Verbs (Hojo Doushi) ----------------------------------------

function AuxiliaryVerbCard({
  entry, index, t, localize, navigate, grammarById,
}: {
  entry: AuxiliaryVerb
  index: number
  t: T
  localize: Localize
  navigate: (to: string) => void
  grammarById: Record<string, GrammarPoint>
}) {
  const linkedGrammar = (entry.grammarIds ?? []).map(id => grammarById[id]).filter((g): g is GrammarPoint => !!g)
  return (
    <Reveal index={index} className="h-full">
      <Card className="p-0 overflow-hidden h-full flex flex-col">
        <div className="p-4 flex-1">
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <span className="jp font-black text-2xl">{entry.pattern}</span>
            {entry.colloquial && <span className="jp text-xs text-muted font-bold shrink-0">{entry.colloquial}</span>}
          </div>
          <div className="text-sm font-bold text-muted mb-2">{localize(entry.meaning)}</div>
          <p className="text-xs leading-relaxed mb-3">{localize(entry.nuance)}</p>
          <div className="space-y-2">
            {entry.examples.map((ex, i) => (
              <div key={i} className="border-2 border-structural rounded-[var(--radius-sm)] bg-surface px-3 py-2">
                <Furigana className="text-sm font-bold" kanji={ex.ja} kana={ex.kana} />
                <div className="text-xs font-normal text-muted mt-1">{localize(ex)}</div>
              </div>
            ))}
          </div>

          {linkedGrammar.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 mt-3">
              {linkedGrammar.map(g => (
                <button
                  key={g.id}
                  onClick={() => navigate(`/grammar?point=${g.id}`)}
                  className="group shrink-0 w-48 text-left border-3 border-structural bg-paper p-2.5 cursor-pointer transition-all hover:shadow-[var(--shadow-brutal-hover)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                  style={{ borderLeftWidth: "6px", borderLeftColor: "var(--color-blue)" }}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="jp font-bold text-xs leading-snug">{g.pattern}</div>
                    <span className="shrink-0 mt-0.5 text-muted group-hover:text-ink group-hover:translate-x-0.5 transition-all text-xs">→</span>
                  </div>
                  <div className="text-[11px] mt-1.5 leading-relaxed text-muted">{localize(g.meaning)}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        {entry.trap && <TrapBox label={t("usage.trapLabel")} text={localize(entry.trap)} />}
      </Card>
    </Reveal>
  )
}
