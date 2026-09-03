import { useEffect, useLayoutEffect, useRef, useState } from "react"

// Self-contained Tori bird (鳥) loader for the route Suspense fallback.
// App.tsx's RouteFallback renders *before* any lazy chunk (including
// kanjivg.json, ~600KB) has loaded, so this can't import AnimatedKanjiSvg's
// data dependency -- the 鳥 stroke paths from src/data/n5/kanjivg.json are
// hardcoded here instead, keeping this component (and its data) in the main
// bundle. Same stroke-dashoffset draw-in technique as AnimatedKanjiSvg
// (src/components/kanji/AnimatedKanjiSvg.tsx), just self-contained and
// tuned faster (~300ms/stroke) so it reads as a loading spinner, not a demo.
const TORI_VIEW_BOX = "0 0 109 109"
const TORI_STROKES = [
  "M49.72,10.68c0.03,0.27,0.07,0.7-0.06,1.08c-0.76,2.28-5.15,7.3-11.15,10.37",
  "M32.88,23.32c0.96,0.8,1.57,2.55,1.57,3.69c0,6.86,0.02,24.01-0.12,35.24c-0.03,2.27-0.06,4.3-0.11,5.95",
  "M35.8,25.86c9.2-1.73,23.7-4.36,29.64-4.87c3.06-0.26,4.32,2.26,4.04,3.99c-0.15,0.92-1.49,7.58-3.2,14.78c-0.26,1.09-0.52,2.18-0.78,3.24",
  "M35.86,35.44c3.64-0.69,26.27-4.19,30.87-4.38",
  "M35.49,45.53c7.01-1.03,21.26-3.53,29.23-4.2",
  "M35.78,56.05c11.22-1.3,37.15-4.84,41.97-5.55c1.68-0.25,4.53-0.28,5.38-0.1",
  "M34.75,68.27c15.75-2.64,42-5.64,49.75-6.27c4.51-0.36,6.81,2.33,6,5.75c-2.25,9.5-5.82,18.96-9.5,25C77.5,98.5,74.75,96,71,93",
  "M20.81,80.25c0.44,6-0.31,13.25-1.6,17",
  "M34.38,78.38c2.97,1.96,5.79,7.37,6.54,10.43",
  "M48.88,75.12c2.34,1.57,6.04,6.44,6.62,8.88",
  "M62.88,72c2.69,1.68,6.95,6.89,7.62,9.5",
]
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
