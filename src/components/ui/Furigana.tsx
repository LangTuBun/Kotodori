import { useTranslation } from "@/lib/useTranslation"

interface FuriganaProps {
  kanji: string
  kana?: string
  className?: string
  onKanjiClick?: (char: string) => void
}

// CJK ideographs + the 々 iteration mark (treated as part of the preceding kanji run)
const KANJI_RE = /[一-鿿㐀-䶿々]/
const HAS_KANJI_RE = new RegExp(KANJI_RE.source)

interface Run {
  text: string
  isKanji: boolean
}

interface Segment {
  text: string
  reading?: string
}

function splitRuns(text: string): Run[] {
  const runs: Run[] = []
  for (const ch of text) {
    const kanji = KANJI_RE.test(ch)
    const last = runs[runs.length - 1]
    if (last && last.isKanji === kanji) {
      last.text += ch
    } else {
      runs.push({ text: ch, isKanji: kanji })
    }
  }
  return runs
}

// Aligns a kanji+okurigana string against its full reading by anchoring on the
// literal (non-kanji) runs — auxiliary text that has no counterpart in `kana`
// (e.g. a leading （〜を） note) is left outside the ruby entirely.
//
// Returns null when a kanji run's reading boundary can't be located (its
// next literal doesn't appear in `kana` at all — e.g. a mid-string "(", "～",
// or "、" that's punctuation, not part of the pronunciation). Guessing here
// previously dumped the *entire remaining reading* onto that one kanji run;
// since the true split is unknowable without a dictionary, the caller falls
// back to plain text rather than showing a confidently-wrong alignment.
function alignFurigana(kanji: string, kana: string): Segment[] | null {
  const runs = splitRuns(kanji)
  const segments: Segment[] = []
  let pos = 0

  for (let i = 0; i < runs.length; i++) {
    const run = runs[i]

    if (!run.isKanji) {
      const idx = kana.indexOf(run.text, pos)
      if (idx === pos) {
        pos += run.text.length
      } else if (idx !== -1) {
        pos = idx + run.text.length
      }
      segments.push({ text: run.text })
      continue
    }

    const nextLiteral = runs.slice(i + 1).find(r => !r.isKanji)
    let end = kana.length
    if (nextLiteral) {
      const idx = kana.indexOf(nextLiteral.text, pos)
      if (idx === -1) return null
      end = idx
    }
    const reading = kana.slice(pos, end)
    segments.push({ text: run.text, reading: reading || undefined })
    pos = end
  }

  return segments
}

// Splits `text` into per-character spans, making kanji characters clickable
// (used for the stroke-order drawer) while leaving kana untouched. Reuses
// KANJI_RE rather than a second parser so clickability never drifts from the
// ruby-alignment logic above.
function renderClickable(text: string, onKanjiClick: (char: string) => void, title?: string) {
  return [...text].map((ch, i) =>
    KANJI_RE.test(ch) ? (
      <span
        key={i}
        role="button"
        tabIndex={0}
        title={title}
        onClick={e => { e.stopPropagation(); onKanjiClick(ch) }}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onKanjiClick(ch) }
        }}
        className="cursor-pointer rounded-sm transition-colors hover:bg-yellow/40"
      >
        {ch}
      </span>
    ) : (
      <span key={i}>{ch}</span>
    )
  )
}

export function Furigana({ kanji, kana, className = "", onKanjiClick }: FuriganaProps) {
  const { t } = useTranslation()
  const kanjiTitle = onKanjiClick ? t('kanji.viewStrokeAnim') : undefined

  if (!kana || kanji === kana || !HAS_KANJI_RE.test(kanji)) {
    const text = kanji || kana || ""
    return (
      <span className={`jp ${className}`}>
        {onKanjiClick ? renderClickable(text, onKanjiClick, kanjiTitle) : text}
      </span>
    )
  }

  const segments = alignFurigana(kanji, kana)
  if (!segments) {
    return (
      <span className={`jp ${className}`}>
        {onKanjiClick ? renderClickable(kanji, onKanjiClick, kanjiTitle) : kanji}
      </span>
    )
  }

  return (
    <span className={`jp ${className}`}>
      {segments.map((seg, i) =>
        seg.reading ? (
          <ruby key={i}>
            {onKanjiClick ? renderClickable(seg.text, onKanjiClick, kanjiTitle) : seg.text}
            <rt>{seg.reading}</rt>
          </ruby>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </span>
  )
}
