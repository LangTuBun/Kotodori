import { useLayoutEffect, useRef } from "react"

interface AnimatedKanjiSvgProps {
  strokes: string[]
  viewBox: string
  replayKey: number
  strokeMs?: number
  className?: string
  /** Defaults reproduce the fixed white practice-sheet look (KanjiDrawer).
   *  Pass "transparent" + theme tokens to blend into a themed page instead. */
  background?: string
  guideColor?: string
  strokeColor?: string
  /** Guide layer opacity. The guide renders instantly (unanimated) behind
   *  the animated ink layer -- if the two colors ever end up the same (e.g.
   *  `--color-structural` *is* full ink in the light themes, not a muted
   *  tone), a guideColor/strokeColor pair alone can't guarantee contrast, so
   *  this dims the guide independently and actually guarantees the draw-in
   *  reads as an animation instead of a static, already-finished glyph. */
  guideOpacity?: number
}

const GUIDE_COLOR = "#627d9a"
const STROKE_COLOR = "#2e3257"

// Draws each stroke path via a stroke-dasharray/dashoffset reveal, timed
// sequentially (stroke i starts once stroke i-1 finishes). Re-runs whenever
// `strokes` (new kanji) or `replayKey` (Replay button) changes. Refs stay
// stable across replays — paths are never remounted — so the "hide, then
// reveal on the next frame" reset never flashes the fully-drawn kanji first.
export function AnimatedKanjiSvg({
  strokes,
  viewBox,
  replayKey,
  strokeMs = 500,
  className = "",
  background = "rgb(255,255,255)",
  guideColor = GUIDE_COLOR,
  strokeColor = STROKE_COLOR,
  guideOpacity = 1,
}: AnimatedKanjiSvgProps) {
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
    <svg viewBox={viewBox} className={className} style={{ backgroundColor: background }}>
      <g fill="none" stroke={guideColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={guideOpacity}>
        {strokes.map((d, i) => (
          <path key={`guide-${i}`} d={d} />
        ))}
      </g>
      <g fill="none" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
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
