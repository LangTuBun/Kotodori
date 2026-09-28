import { useId, useSyncExternalStore, type CSSProperties } from "react"
import { getActiveSpeechId, isSpeechSupported, speak, subscribeSpeech } from "@/lib/speech"
import { useTranslation } from "@/lib/useTranslation"

interface SpeakButtonProps {
  /** What to read aloud. Pass the word's *kana* reading, not its kanji
   *  spelling -- the synthetic voice guesses at readings for kanji it
   *  hasn't seen in context (今日, 一日, 何, counters like 一本...) and can
   *  guess wrong, which is worse than no button in a learning app. Full
   *  example sentences are the exception: pass their `ja` form, since
   *  surrounding context is exactly what the engine needs to disambiguate
   *  a kanji reading. Never pass romaji or a mixed-placeholder grammar
   *  pattern like "N1は N2です". */
  text: string
  /** 'sm' for inline use next to a word in a list row, 'md' for a modal/
   *  detail header where the button stands on its own. */
  size?: "sm" | "md"
  className?: string
  /** Escape hatch for surfaces with hardcoded (non-theme-variable) colors,
   *  e.g. KanjiDrawer's always-white practice-paper panel. Inline style wins
   *  over the text-muted/text-accent utility classes below since it has
   *  higher specificity; the scale pulse (an animation, not a color change)
   *  still shows while speaking even with a fixed color here. */
  style?: CSSProperties
}

const SIZE_PX = { sm: 15, md: 19 }

/**
 * Speaker icon button that reads `text` aloud via the device's built-in
 * Japanese voice (see src/lib/speech.ts) -- no audio files, no network call.
 * Pulses while its own utterance is the one playing; tapping a different
 * SpeakButton interrupts it, matching how a single voice can only say one
 * thing at a time.
 */
export function SpeakButton({ text, size = "sm", className = "", style }: SpeakButtonProps) {
  const { t } = useTranslation()
  const id = useId()
  // A boolean snapshot, not the raw active id -- with dozens/hundreds of
  // SpeakButtons mounted (a scrolled Vocab list), returning the shared id
  // would re-render every one of them on every start/end instead of just
  // the two whose active-ness actually changed.
  const isActive = useSyncExternalStore(subscribeSpeech, () => getActiveSpeechId() === id)
  // The only thing worth disabling for: no such device API at all. Whether
  // a Japanese voice is loaded can't be known reliably up front (getVoices()
  // legitimately stays briefly empty, especially on iOS, right up until it
  // isn't) -- disabling on that would show a dead-looking button on exactly
  // the platform this app targets.
  const disabled = !isSpeechSupported() || !text.trim()
  const label = t("common.playPronunciation", { text })

  return (
    <button
      type="button"
      disabled={disabled}
      title={disabled ? t("common.speechUnavailable") : label}
      aria-label={label}
      style={style}
      onClick={e => {
        e.stopPropagation()
        speak(text, { id })
      }}
      className={`inline-flex items-center justify-center shrink-0 transition-colors ${
        disabled
          ? "text-muted/50 cursor-not-allowed"
          : `cursor-pointer ${isActive ? "text-accent anim-speak-pulse" : "text-muted hover:text-accent"}`
      } ${className}`}
    >
      <svg width={SIZE_PX[size]} height={SIZE_PX[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        {isActive && <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />}
      </svg>
    </button>
  )
}
