import { useSettingsStore, type Paper, type Density } from "@/store/settings-store"
import { useTranslation } from "@/lib/useTranslation"

const THEMES: { id: Paper; ja: string; en: string; swatch: [string, string, string] }[] = [
  { id: "washi", ja: "和紙", en: "Washi", swatch: ["#efe7d8", "#221b12", "#be4327"] },
  { id: "paper", ja: "紙", en: "Paper", swatch: ["#f4eee4", "#2a2118", "#c8472a"] },
  { id: "matcha", ja: "抹茶", en: "Matcha", swatch: ["#e6e9d8", "#1e241a", "#b5481f"] },
  { id: "sakura", ja: "桜", en: "Sakura", swatch: ["#f3e4e4", "#2a1d20", "#c23a48"] },
  { id: "sumi", ja: "墨", en: "Sumi", swatch: ["#f4f2ec", "#14110c", "#be4327"] },
  { id: "dusk", ja: "夕暮", en: "Dusk", swatch: ["#11131f", "#e6e8f4", "#ef6a45"] },
  { id: "ink", ja: "墨夜", en: "Ink", swatch: ["#0a090d", "#f5f2ed", "#e2552e"] },
  { id: "ai", ja: "藍", en: "Indigo", swatch: ["#0f1a2b", "#e8eef7", "#f2724e"] },
  { id: "gold", ja: "金", en: "Gold-leaf", swatch: ["#14110a", "#f6efdc", "#d4a843"] },
]

const DENSITIES: { id: Density; ja: string; en: string }[] = [
  { id: "compact", ja: "密", en: "Compact" },
  { id: "normal", ja: "並", en: "Normal" },
  { id: "sparse", ja: "疎", en: "Sparse" },
]

/** 9 paper swatches + RAW/NEO toggle, and (in full mode) density + typeface controls. */
export function InkCabinet({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation()
  const paper = useSettingsStore((s) => s.paper)
  const setPaper = useSettingsStore((s) => s.setPaper)
  const density = useSettingsStore((s) => s.density)
  const setDensity = useSettingsStore((s) => s.setDensity)
  const typeSans = useSettingsStore((s) => s.typeSans)
  const setTypeSans = useSettingsStore((s) => s.setTypeSans)

  return (
    <div className={compact ? "flex flex-col gap-2" : "flex flex-col gap-8"}>
      <div>
        <div className={compact ? "grid grid-cols-9 gap-1" : "grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3"}>
          {THEMES.map((theme) => {
            const active = paper === theme.id
            const [bg, ink, accent] = theme.swatch
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setPaper(theme.id)}
                aria-pressed={active}
                title={`${theme.en} · ${theme.ja}`}
                className={[
                  "relative border-2 flex items-center justify-center transition-all cursor-pointer",
                  compact ? "aspect-square" : "flex-col gap-2 p-2 aspect-[4/3]",
                  active ? "border-ink shadow-[2px_2px_0px_var(--color-ink)]" : "border-ink/20 hover:border-ink/60",
                ].join(" ")}
                style={{ background: bg }}
              >
                {!compact && (
                  <span className="jp text-lg leading-none" style={{ color: ink }}>
                    {theme.ja}
                  </span>
                )}
                <span className="absolute bottom-1 right-1 size-2 rounded-full" style={{ background: accent }} />
              </button>
            )
          })}
        </div>
        {!compact && (
          <p className="text-sm text-muted mt-4">
            {t('settings.inkCabinet.readingInPrefix')}{" "}
            <span className="jp">{THEMES.find((th) => th.id === paper)?.ja}</span> ·{" "}
            {THEMES.find((th) => th.id === paper)?.en}
            {t('settings.inkCabinet.readingInSuffix')}
          </p>
        )}
      </div>

      {!compact && (
        <>
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted mb-3">
              <span className="jp mr-2 text-sm normal-case">密度</span>{t('settings.inkCabinet.density')}
            </p>
            <div className="inline-flex border-2 border-structural overflow-hidden">
              {DENSITIES.map((d, i) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDensity(d.id)}
                  className={[
                    "px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors",
                    i > 0 ? "border-l-2 border-structural" : "",
                    density === d.id ? "bg-ink text-paper" : "bg-paper hover:bg-surface",
                  ].join(" ")}
                >
                  <span className="jp mr-1.5 normal-case">{d.ja}</span>
                  {d.en}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted mt-3">{t('settings.inkCabinet.densityDescription')}</p>
          </div>

          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted mb-3">
              <span className="jp mr-2 text-sm normal-case">書体</span>{t('settings.inkCabinet.typeface')}
            </p>
            <button
              type="button"
              onClick={() => setTypeSans(!typeSans)}
              className="card-lift flex items-center gap-4 border-2 border-structural bg-paper px-5 py-4 w-full text-left cursor-pointer"
            >
              <span className={`relative w-11 h-6 border-2 border-structural shrink-0 ${typeSans ? "bg-accent" : "bg-surface"}`}>
                <span
                  className={`absolute top-0.5 size-4 bg-paper border border-structural transition-[left] duration-200 ${
                    typeSans ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">{t('settings.inkCabinet.typefaceToggle')}</span>
                <span className="block text-xs text-muted mt-0.5">
                  {t('settings.inkCabinet.typefaceDescription')}
                </span>
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
