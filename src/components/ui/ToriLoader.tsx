import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { TORI_STROKES, TORI_VIEW_BOX } from "./tori-glyph"

// Self-contained Tori bird (鳥) loader for the route Suspense fallback.
// App.tsx's RouteFallback renders *before* any lazy chunk (including
// kanjivg.json, ~600KB) has loaded, so this can't import AnimatedKanjiSvg's
// data dependency -- the 鳥 stroke paths from src/data/kanjivg.json are
// hardcoded in ./tori-glyph instead, keeping this component (and its data) in
// the main bundle. Same stroke-dashoffset draw-in technique as AnimatedKanjiSvg
// (src/components/kanji/AnimatedKanjiSvg.tsx), just self-contained and
// tuned faster (~300ms/stroke) so it reads as a loading spinner, not a demo.
const STROKE_MS = 320
// Full draw takes strokeCount * STROKE_MS (~3.5s); loop a little past that
// so the finished glyph holds for a beat before redrawing.
const LOOP_MS = TORI_STROKES.length * STROKE_MS + 700

export function ToriLoader() {
  const pathRefs = useRef<Array<SVGPathElement | null>>([])
  const [replayKey, setReplayKey] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setReplayKey(k => k + 1), LOOP_MS)
    return () => clearInterval(id)
  }, [])

  useLayoutEffect(() => {
    const paths = pathRefs.current.filter((p): p is SVGPathElement => p !== null)
    if (paths.length === 0) return

    for (const path of paths) {
      const length = path.getTotalLength()
      path.style.transition = "none"
      path.style.strokeDasharray = `${length}`
      path.style.strokeDashoffset = `${length}`
    }

    const raf = requestAnimationFrame(() => {
      paths.forEach((path, i) => {
        path.style.transition = `stroke-dashoffset ${STROKE_MS}ms ease-in-out ${i * STROKE_MS}ms`
        path.style.strokeDashoffset = "0"
      })
    })
    return () => cancelAnimationFrame(raf)
  }, [replayKey])

  return (
    <div className="h-full flex items-center justify-center p-8">
      <svg viewBox={TORI_VIEW_BOX} className="w-20 h-20" aria-hidden="true">
        <g fill="none" stroke="var(--color-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.4}>
          {TORI_STROKES.map((d, i) => (
            <path key={`guide-${i}`} d={d} />
          ))}
        </g>
        <g fill="none" stroke="var(--color-ink)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          {TORI_STROKES.map((d, i) => (
            <path
              key={`stroke-${i}`}
              ref={el => {
                pathRefs.current[i] = el
              }}
              d={d}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
