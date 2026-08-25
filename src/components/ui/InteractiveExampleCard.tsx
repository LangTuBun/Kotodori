import { useState } from "react"
import type { EnhancedGrammarExample } from "@/types"
import { Ruby } from "@/components/ui/Ruby"
import { useTranslation } from "@/lib/useTranslation"

interface InteractiveExampleCardProps {
  example: EnhancedGrammarExample
  /** Furigana/romaji visibility is a shared toggle owned by the caller
   * (one control affecting every card in the list), not per-card state --
   * flipping it example-by-example while reading a set is more friction
   * than feature. */
  showFurigana: boolean
  showRomaji: boolean
  accentHex?: string
}

export function InteractiveExampleCard({ example, showFurigana, showRomaji, accentHex }: InteractiveExampleCardProps) {
  const { t, localize } = useTranslation()
  const [open, setOpen] = useState(false)
  const hasExplanation = !!(example.contextualExplanation?.vi || example.contextualExplanation?.en)

  return (
    <div
      className="border-3 border-structural bg-paper p-4"
      style={accentHex ? { borderLeftWidth: '6px', borderLeftColor: accentHex } : undefined}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 border-2 border-structural rounded-[var(--radius-sm)] text-muted">
          {t(`grammar.examples.category.${example.category}`)}
        </span>
        {/* Inactive audio stub -- no audio assets exist yet, kept visible so
            the affordance is discoverable once audioStub is wired up. */}
        <button
          type="button"
          disabled
          title={example.audioStub ? undefined : 'Audio coming soon'}
          className="text-muted/50 cursor-not-allowed shrink-0"
          aria-label="Play audio (unavailable)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        </button>
      </div>

      <div className="font-bold text-lg leading-snug jp">
        <Ruby text={example.ja} html={showFurigana ? example.jaRuby : undefined} />
      </div>

      {showRomaji && example.romaji && (
        <div className="text-xs text-muted mt-1 font-mono">{example.romaji}</div>
      )}

      <div className="text-sm text-muted mt-1.5">{localize({ vi: example.vi, en: example.en })}</div>

      {hasExplanation && (
        <div className="mt-2 -mx-1">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            className="flex items-center gap-1.5 px-1 py-1 text-xs font-bold text-muted hover:text-ink cursor-pointer"
          >
            <svg
              width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              className={`shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            >
              <path d="M2 4l4 4 4-4" />
            </svg>
            {t('grammar.examples.explain')}
          </button>
          <div
            className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
          >
            <div className="overflow-hidden">
              <div className="px-1 pb-1 pt-0.5 text-sm text-ink/80 leading-relaxed">
                {localize(example.contextualExplanation)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
