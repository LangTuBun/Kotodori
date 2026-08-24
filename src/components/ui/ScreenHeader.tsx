import type { ReactNode } from "react"
import { Reveal } from "./Reveal"

/** Giant faint kanji sitting behind a screen header — Tori's signature watermark. */
export function Watermark({ char, className = "" }: { char: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={[
        "jp pointer-events-none select-none absolute leading-none",
        "text-[clamp(9rem,22vw,17rem)] opacity-[0.055] -top-8 right-0",
        className,
      ].join(" ")}
    >
      {char}
    </span>
  )
}

interface ScreenHeaderProps {
  eyebrowJa?: string
  eyebrowEn: string
  title: string
  description?: ReactNode
  watermark?: string
  right?: ReactNode
}

/** eyebrow (jp · CAPS) -> giant serif title -> muted description, with watermark. */
export function ScreenHeader({ eyebrowJa, eyebrowEn, title, description, watermark, right }: ScreenHeaderProps) {
  return (
    <header className="relative pt-2 pb-10 overflow-hidden">
      {watermark && <Watermark char={watermark} />}
      <div className="relative flex items-start justify-between gap-6">
        <div className="max-w-xl">
          <Reveal index={0}>
            <p className="font-mono text-xs tracking-[0.16em] text-accent font-bold uppercase">
              {eyebrowJa && <span className="jp mr-2 normal-case text-sm">{eyebrowJa}</span>}
              <span className="opacity-80">· {eyebrowEn}</span>
            </p>
          </Reveal>
          <Reveal index={1}>
            <h1 className="font-display text-[clamp(2.1rem,5vw,3.2rem)] leading-[1.05] tracking-[-0.02em] mt-3">
              {title}
            </h1>
          </Reveal>
          {description && (
            <Reveal index={2}>
              <p className="text-muted mt-4 leading-relaxed">{description}</p>
            </Reveal>
          )}
        </div>
        {right && (
          <Reveal index={2} className="shrink-0">
            {right}
          </Reveal>
        )}
      </div>
    </header>
  )
}
