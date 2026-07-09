interface FuriganaProps {
  kanji: string
  kana?: string
  className?: string
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
function alignFurigana(kanji: string, kana: string): Segment[] {
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
      if (idx !== -1) end = idx
    }
    const reading = kana.slice(pos, end)
    segments.push({ text: run.text, reading: reading || undefined })
    pos = end
  }

  return segments
}

export function Furigana({ kanji, kana, className = "" }: FuriganaProps) {
  if (!kana || kanji === kana || !HAS_KANJI_RE.test(kanji)) {
    return <span className={`jp ${className}`}>{kanji || kana}</span>
  }

  const segments = alignFurigana(kanji, kana)

  return (
    <span className={`jp ${className}`}>
      {segments.map((seg, i) =>
        seg.reading ? (
          <ruby key={i}>
            {seg.text}
            <rt>{seg.reading}</rt>
          </ruby>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </span>
  )
}
