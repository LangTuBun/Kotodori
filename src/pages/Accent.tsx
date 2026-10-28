import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { PitchAccent } from "@/components/ui/PitchAccent"
import { SpeakButton } from "@/components/ui/SpeakButton"
import { Watermark } from "@/components/ui/ScreenHeader"
import { useTranslation } from "@/lib/useTranslation"

// Pitch-accent dictionary over the Kanjium dataset (CC BY-SA, compiled from
// NHK's accent dictionary and Wadoku): ~124k headwords. The raw TSV is a
// separate lazy chunk that only this page loads.
interface AccentRow {
  surface: string
  reading: string
  /** Comma-separated alternatives in the source; first is the primary. */
  pitches: number[]
}

const MAX_RESULTS = 60

function katakanaToHiragana(s: string): string {
  return s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60))
}

function parse(tsv: string): AccentRow[] {
  const rows: AccentRow[] = []
  for (const line of tsv.split("\n")) {
    const [surface, reading, pitch] = line.replace(/\r$/, "").split("\t")
    if (!surface || !pitch) continue
    const pitches = pitch.split(",").map(Number).filter(n => Number.isFinite(n))
    if (pitches.length === 0) continue
    rows.push({ surface, reading: reading || surface, pitches })
  }
  return rows
}

export function Accent() {
  const { t } = useTranslation()
  const [rows, setRows] = useState<AccentRow[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState("")
  const deferred = useDeferredValue(query)

  useEffect(() => {
    let cancelled = false
    import("@/data/kanjium-accents.tsv?raw").then(
      m => { if (!cancelled) setRows(parse(m.default)) },
      () => { if (!cancelled) setFailed(true) }
    )
    return () => { cancelled = true }
  }, [])

  const results = useMemo(() => {
    const q = deferred.trim()
    if (!rows || !q) return []
    const qk = katakanaToHiragana(q)
    const scored: Array<[number, AccentRow]> = []
    for (const r of rows) {
      const reading = katakanaToHiragana(r.reading)
      let score = -1
      if (r.surface === q || reading === qk) score = 0
      else if (r.surface.startsWith(q) || reading.startsWith(qk)) score = 1
      else if (r.surface.includes(q) || reading.includes(qk)) score = 2
      if (score >= 0) scored.push([score, r])
    }
    scored.sort((a, b) => a[0] - b[0] || a[1].reading.length - b[1].reading.length)
    return scored.slice(0, MAX_RESULTS).map(s => s[1])
  }, [rows, deferred])

  return (
    <div className="relative p-4 sm:p-8 max-w-4xl overflow-hidden">
      <Watermark char="音" />
      <div className="border-b-3 border-structural pb-6 mb-6">
        <div className="text-xs font-bold uppercase tracking-widest text-muted mb-2">アクセント辞典</div>
        <h1 className="text-[clamp(2rem,8vw,3rem)] font-black tracking-tighter">{t("accent.title")}</h1>
        <p className="text-muted font-bold text-sm mt-3 max-w-2xl leading-relaxed">{t("accent.intro")}</p>
      </div>

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={t("accent.placeholder")}
        autoFocus
        className="jp w-full px-4 py-3 border-3 border-structural font-bold text-base bg-card focus:outline-none focus:border-accent focus:shadow-[0_0_0_4px_var(--tori-accent-soft)] transition-[border-color,box-shadow]"
      />

      <div className="mt-4 text-xs font-bold uppercase tracking-wider text-muted">
        {failed
          ? t("accent.loadFailed")
          : !rows
          ? t("accent.loading")
          : deferred.trim()
          ? t("accent.resultCount", { n: results.length, max: MAX_RESULTS })
          : t("accent.entries", { n: rows.length.toLocaleString() })}
      </div>

      <ul className="mt-3 space-y-2">
        {results.map((r, i) => (
          <li key={`${r.surface}-${r.reading}-${i}`} className="flex items-center gap-4 p-3 border-3 border-structural bg-card">
            <div className="min-w-0 flex-1">
              <div className="jp text-xl font-black break-words">{r.surface}</div>
              {r.surface !== r.reading && <div className="jp text-xs font-bold text-muted">{r.reading}</div>}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {r.pitches.map(p => (
                <PitchAccent key={p} kana={r.reading} pitch={p} size="md" showLabel />
              ))}
            </div>
            <SpeakButton text={r.reading} size="sm" />
          </li>
        ))}
      </ul>

      <p className="mt-8 text-[11px] text-muted font-bold">{t("accent.credit")}</p>
    </div>
  )
}
