import { useTranslation } from "@/lib/useTranslation"
import { splitMorae, pitchLevels, classifyPitchType } from "@/lib/japanese"

interface PitchAccentProps {
  /** The word's kana reading -- used only to count morae for the diagram
   *  (the diagram never re-renders the text; pair it visually with the
   *  word shown alongside it). */
  kana: string
  /** Accent-nucleus mora index (0 = heiban). Undefined = unknown accent --
   *  the component renders nothing rather than imply a value. */
  pitch?: number
  className?: string
  /** 'sm' for list rows/inline use, 'md' for detail views and flashcards. */
  size?: "sm" | "md"
  /** Show the heiban/atamadaka/nakadaka/odaka text label next to the graph. */
  showLabel?: boolean
}

const SIZES = {
  sm: { step: 12, dot: 2.5, highY: 4, lowY: 14, height: 18, stroke: 1.5 },
  md: { step: 16, dot: 3.5, highY: 5, lowY: 19, height: 24, stroke: 2 },
}

export function PitchAccent({ kana, pitch, className = "", size = "sm", showLabel = false }: PitchAccentProps) {
  const { t } = useTranslation()

  if (pitch === undefined || !kana) return null
  const morae = splitMorae(kana)
  if (morae.length === 0) return null

  const dims = SIZES[size]
  const { levels, afterLevel } = pitchLevels(morae.length, pitch)
  const type = classifyPitchType(pitch, morae.length)

  const y = (lvl: "H" | "L") => (lvl === "H" ? dims.highY : dims.lowY)
  const points = levels.map((lvl, i) => ({ x: dims.step * i + dims.step / 2, y: y(lvl) }))
  const afterPoint = { x: dims.step * levels.length + dims.step / 2, y: y(afterLevel) }
  const width = dims.step * (levels.length + 1)

  const label = t(`vocab.pitch.types.${type}`)
  const title = `${label} (${pitch}) — ${kana}`

  return (
    <span className={`inline-flex items-center gap-1 ${className}`} title={title}>
      <svg width={width} height={dims.height} viewBox={`0 0 ${width} ${dims.height}`} className="shrink-0" aria-hidden="true">
        {points.slice(0, -1).map((p, i) => (
          <line
            key={`seg-${i}`}
            x1={p.x} y1={p.y}
            x2={points[i + 1].x} y2={points[i + 1].y}
            stroke="var(--color-accent)"
            strokeWidth={dims.stroke}
          />
        ))}
        <line
          x1={points[points.length - 1].x} y1={points[points.length - 1].y}
          x2={afterPoint.x} y2={afterPoint.y}
          stroke="var(--color-muted)"
          strokeWidth={dims.stroke}
          strokeDasharray="2,2"
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={dims.dot} fill="var(--color-accent)" />
        ))}
        <circle cx={afterPoint.x} cy={afterPoint.y} r={dims.dot * 0.7} fill="none" stroke="var(--color-muted)" strokeWidth={dims.stroke * 0.8} />
      </svg>
      {showLabel && (
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted whitespace-nowrap">{label}</span>
      )}
    </span>
  )
}
