import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import radicalNamesJson from "@/data/radical-names.json"
import kanjiReadingsJson from "@/data/kanji-readings.json"
import type { KanjiVgComponent, KanjiVgData, RadicalNamesData } from "@/types"
import { AnimatedKanjiSvg } from "./AnimatedKanjiSvg"
import { ComponentGraph } from "./ComponentGraph"
import { rulesForKanji } from "@/lib/onyomi-rules"
import { useTranslation } from "@/lib/useTranslation"
import { hanVietForChar, KANJI_INDEX, cleanReadings, kanjiOrder } from "@/lib/kanji"

// kanjivg.json (stroke paths for every kanji, ~900KB) is fetched the first
// time any drawer opens rather than bundled with the page - Vocab and Kanji
// both mount this drawer closed, and statically importing the data made
// every visit to those tabs download and parse it up front. Cached at module
// level so it loads once per session.
let kanjivgData: KanjiVgData | null = null
let kanjivgPromise: Promise<KanjiVgData> | null = null
function loadKanjiVg(): Promise<KanjiVgData> {
  // A failed fetch (flaky network, or a redeploy removed the old chunk) is
  // not cached, so the next open retries instead of failing forever.
  kanjivgPromise ??= import("@/data/kanjivg.json")
    .then(m => (kanjivgData = m.default as KanjiVgData))
    .catch(e => { kanjivgPromise = null; throw e })
  return kanjivgPromise
}
const radicalNames = radicalNamesJson as RadicalNamesData
interface KanjiReadingsFallback { on: string[]; kun: string[]; meanings: { vi: string; en: string } }
const kanjiReadings = kanjiReadingsJson as Record<string, KanjiReadingsFallback>

interface GroupedComponent {
  element: string
  count: number
  isRadical: boolean
  positions: string[]
  /** Union of every occurrence's stroke indices (e.g. all three 木 of 森). */
  strokes: number[]
}

// One ink color per distinct component, cycled. Chosen to stay distinguishable
// on the drawer's fixed white surface; the chip border/swatch reuse the same
// color so a chip and its strokes read as one thing.
const COMPONENT_COLORS = ["#be4327", "#3b82f6", "#16a34a", "#a855f7", "#d97706", "#0891b2", "#db2777"]
const DIMMED_STROKE = "#d4dbe4"

// Components can repeat (e.g. 森 → 木 木 木, from three separate SVG groups).
// Collapse same-element occurrences into one tag with a ×N multiplier -
// lighter than trying to lay tags out spatially, and it's what the
// "[ 木 - Mộc ] ×3" format calls for.
function groupComponents(components: KanjiVgComponent[]): GroupedComponent[] {
  const order: string[] = []
  const map = new Map<string, GroupedComponent>()
  for (const comp of components) {
    let g = map.get(comp.element)
    if (!g) {
      g = { element: comp.element, count: 0, isRadical: false, positions: [], strokes: [] }
      map.set(comp.element, g)
      order.push(comp.element)
    }
    g.count++
    g.strokes.push(...comp.strokes)
    if (comp.isRadical) g.isRadical = true
    if (comp.position && !g.positions.includes(comp.position)) g.positions.push(comp.position)
  }
  return order.map(el => map.get(el)!)
}

// This drawer is deliberately theme-independent (always a white Kanagawa-
// styled panel - predates the paper-theme system, see handoff.md). That
// means it can NEVER use theme-reactive Tailwind classes like text-muted or
// border-structural for anything drawn on its own white surface: on the four dark
// papers those resolve to near-white, which is invisible (or worse,
// white-on-white) against a hardcoded white background. Everything drawn on
// that white surface uses these fixed literals instead.
const DRAWER_INK = "#1d1d1f"
const DRAWER_MUTED = "#6e6e73"
const DRAWER_ACCENT = "#0071e3"
const DRAWER_HAIRLINE = "rgba(0,0,0,0.1)"
const DRAWER_BLUE = "#007aff"
const DRAWER_GREEN = "#248a3d"
const DRAWER_ORANGE = "#c26a00"

// bothu.pdf names the positional variants "Bộ thủ", "Bộ khuyển", ... - the
// lead-in word is noise on a chip, so chips and the diagram show "Thủ",
// "Khuyển". The flashcards and the radical card keep the full PDF name.
function shortName(name: string | undefined): string {
  if (!name) return ''
  const stripped = name.replace(/^Bộ\s+/i, '')
  return stripped.charAt(0).toLocaleUpperCase('vi') + stripped.slice(1)
}

function NavButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="w-7 h-7 border font-black text-sm leading-none cursor-pointer"
      style={{ borderColor: DRAWER_MUTED, color: DRAWER_INK }}
    >
      {children}
    </button>
  )
}

function ReadingPill({ text, color }: { text: string; color: string }) {
  return (
    <span
      className="jp text-sm font-bold px-2 py-1 border"
      style={{ borderColor: `${color}40`, backgroundColor: `${color}15`, color }}
    >
      {text}
    </span>
  )
}

// On/kun readings + meaning + level badge, for whichever source resolved
// (KANJI_INDEX anchor data, or the kanji-readings.json fallback - see
// KanjiDrawer's lookup below). Shared between the "has stroke animation"
// and "no stroke animation" render branches so both surfaces show it.
function ReadingsSection({
  meaningText, onReadings, kunReadings, levelLabel,
}: {
  meaningText: string
  onReadings: string[]
  kunReadings: string[]
  levelLabel: string | null
}) {
  const { t } = useTranslation()
  if (!meaningText && onReadings.length === 0 && kunReadings.length === 0 && !levelLabel) return null
  return (
    <div className="mt-4 pt-3" style={{ borderTop: `2px solid ${DRAWER_HAIRLINE}` }}>
      {meaningText && (
        <div className="mb-3">
          <div className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: DRAWER_MUTED }}>
            {t('kanjiDrawer.meaning')}
          </div>
          <div className="text-sm font-bold" style={{ color: DRAWER_INK }}>{meaningText}</div>
        </div>
      )}

      {onReadings.length > 0 && (
        <div className="mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: DRAWER_BLUE }}>
            {"On'yomi"}
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {onReadings.map(r => <ReadingPill key={r} text={r} color={DRAWER_BLUE} />)}
          </div>
        </div>
      )}

      {kunReadings.length > 0 && (
        <div className="mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: DRAWER_GREEN }}>
            {"Kun'yomi"}
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {kunReadings.map(r => <ReadingPill key={r} text={r} color={DRAWER_GREEN} />)}
          </div>
        </div>
      )}

      {levelLabel && (
        <div className="text-[10px] font-bold uppercase tracking-wider mt-2" style={{ color: DRAWER_MUTED }}>
          {levelLabel}
        </div>
      )}
    </div>
  )
}

function HanVietBadge({ hanviet, label }: { hanviet: string; label: string }) {
  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-2 border"
      style={{ backgroundColor: "rgb(255,255,255)", borderColor: "#627d9a" }}
    >
      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#627d9a" }}>
        {label}
      </span>
      <span className="text-xl font-black" style={{ color: "#2e3257" }}>{hanviet}</span>
    </div>
  )
}

function ReplayIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 1 3.1 6.8" />
      <path d="M3 20v-6h6" />
    </svg>
  )
}

interface KanjiDrawerProps {
  char: string | null
  onClose: () => void
}

// Always-mounted right-side slide-over shell (translate-x + backdrop toggle)
// so the close transition can play - conditionally rendering would unmount
// mid-swipe. `displayChar` keeps the last kanji's content visible while it
// slides out (`char` alone would blank the panel before the transition
// finishes), then is cleared so the closed drawer holds no content.
export function KanjiDrawer({ char, onClose }: KanjiDrawerProps) {
  const { t, localize } = useTranslation()
  const POSITION_LABELS: Record<string, string> = {
    left: t('kanjiDrawer.positions.left'), right: t('kanjiDrawer.positions.right'),
    top: t('kanjiDrawer.positions.top'), bottom: t('kanjiDrawer.positions.bottom'),
    kamae: t('kanjiDrawer.positions.kamae'), kamaec: t('kanjiDrawer.positions.kamaec'),
    nyo: t('kanjiDrawer.positions.nyo'), nyoc: t('kanjiDrawer.positions.nyoc'),
    tare: t('kanjiDrawer.positions.tare'), tarec: t('kanjiDrawer.positions.tarec'),
  }
  const open = char !== null
  const [displayChar, setDisplayChar] = useState<string | null>(null)
  const [replayKey, setReplayKey] = useState(0)
  const [vgData, setVgData] = useState<KanjiVgData | null>(kanjivgData)
  const [vgFailed, setVgFailed] = useState(false)
  const [hoverElement, setHoverElement] = useState<string | null>(null)
  const [showNumbers, setShowNumbers] = useState(false)
  // Components the user clicked through (語 → 吾 → ...), so "back" can retrace.
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    if (!open || vgData) return
    let cancelled = false
    setVgFailed(false)
    loadKanjiVg().then(
      data => { if (!cancelled) setVgData(data) },
      () => { if (!cancelled) setVgFailed(true) },
    )
    return () => { cancelled = true }
  }, [open, vgData])

  useEffect(() => {
    if (char !== null) {
      setDisplayChar(char)
      setHoverElement(null)
      setHistory([])
      setReplayKey(k => k + 1)
    }
  }, [char])

  const goTo = (next: string) => {
    if (displayChar) setHistory(h => [...h, displayChar])
    setDisplayChar(next)
    setHoverElement(null)
    setReplayKey(k => k + 1)
  }
  const goBack = () => {
    const prev = history[history.length - 1]
    if (prev === undefined) return
    setHistory(h => h.slice(0, -1))
    setDisplayChar(prev)
    setHoverElement(null)
    setReplayKey(k => k + 1)
  }

  // Prev/next walks the textbook order (anchors by chapter, then the rest).
  const order = useMemo(
    () => (vgData ? kanjiOrder(Object.keys(vgData).filter(c => KANJI_INDEX.has(c) || c in kanjiReadings)) : []),
    [vgData],
  )
  const orderIndex = displayChar ? order.indexOf(displayChar) : -1
  const step = (delta: number) => {
    if (orderIndex < 0) return
    setHistory([])
    setDisplayChar(order[(orderIndex + delta + order.length) % order.length])
    setHoverElement(null)
    setReplayKey(k => k + 1)
  }

  // Once the slide-out has finished (300ms, matching duration-300 below),
  // drop the last kanji so the SVG, readings and badges unmount and the
  // closed shell stays lightweight. Reopening within the window cancels it.
  useEffect(() => {
    if (open) return
    const id = window.setTimeout(() => setDisplayChar(null), 320)
    return () => window.clearTimeout(id)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)
      if (typing || orderIndex < 0) return
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        // The word/group modals underneath page on the same arrow keys through
        // their own window listeners; this one runs first (capture phase) and
        // swallows the key so only the drawer moves.
        e.stopImmediatePropagation()
        e.preventDefault()
        step(e.key === "ArrowLeft" ? -1 : 1)
      }
    }
    window.addEventListener("keydown", onKeyDown, true)
    return () => window.removeEventListener("keydown", onKeyDown, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps - step() only reads orderIndex/order
  }, [open, onClose, orderIndex, order])

  const entry = displayChar && vgData ? vgData[displayChar] : undefined
  const hanviet = displayChar ? hanVietForChar(displayChar) : undefined
  const groupedComponents = useMemo(
    () => (entry ? groupComponents(entry.components) : []),
    [entry]
  )

  // Tint each component's strokes only when there is something to tell apart
  // (a lone whole-kanji component stays plain ink). While a chip is hovered,
  // every other component's strokes fade so its share of the glyph stands out.
  const strokeColors = useMemo(() => {
    if (!entry || groupedComponents.length < 2) return undefined
    const colors: string[] = new Array(entry.strokes.length)
    groupedComponents.forEach((g, gi) => {
      const color = hoverElement === null || hoverElement === g.element
        ? COMPONENT_COLORS[gi % COMPONENT_COLORS.length]
        : DIMMED_STROKE
      for (const i of g.strokes) colors[i] = color
    })
    return colors
  }, [entry, groupedComponents, hoverElement])

  // On/kun readings + meaning: KANJI_INDEX (kanji.json anchors, textbook-
  // verified + bilingual) is checked first; kanji-readings.json (build-time
  // kanjiapi.dev on/kun + hand-translated {vi, en} meanings, see
  // translate-kanji-meanings.mjs) covers everything else that shows up in
  // vocab. See lib/kanji.ts and build-kanji-readings.mjs.
  const kanjiDetail = displayChar ? KANJI_INDEX.get(displayChar) : undefined
  const fallbackReadings = displayChar && !kanjiDetail ? kanjiReadings[displayChar] : undefined
  const meaningText = kanjiDetail
    ? localize(kanjiDetail.group.meaning)
    : (fallbackReadings?.meanings ? localize(fallbackReadings.meanings) : '')
  const onReadings = kanjiDetail
    ? cleanReadings(kanjiDetail.group.onyomi, Infinity).shown
    : (fallbackReadings ? cleanReadings(fallbackReadings.on, Infinity).shown : [])
  const kunReadings = kanjiDetail
    ? cleanReadings(kanjiDetail.group.kunyomi, Infinity).shown
    : (fallbackReadings ? cleanReadings(fallbackReadings.kun, Infinity).shown : [])
  const levelLabel = kanjiDetail ? `${kanjiDetail.src} · ${t('common.chapterN', { n: kanjiDetail.chapter })}` : null
  const rules = displayChar ? rulesForKanji(displayChar) : []
  // A radical that has no stroke animation of its own (亻, 氵, ...) still gets
  // its bothu.pdf name + gloss when navigated to from a component chip.
  const radicalInfo = displayChar ? radicalNames[displayChar] : undefined
  // A kanji that is its own single component (木, 本's merged 木) has nothing
  // to diagram.
  const graphNodes = groupedComponents.length === 1 && groupedComponents[0].element === displayChar
    ? []
    : groupedComponents.map((g, gi) => ({
        element: g.element,
        count: g.count,
        label: shortName(radicalNames[g.element]?.hanviet) || hanVietForChar(g.element) || '',
        color: COMPONENT_COLORS[gi % COMPONENT_COLORS.length],
      }))

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/25 lg:bg-black/20 transition-opacity duration-300 ${
          // Blur only while open, and only at lg+: this backdrop is always
          // mounted, and a full-screen backdrop-filter layer (even at
          // opacity 0) is expensive for iOS Safari to composite on scroll.
          open ? "opacity-100 pointer-events-auto lg:backdrop-blur-sm" : "opacity-0 pointer-events-none"
        } ${
          !open && displayChar === null ? "invisible" : ""
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={displayChar ? t('kanjiDrawer.ariaLabel', { char: displayChar }) : undefined}
        className={`fixed top-0 right-0 z-50 h-dvh w-full sm:w-[420px] border-l-3 shadow-[var(--shadow-sheet)] transition-transform duration-300 ease-out overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        } ${
          // Fully hidden once closed and emptied: no layer, no shadow raster.
          !open && displayChar === null ? "invisible" : ""
        }`}
        style={{ backgroundColor: "rgb(255,255,255)", color: DRAWER_INK, borderColor: DRAWER_HAIRLINE }}
      >
        {/* No SpeakButton here: a bare, out-of-context kanji has no single
            correct reading (this is exactly why the panel below lists every
            on'yomi/kun'yomi rather than picking one), guessing one via TTS
            would show a specific pronunciation as if it were THE answer. */}
        <div className="flex items-center justify-between gap-2 p-4 border-b-3" style={{ borderColor: DRAWER_HAIRLINE }}>
          <div className="flex items-center gap-1.5">
            {history.length > 0 && (
              <NavButton onClick={goBack} label={t('kanjiDrawer.back')}>↩</NavButton>
            )}
            {orderIndex >= 0 && <NavButton onClick={() => step(-1)} label={t('kanjiDrawer.prev')}>‹</NavButton>}
            <div className="text-2xl font-black jp mx-1" style={{ color: DRAWER_INK }}>{displayChar}</div>
            {orderIndex >= 0 && <NavButton onClick={() => step(1)} label={t('kanjiDrawer.next')}>›</NavButton>}
            {orderIndex >= 0 && (
              <span className="text-[10px] font-bold ml-1" style={{ color: DRAWER_MUTED }}>{orderIndex + 1}/{order.length}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="font-black text-sm cursor-pointer transition-colors"
            style={{ color: DRAWER_MUTED }}
            onMouseEnter={e => { e.currentTarget.style.color = DRAWER_ACCENT }}
            onMouseLeave={e => { e.currentTarget.style.color = DRAWER_MUTED }}
          >
            × {t('kanjiDrawer.close')}
          </button>
        </div>

        {!vgData && !vgFailed && displayChar && (
          <div className="p-6 text-center font-bold text-sm" style={{ color: DRAWER_MUTED }}>
            {t('kanjiDrawer.loadingStrokes')}
          </div>
        )}

        {!entry && displayChar && (vgData || vgFailed) && (
          <div className="p-6 text-center">
            <div className="font-bold text-sm mb-4" style={{ color: DRAWER_MUTED }}>
              {t('kanjiDrawer.noAnimation')}
            </div>
            {radicalInfo && (
              <div className="mb-3 border p-3 text-left" style={{ borderColor: DRAWER_MUTED }}>
                <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: DRAWER_MUTED }}>{t('kanjiDrawer.radicalCard')}</div>
                <div className="text-lg font-black" style={{ color: DRAWER_INK }}>{radicalInfo.hanviet}</div>
                {radicalInfo.meaning && <div className="text-sm font-bold" style={{ color: DRAWER_MUTED }}>{radicalInfo.meaning}</div>}
              </div>
            )}
            {hanviet && (
              <HanVietBadge hanviet={hanviet} label={t('kanjiDrawer.hanvietLabel')} />
            )}
            <ReadingsSection meaningText={meaningText} onReadings={onReadings} kunReadings={kunReadings} levelLabel={levelLabel} />
          </div>
        )}

        {entry && (
          <div className="p-4">
            <div className="border-3" style={{ backgroundColor: "rgb(255,255,255)", borderColor: DRAWER_HAIRLINE }}>
              <AnimatedKanjiSvg
                strokes={entry.strokes}
                viewBox={entry.viewBox}
                replayKey={replayKey}
                strokeColors={strokeColors}
                showNumbers={showNumbers}
                className="w-full aspect-square"
              />
            </div>

            {hanviet && (
              <div className="mt-3">
                <HanVietBadge hanviet={hanviet} label={t('kanjiDrawer.hanvietLabel')} />
              </div>
            )}

            {radicalInfo && (!hanviet || !meaningText) && (
              <div className="mt-3 border p-3 text-left" style={{ borderColor: DRAWER_MUTED }}>
                <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: DRAWER_MUTED }}>{t('kanjiDrawer.radicalCard')}</div>
                <div className="text-base font-black" style={{ color: DRAWER_INK }}>{radicalInfo.hanviet}</div>
                {radicalInfo.meaning && <div className="text-xs font-bold mt-0.5" style={{ color: DRAWER_MUTED }}>{radicalInfo.meaning}</div>}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mt-3">
              <span
                className="px-2.5 py-1.5 border font-black text-xs uppercase tracking-wider"
                style={{ borderColor: DRAWER_HAIRLINE, color: DRAWER_MUTED }}
              >
                {t('kanjiDrawer.strokeCount', { n: entry.strokes.length })}
              </span>
              <button
                onClick={() => setShowNumbers(v => !v)}
                aria-pressed={showNumbers}
                title={t('kanjiDrawer.showNumbers')}
                className="flex items-center gap-1.5 px-3 py-1.5 border rounded-[var(--radius-sm)] font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
                style={{ borderColor: showNumbers ? DRAWER_ACCENT : DRAWER_MUTED, color: showNumbers ? DRAWER_ACCENT : DRAWER_INK }}
              >
                123
              </button>
              <button
                onClick={() => setReplayKey(k => k + 1)}
                title={t('kanjiDrawer.replay')}
                className="flex items-center gap-1.5 px-3 py-1.5 border rounded-[var(--radius-sm)] font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
                style={{ borderColor: DRAWER_MUTED, color: DRAWER_INK }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#f4f2ec" }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent" }}
              >
                <ReplayIcon />
                {t('kanjiDrawer.replay')}
              </button>
            </div>

            <ReadingsSection meaningText={meaningText} onReadings={onReadings} kunReadings={kunReadings} levelLabel={levelLabel} />

            {rules.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: DRAWER_MUTED }}>{t('kanjiDrawer.rulesTitle')}</div>
                <div className="flex flex-wrap gap-1.5">
                  {rules.map(r => (
                    <Link
                      key={r.id}
                      to="/rules#on-yomi"
                      onClick={onClose}
                      className="px-2 py-1 border text-xs font-bold"
                      style={{ borderColor: DRAWER_ORANGE, color: DRAWER_ORANGE }}
                    >
                      {r.vi} → {r.ja}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {groupedComponents.length > 0 && (
              <div className="mt-5">
                <div className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: DRAWER_MUTED }}>{t('kanjiDrawer.componentsTitle')}</div>
                <div className="flex flex-wrap gap-1.5 p-2 border" style={{ backgroundColor: "rgb(255,255,255)", borderColor: DRAWER_HAIRLINE }}>
                  {groupedComponents.map((g, gi) => {
                    const name = radicalNames[g.element]
                    // bothu.pdf name first; a non-radical component that is
                    // itself a kanji (e.g. 吾) falls back to its Hán Việt.
                    const label = shortName(name?.hanviet) || hanVietForChar(g.element)
                    const positionLabel = g.positions.length === 1 ? (POSITION_LABELS[g.positions[0]] ?? g.positions[0]) : null
                    const tooltip = [name?.meaning, positionLabel].filter(Boolean).join(" · ")
                    const color = strokeColors ? COMPONENT_COLORS[gi % COMPONENT_COLORS.length] : DRAWER_MUTED
                    return (
                      <span
                        key={g.element}
                        title={tooltip || undefined}
                        className="group inline-flex items-center gap-1 px-2 py-1 border text-sm font-bold jp cursor-pointer transition-colors"
                        style={{ borderColor: color, color }}
                        onMouseEnter={() => setHoverElement(g.element)}
                        onMouseLeave={() => setHoverElement(null)}
                        onClick={() => goTo(g.element)}
                      >
                        [ {g.element}{label ? ` - ${label}` : ""} ]
                        {g.count > 1 && <span className="font-black">×{g.count}</span>}
                      </span>
                    )
                  })}
                </div>
                {graphNodes.length > 0 && (
                  <div className="mt-3 border p-2" style={{ borderColor: DRAWER_HAIRLINE }}>
                    <div className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: DRAWER_MUTED }}>{t('kanjiDrawer.graphTitle')}</div>
                    <ComponentGraph
                      char={displayChar ?? ""}
                      charLabel={hanviet}
                      nodes={graphNodes}
                      hovered={hoverElement}
                      onHover={setHoverElement}
                      onSelect={goTo}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
