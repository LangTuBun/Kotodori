import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import type { GrammarLink, GrammarPoint } from "@/types"
import { loadGrammar } from "@/data/grammar"
import { useTranslation } from "@/lib/useTranslation"
import { Ruby } from "./Ruby"

// N5 grammar is chapters 1–14 and N4 16–33; later N4 records lack jlptLevel.
const levelOf = (g: GrammarLink) => (g.jlptLevel as 'N5' | 'N4' | undefined) ?? (g.chapter >= 16 ? 'N4' : 'N5')

/**
 * A grammar link that previews the lesson on hover or keyboard focus. On touch, the
 * first tap opens the preview and the preview's own link opens the lesson.
 */
export function GrammarHoverLink({ g, children, className = "" }: { g: GrammarLink; children: ReactNode; className?: string }) {
  const { localize } = useTranslation()
  const l = (en: string, vi: string) => localize({ en, vi })
  const [open, setOpen] = useState(false)
  const [point, setPoint] = useState<GrammarPoint | null>(null)
  const touch = useRef(false)
  const closeTimer = useRef<number | undefined>(undefined)
  const id = useId()
  const level = levelOf(g)
  const href = `/grammar?point=${g.id}`

  useEffect(() => {
    if (!open || point) return
    let live = true
    // Full point (explanation, examples) loads only on first preview; the chunk is cached after.
    loadGrammar(level).then(d => { if (live) setPoint(d.grammar.find(p => p.id === g.id) ?? null) }, () => {})
    return () => { live = false }
  }, [open, point, level, g.id])
  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  const show = () => { window.clearTimeout(closeTimer.current); setOpen(true) }
  const hide = () => { closeTimer.current = window.setTimeout(() => setOpen(false), 120) }
  const example = point?.examples?.[0]

  return <span className="relative inline-block" onPointerEnter={e => { if (e.pointerType === "mouse") show() }} onPointerLeave={e => { if (e.pointerType === "mouse") hide() }} onKeyDown={e => { if (e.key === "Escape") setOpen(false) }}>
    <Link to={href} className={className} aria-describedby={open ? id : undefined}
      onPointerDown={e => { touch.current = e.pointerType !== "mouse" }}
      onFocus={show} onBlur={hide}
      onClick={e => { if (touch.current && !open) { e.preventDefault(); show() } }}>{children}</Link>
    {open && <span id={id} role="tooltip" onPointerEnter={show} onPointerLeave={hide}
      className="absolute left-0 top-full z-40 mt-2 block w-80 max-w-[calc(100vw-3rem)] rounded-xl border border-structural bg-card p-4 text-left text-sm font-normal leading-relaxed text-ink shadow-[0_12px_32px_rgb(0_0_0/0.18)]">
      <span className="flex items-baseline justify-between gap-3">
        <span className="jp font-bold text-base">{g.pattern}</span>
        <span className="text-xs text-muted shrink-0">{level} · {l("Ch.", "Bài")} {g.chapter}</span>
      </span>
      <span className="block mt-1 font-bold">{localize(g.meaning)}</span>
      {point ? <>
        {point.explanation && <span className="block mt-2 text-muted line-clamp-4">{localize(point.explanation)}</span>}
        {example && <span className="block mt-3 border-l-2 border-blue pl-3">
          <Ruby html={example.jaRuby} text={example.ja} className="block leading-loose" />
          <span className="block text-xs text-muted">{localize(example)}</span>
        </span>}
      </> : <span className="block mt-2 text-xs text-muted" role="status">{l("Loading lesson…", "Đang tải bài…")}</span>}
      <Link to={href} className="inline-flex items-center min-h-11 mt-1 text-sm font-bold underline underline-offset-4">{l("Open full lesson", "Mở bài đầy đủ")} →</Link>
    </span>}
  </span>
}
