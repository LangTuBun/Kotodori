import { getPosLabel } from "@/lib/japanese"

interface PosTagProps {
  pos: string
  verbGroup?: number | null
}

const colors: Record<string, string> = {
  'verb-group1': 'var(--color-blue)',
  'verb-group2': 'var(--color-blue)',
  'verb-group3': 'var(--color-blue)',
  'adj-i': 'var(--color-green)',
  'adj-na': 'var(--color-green)',
  'noun': 'var(--color-yellow)',
  'adverb': 'var(--color-red)',
  'expression': 'var(--color-muted)',
  'conjunction': 'var(--color-muted)',
}

export function PosTag({ pos, verbGroup }: PosTagProps) {
  const bg = colors[pos] ?? 'var(--color-muted)'
  const label = getPosLabel(pos, verbGroup)
  const textColor = pos === 'noun' ? 'var(--color-ink)' : 'var(--color-paper)'
  return (
    <span
      className="font-mono inline-block text-xs font-bold uppercase tracking-widest px-2 py-0.5 border-2 border-ink rounded-[var(--radius-sm)]"
      style={{ backgroundColor: bg, color: textColor }}
    >
      {label}
    </span>
  )
}
