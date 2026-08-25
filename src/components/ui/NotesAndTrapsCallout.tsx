import type { GrammarPitfall } from "@/types"
import { useTranslation } from "@/lib/useTranslation"

interface NotesAndTrapsCalloutProps {
  pitfalls: GrammarPitfall[]
  /** Resolve a related grammar id to its display pattern for cross-links. */
  onJumpTo?: (grammarId: string) => void
  patternById?: Record<string, string>
}

// false_friend and common_mistake are the two types the spec calls out as
// "critical" -- inverted ink/paper theme makes them impossible to skim past.
// nuance_trap is presented as a softer, accent-bordered callout instead.
const CRITICAL_TYPES: GrammarPitfall['type'][] = ['false_friend', 'common_mistake']

export function NotesAndTrapsCallout({ pitfalls, onJumpTo, patternById }: NotesAndTrapsCalloutProps) {
  const { t, localize } = useTranslation()
  if (!pitfalls || pitfalls.length === 0) return null

  return (
    <div className="space-y-3">
      {pitfalls.map((p, i) => {
        const critical = CRITICAL_TYPES.includes(p.type)
        return (
          <div
            key={i}
            className={`border-3 p-4 ${critical ? 'bg-ink text-paper border-ink' : 'border-red/60 bg-red/5'}`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 border-2 rounded-[var(--radius-sm)] ${
                  critical ? 'border-paper/40 text-paper' : 'border-red text-red'
                }`}
              >
                {critical ? '⚠ ' : ''}{t(`grammar.notes.type.${p.type}`)}
              </span>
            </div>
            <div className="font-black text-sm mb-1.5 leading-snug">{p.title}</div>
            <div className={`text-sm leading-relaxed ${critical ? 'text-paper/85' : 'text-ink/80'}`}>
              {localize(p.description)}
            </div>

            {p.examples && p.examples.length > 0 && (
              <div className="mt-3 space-y-2">
                {p.examples.map((ex, j) => (
                  <div key={j} className={`text-sm border-l-3 pl-3 ${critical ? 'border-paper/30' : 'border-red/40'}`}>
                    <div className="flex items-start gap-1.5">
                      <span className={critical ? 'text-paper/60' : 'text-red/70'}>✗</span>
                      <span className="jp line-through decoration-2">{ex.incorrect}</span>
                    </div>
                    <div className="flex items-start gap-1.5 mt-0.5">
                      <span className={critical ? 'text-green' : 'text-green'}>✓</span>
                      <span className="jp font-bold">{ex.correct}</span>
                    </div>
                    {ex.explanation && (
                      <div className={`mt-0.5 text-xs ${critical ? 'text-paper/60' : 'text-muted'}`}>
                        {localize(ex.explanation)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {p.relatedGrammarId && (
              <button
                type="button"
                onClick={() => onJumpTo?.(p.relatedGrammarId!)}
                disabled={!onJumpTo}
                className={`mt-3 text-xs font-bold underline cursor-pointer disabled:no-underline disabled:cursor-default ${
                  critical ? 'text-paper/80 hover:text-paper' : 'text-red hover:text-red/80'
                }`}
              >
                → {patternById?.[p.relatedGrammarId] ?? p.relatedGrammarId}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
