export const MAX_READINGS_SHOWN = 4

export function onkunTone(onkun: string): string {
  if (onkun.includes('Juku') || onkun.includes('Ate')) return '#9333ea'
  const hasOn = onkun.includes('On')
  const hasKun = onkun.includes('Kun')
  if (hasOn && hasKun) return 'var(--color-muted)'
  if (hasOn) return 'var(--color-blue)'
  return 'var(--color-green)'
}

// kanjiapi.dev marks bound-form readings with a leading/trailing "-"
// (e.g. "-あ.がり", "うわ-"); strip that for display and dedupe.
export function cleanReadings(readings: string[]): { shown: string[]; extra: number } {
  const cleaned = [...new Set(readings.map(r => r.replace(/^-|-$/g, '')))]
  return { shown: cleaned.slice(0, MAX_READINGS_SHOWN), extra: Math.max(0, cleaned.length - MAX_READINGS_SHOWN) }
}
