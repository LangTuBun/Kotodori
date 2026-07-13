import { useLayoutEffect, useRef } from "react"

interface AnimatedKanjiSvgProps {
  strokes: string[]
  viewBox: string
  replayKey: number
  strokeMs?: number
  className?: string
}

const GUIDE_COLOR = "#627d9a"
const STROKE_COLOR = "#2e3257"

// Draws each stroke path via a stroke-dasharray/dashoffset reveal, timed
// sequentially (stroke i starts once stroke i-1 finishes). Re-runs whenever
// `strokes` (new kanji) or `replayKey` (Replay button) changes. Refs stay
// stable across replays — paths are never remounted — so the "hide, then
// reveal on the next frame" reset never flashes the fully-drawn kanji first.
export function AnimatedKanjiSvg({ strokes, viewBox, replayKey, strokeMs = 500, className = "" }: AnimatedKanjiSvgProps) {
  const pathRefs = useRef<Array<SVGPathElement | null>>([])

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
        path.style.transition = `stroke-dashoffset ${strokeMs}ms ease-in-out ${i * strokeMs}ms`
        path.style.strokeDashoffset = "0"
      })
    })
    return () => cancelAnimationFrame(raf)
  }, [strokes, replayKey, strokeMs])

  return (
    <svg viewBox={viewBox} className={className} style={{ backgroundColor: "rgb(255,255,255)" }}>
      <g fill="none" stroke={GUIDE_COLOR} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        {strokes.map((d, i) => (
          <path key={`guide-${i}`} d={d} />
        ))}
      </g>
      <g fill="none" stroke={STROKE_COLOR} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        {strokes.map((d, i) => (
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
  )
}
