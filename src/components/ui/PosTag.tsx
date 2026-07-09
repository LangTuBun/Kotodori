import { getPosLabel } from "@/lib/japanese"

interface PosTagProps {
  pos: string
  verbGroup?: number | null
}

const colors: Record<string, string> = {
  'verb-group1': '#0057ff',
  'verb-group2': '#0057ff',
  'verb-group3': '#0057ff',
  'adj-i': '#00cc66',
  'adj-na': '#00cc66',
  'noun': '#ffe600',
  'adverb': '#ff2d2d',
  'expression': '#9333ea',
  'conjunction': '#9333ea',
}

export function PosTag({ pos, verbGroup }: PosTagProps) {
  const bg = colors[pos] ?? '#6b6b6b'
  const label = getPosLabel(pos, verbGroup)
  const textColor = pos === 'noun' ? '#0a0a0a' : '#fafaf7'
  return (
    <span
      className="inline-block text-xs font-bold uppercase tracking-widest px-2 py-0.5 border-2 border-ink"
      style={{ backgroundColor: bg, color: textColor, fontFamily: 'Space Grotesk, sans-serif' }}
    >
      {label}
    </span>
  )
}
