import { useContext } from "react"
import furigana from "@/data/reading-furigana.json"
import { FuriganaContext } from "@/lib/furigana-context"

// Segments come from scripts/generate-reading-furigana.mjs: plain strings, or [kanji, reading].
const MAP = furigana as unknown as Record<string, (string | [string, string])[]>

export function ReadingText({ text }: { text: string }) {
  const show = useContext(FuriganaContext)
  const segments = show ? MAP[text] : undefined
  if (!segments) return <>{text}</>
  return <>{segments.map((s, i) => typeof s === "string" ? s : <ruby key={i}>{s[0]}<rt>{s[1]}</rt></ruby>)}</>
}
