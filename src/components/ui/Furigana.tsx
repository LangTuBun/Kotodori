interface FuriganaProps {
  kanji: string
  kana?: string
  className?: string
}

export function Furigana({ kanji, kana, className = "" }: FuriganaProps) {
  if (!kana || kanji === kana || !/[一-鿿]/.test(kanji)) {
    return <span className={`jp ${className}`}>{kanji || kana}</span>
  }
  return (
    <ruby className={`jp ${className}`}>
      {kanji}
      <rt>{kana}</rt>
    </ruby>
  )
}
