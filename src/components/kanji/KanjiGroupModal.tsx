import { useEffect } from "react"
import type { KanjiGroup } from "@/types"
import { Furigana } from "@/components/ui/Furigana"
import { ACCENT_HEX, accentFor, cleanReadings, onkunTone } from "@/lib/kanji"
import { useTranslation } from "@/lib/useTranslation"

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false
  const tag = el.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || (el as HTMLElement).isContentEditable
}

interface KanjiGroupModalProps {
  items: Array<{ chapterNum: number; group: KanjiGroup }>
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
  onAnchorClick: (char: string) => void
  strokeDrawerOpen: boolean
}

export function KanjiGroupModal({ items, index, onIndexChange, onClose, onAnchorClick, strokeDrawerOpen }: KanjiGroupModalProps) {
  const { t } = useTranslation()
  const total = items.length
  const current = items[index]
  const hasPrev = index > 0
  const hasNext = index < total - 1

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(document.activeElement)) return
      // Let the stroke drawer's own Escape handler close it first rather
      // than closing both layers on one keypress (same pattern as VocabModal).
      if (strokeDrawerOpen) return
      if (e.key === "Escape") { onClose(); return }
      if (e.key === "ArrowLeft" && hasPrev) { e.preventDefault(); onIndexChange(index - 1); return }
      if (e.key === "ArrowRight" && hasNext) { e.preventDefault(); onIndexChange(index + 1) }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [strokeDrawerOpen, hasPrev, hasNext, index, onIndexChange, onClose])

  if (!current) return null
  const { chapterNum, group } = current
  const on = cleanReadings(group.onyomi, Infinity)
  const kun = cleanReadings(group.kunyomi, Infinity)
  const accent = accentFor(index)

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 z-30 bg-ink/30 backdrop-blur-sm"
      />
      <div className="fixed inset-0 z-30 flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('kanjiDrawer.ariaLabel', { char: group.anchor })}
          onClick={e => e.stopPropagation()}
          className="pointer-events-auto w-full max-w-3xl max-h-[85vh] overflow-y-auto border-3 border-ink shadow-[6px_6px_0px_var(--color-ink)] bg-paper"
        >
          {/* List navigation */}
          <div className="flex items-center gap-3 p-3 border-b-3 border-ink bg-surface">
            <button
              onClick={() => onIndexChange(index - 1)}
              disabled={!hasPrev}
              title={t('kanji.prevGroup')}
              className="w-8 h-8 border-2 border-ink font-black flex items-center justify-center hover:bg-paper disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            <div className="flex-1 text-center text-xs font-bold uppercase tracking-wider text-muted">
              {index + 1} / {total}
            </div>
            <button
              onClick={() => onIndexChange(index + 1)}
              disabled={!hasNext}
              title={t('kanji.nextGroup')}
              className="w-8 h-8 border-2 border-ink font-black flex items-center justify-center hover:bg-paper disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
          </div>

          {/* Header: anchor + Hán Việt + On/Kun */}
          <div
            className="border-b-3 border-ink p-6"
            style={{ borderLeftWidth: '6px', borderLeftColor: ACCENT_HEX[accent] }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => onAnchorClick(group.anchor)}
                  title={t('kanji.viewStrokeAnim')}
                  className="appearance-none bg-transparent border-0 p-0 m-0 text-7xl font-black jp leading-none shrink-0 cursor-pointer transition-transform hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-ink/40 rounded-sm"
                >
                  {group.anchor}
                </button>
                <div className="pt-2">
                  {group.hanviet && (
                    <span className="text-sm font-black px-2 py-1 border-2 border-ink rounded-[var(--radius-sm)] bg-surface inline-block">
                      {group.hanviet}
                    </span>
                  )}
                  {group.meaning && (
                    <div className="text-sm text-muted mt-2">{group.meaning}</div>
                  )}
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted mt-1">
                    {t('common.chapterN', { n: chapterNum })}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="font-black text-lg hover:text-red transition-colors shrink-0"
              >
                ×
              </button>
            </div>

            {/* Full On'yomi / Kun'yomi reading lists */}
            <div className="flex flex-wrap items-center gap-1.5 mt-4">
              {on.shown.length > 0 && (
                <span className="text-[10px] font-black uppercase tracking-wider text-blue/70">On</span>
              )}
              {on.shown.map(r => (
                <span key={`on-${r}`} className="jp text-sm font-bold px-2 py-1 border border-blue/30 bg-blue/10 text-blue">
                  {r}
                </span>
              ))}

              {kun.shown.length > 0 && (
                <span className="text-[10px] font-black uppercase tracking-wider text-green/70 ml-2">Kun</span>
              )}
              {kun.shown.map(r => (
                <span key={`kun-${r}`} className="jp text-sm font-bold px-2 py-1 border border-green/30 bg-green/10 text-green">
                  {r}
                </span>
              ))}

              {on.shown.length === 0 && kun.shown.length === 0 && (
                <span className="text-xs text-muted italic">{t('kanji.unknownReading')}</span>
              )}
            </div>
          </div>

          {/* Vocabulary list */}
          <div className="p-6">
            <div className="text-xs font-black uppercase tracking-wider text-muted mb-3">
              {t('kanji.relatedWords')}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.words.map((w, i) => (
                <div
                  key={i}
                  className="border-2 border-ink/15 p-3 flex flex-col gap-1 transition-shadow hover:border-ink hover:shadow-[3px_3px_0px_var(--color-ink)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="jp font-bold text-lg leading-snug">
                      <Furigana kanji={w.kanji} kana={w.kana} onKanjiClick={onAnchorClick} />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider shrink-0 pt-0.5" style={{ color: onkunTone(w.onkun) }}>
                      {w.onkun}
                    </span>
                  </div>
                  <div className="text-sm text-muted leading-snug">
                    {w.meaning} <span className="text-xs ml-1">({w.hanviet})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
