import { useEffect, useMemo, useState } from "react"
import kanjivgJson from "@/data/n5/kanjivg.json"
import radicalNamesJson from "@/data/n5/radical-names.json"
import type { KanjiVgComponent, KanjiVgData, RadicalNamesData } from "@/types"
import { AnimatedKanjiSvg } from "./AnimatedKanjiSvg"
import { useTranslation } from "@/lib/useTranslation"

const kanjivgData = kanjivgJson as KanjiVgData
const radicalNames = radicalNamesJson as RadicalNamesData

interface GroupedComponent {
  element: string
  count: number
  isRadical: boolean
  positions: string[]
}

// Components can repeat (e.g. 森 → 木 木 木, from three separate SVG groups).
// Collapse same-element occurrences into one tag with a ×N multiplier —
// lighter than trying to lay tags out spatially, and it's what the
// "[ 木 - Mộc ] ×3" format calls for.
function groupComponents(components: KanjiVgComponent[]): GroupedComponent[] {
  const order: string[] = []
  const map = new Map<string, GroupedComponent>()
  for (const comp of components) {
    let g = map.get(comp.element)
    if (!g) {
      g = { element: comp.element, count: 0, isRadical: false, positions: [] }
      map.set(comp.element, g)
      order.push(comp.element)
    }
    g.count++
    if (comp.isRadical) g.isRadical = true
    if (comp.position && !g.positions.includes(comp.position)) g.positions.push(comp.position)
  }
  return order.map(el => map.get(el)!)
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

// Always-mounted right-side slide-over (translate-x + backdrop toggle) so the
// close transition can play — conditionally rendering would unmount mid-swipe.
// `displayChar` keeps the last kanji's content visible while it slides out;
// `char` alone would blank the panel before the transition finishes.
export function KanjiDrawer({ char, onClose }: KanjiDrawerProps) {
  const { t } = useTranslation()
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

  useEffect(() => {
    if (char !== null) {
      setDisplayChar(char)
      setReplayKey(k => k + 1)
    }
  }, [char])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  const entry = displayChar ? kanjivgData[displayChar] : undefined
  const groupedComponents = useMemo(
    () => (entry ? groupComponents(entry.components) : []),
    [entry]
  )

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={displayChar ? t('kanjiDrawer.ariaLabel', { char: displayChar }) : undefined}
        className={`fixed top-0 right-0 z-50 h-screen w-full sm:w-[420px] border-l-3 border-ink shadow-[-6px_0px_0px_rgba(10,10,10,0.15)] transition-transform duration-300 ease-out overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: "rgb(255,255,255)" }}
      >
        <div className="flex items-center justify-between p-4 border-b-3 border-ink">
          <div className="text-2xl font-black jp" style={{ color: "#2e3257" }}>{displayChar}</div>
          <button
            onClick={onClose}
            className="text-muted hover:text-red font-black text-sm cursor-pointer"
          >
            × {t('kanjiDrawer.close')}
          </button>
        </div>

        {!entry && displayChar && (
          <div className="p-6 text-center text-muted font-bold text-sm">
            {t('kanjiDrawer.noAnimation')}
          </div>
        )}

        {entry && (
          <div className="p-4">
            <div className="border-3 border-ink" style={{ backgroundColor: "rgb(255,255,255)" }}>
              <AnimatedKanjiSvg
                strokes={entry.strokes}
                viewBox={entry.viewBox}
                replayKey={replayKey}
                className="w-full aspect-square"
              />
            </div>

            <div className="flex justify-center mt-3">
              <button
                onClick={() => setReplayKey(k => k + 1)}
                title={t('kanjiDrawer.replay')}
                className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-ink rounded-[var(--radius-sm)] font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-surface transition-colors"
              >
                <ReplayIcon />
                {t('kanjiDrawer.replay')}
              </button>
            </div>

            {groupedComponents.length > 0 && (
              <div className="mt-5">
                <div className="text-xs font-black uppercase tracking-wider text-muted mb-2">{t('kanjiDrawer.componentsTitle')}</div>
                <div className="flex flex-wrap gap-1.5 p-2 border-2 border-ink/10" style={{ backgroundColor: "rgb(255,255,255)" }}>
                  {groupedComponents.map(g => {
                    const name = radicalNames[g.element]
                    const positionLabel = g.positions.length === 1 ? (POSITION_LABELS[g.positions[0]] ?? g.positions[0]) : null
                    return (
                      <span
                        key={g.element}
                        title={positionLabel ?? undefined}
                        className="group inline-flex items-center gap-1 px-2 py-1 border-2 text-sm font-bold jp cursor-default transition-colors"
                        style={{ borderColor: "#627d9a", color: "#627d9a" }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = "#2e3257"
                          e.currentTarget.style.color = "#2e3257"
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = "#627d9a"
                          e.currentTarget.style.color = "#627d9a"
                        }}
                      >
                        [ {g.element}{name ? ` - ${name.hanviet}` : ""} ]
                        {g.count > 1 && <span className="font-black">×{g.count}</span>}
                        {g.isRadical && <span className="text-[8px] font-black align-super">{t('kanjiDrawer.radicalBadge')}</span>}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
