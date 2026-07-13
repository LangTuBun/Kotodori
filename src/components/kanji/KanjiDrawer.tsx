import { useEffect, useState } from "react"
import kanjivgJson from "@/data/n5/kanjivg.json"
import radicalNamesJson from "@/data/n5/radical-names.json"
import type { KanjiVgData, RadicalNamesData } from "@/types"
import { AnimatedKanjiSvg } from "./AnimatedKanjiSvg"

const kanjivgData = kanjivgJson as KanjiVgData
const radicalNames = radicalNamesJson as RadicalNamesData

const POSITION_LABELS: Record<string, string> = {
  left: "trái", right: "phải", top: "trên", bottom: "dưới",
  kamae: "bao quanh", kamaec: "bao quanh",
  nyo: "bao góc", nyoc: "bao góc",
  tare: "rủ xuống", tarec: "rủ xuống",
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
        aria-label={displayChar ? `Hoạt hình nét chữ ${displayChar}` : undefined}
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
            × Đóng
          </button>
        </div>

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
                title="Xem lại"
                className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-ink font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-surface transition-colors"
              >
                <ReplayIcon />
                Xem lại
              </button>
            </div>

            {entry.components.length > 0 && (
              <div className="mt-5">
                <div className="text-xs font-black uppercase tracking-wider text-muted mb-2">Bộ thủ / thành phần</div>
                <ul className="space-y-1.5">
                  {entry.components.map((comp, i) => {
                    const name = radicalNames[comp.element]
                    return (
                      <li key={i} className="flex items-center gap-2 text-sm border-2 border-ink px-2 py-1.5">
                        <span className="text-lg jp font-bold shrink-0" style={{ color: "#2e3257" }}>{comp.element}</span>
                        <span className="flex-1 min-w-0">
                          {name ? (
                            <span className="font-bold">{name.hanviet}</span>
                          ) : (
                            <span className="text-muted italic">chưa rõ tên</span>
                          )}
                          {comp.isRadical && (
                            <span className="ml-1.5 text-[9px] font-black uppercase tracking-wider px-1 py-0.5 border border-ink/30 text-muted">
                              bộ
                            </span>
                          )}
                        </span>
                        {comp.position && (
                          <span className="text-[10px] font-bold text-muted shrink-0">{POSITION_LABELS[comp.position] ?? comp.position}</span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
