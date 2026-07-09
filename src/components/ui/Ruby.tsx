interface RubyProps {
  html?: string
  text: string
  className?: string
}

// Renders pre-generated furigana <ruby> markup (see scripts that annotate src/data/n5/*.json).
// Falls back to plain text if no ruby HTML was generated (e.g. kanji-free strings).
export function Ruby({ html, text, className = "" }: RubyProps) {
  if (!html || html === text) {
    return <span className={`jp ${className}`}>{text}</span>
  }
  return <span className={`jp ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
}
