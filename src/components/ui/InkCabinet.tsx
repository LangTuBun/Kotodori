import { useSettingsStore, type Paper, type Density } from "@/store/settings-store"
import { useTranslation } from "@/lib/useTranslation"

// Ids are the persisted keys from the old paper themes; only the look changed.
const THEMES: { id: Paper; ja: string; en: string; swatch: [string, string, string] }[] = [
  { id: "washi", ja: "明", en: "Light", swatch: ["#f5f5f7", "#ffffff", "#0071e3"] },
  { id: "sumi", ja: "朱", en: "Vermilion", swatch: ["#f6f5f3", "#ffffff", "#d13f24"] },
  { id: "gold", ja: "夜", en: "Dark", swatch: ["#000000", "#1c1c1e", "#0a84ff"] },
]

const DENSITIES: { id: Density; ja: string; en: string }[] = [
  { id: "compact", ja: "密", en: "Compact" },
  { id: "normal", ja: "並", en: "Normal" },
  { id: "sparse", ja: "疎", en: "Sparse" },
]

/** iOS-style segmented control: gray track, raised pill on the selection. */
function Segmented<T extends string>({ value, options, onChange, size = "md" }: {
  value: T
  options: { id: T; label: React.ReactNode }[]
  onChange: (id: T) => void
  size?: "sm" | "md"
}) {
  const index = Math.max(0, options.findIndex((o) => o.id === value))
  return (
    <div
      role="radiogroup"
      className={`relative grid bg-surface rounded-[9px] p-0.5 ${size === "sm" ? "h-8" : "h-9"}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {/* The pill is one element that slides between segments, so a change
          reads as the same object moving rather than two states swapping. */}
      <span
        aria-hidden
        className="absolute top-0.5 bottom-0.5 left-0.5 rounded-[7px] bg-[var(--tori-seg-pill)] shadow-[0_1px_3px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.04)] transition-transform duration-300 ease-[var(--ease-out)]"
        style={{
          width: `calc((100% - 4px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === value}
          onClick={() => onChange(o.id)}
          className={[
            "relative z-10 flex items-center justify-center gap-1.5 px-2 cursor-pointer whitespace-nowrap transition-[color,transform] duration-150 active:scale-95",
            size === "sm" ? "text-xs" : "text-[13px]",
            o.id === value ? "font-semibold text-ink" : "font-medium text-muted hover:text-ink",
          ].join(" ")}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Theme picker, and (in full mode) density + typeface controls. */
export function InkCabinet({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation()
  const paper = useSettingsStore((s) => s.paper)
  const setPaper = useSettingsStore((s) => s.setPaper)
  const density = useSettingsStore((s) => s.density)
  const setDensity = useSettingsStore((s) => s.setDensity)
  const typeSerif = useSettingsStore((s) => s.typeSerif)
  const setTypeSerif = useSettingsStore((s) => s.setTypeSerif)

  if (compact) {
    return (
      <Segmented
        size="sm"
        value={paper}
        onChange={setPaper}
        options={THEMES.map((th) => ({
          id: th.id,
          label: (
            <>
              <span className="size-2 rounded-full shrink-0" style={{ background: th.swatch[2] }} />
              {th.en}
            </>
          ),
        }))}
      />
    )
  }

  const current = THEMES.find((th) => th.id === paper)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="grid grid-cols-3 gap-3 max-w-md">
          {THEMES.map((theme) => {
            const active = paper === theme.id
            const [bg, card, accent] = theme.swatch
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setPaper(theme.id)}
                aria-pressed={active}
                title={`${theme.en} · ${theme.ja}`}
                className="group flex flex-col items-center gap-2 cursor-pointer"
              >
                {/* A miniature window: canvas, a card, and the tint. */}
                <span
                  className={[
                    "relative w-full aspect-[4/3] rounded-[12px] overflow-hidden transition-[box-shadow,transform] duration-200 ease-[var(--ease-out)] group-active:scale-[0.97]",
                    active
                      ? "shadow-[0_0_0_2px_var(--tori-bg-card),0_0_0_4px_var(--tori-accent)]"
                      : "shadow-[0_0_0_1px_var(--tori-border)] group-hover:shadow-[0_0_0_1px_var(--tori-border),0_6px_18px_rgb(0_0_0/0.1)]",
                  ].join(" ")}
                  style={{ background: bg }}
                >
                  <span className="absolute left-[12%] top-[16%] right-[12%] bottom-[16%] rounded-[6px] shadow-[0_1px_4px_rgb(0_0_0/0.12)]" style={{ background: card }}>
                    <span className="absolute left-[12%] top-[22%] w-[45%] h-[12%] rounded-full" style={{ background: accent }} />
                    <span className="absolute left-[12%] top-[48%] w-[70%] h-[8%] rounded-full opacity-25" style={{ background: bg === "#000000" ? "#fff" : "#000" }} />
                    <span className="absolute left-[12%] top-[66%] w-[52%] h-[8%] rounded-full opacity-25" style={{ background: bg === "#000000" ? "#fff" : "#000" }} />
                  </span>
                </span>
                <span className={`text-[13px] ${active ? "font-semibold text-ink" : "text-muted"}`}>
                  <span className="jp mr-1">{theme.ja}</span>{theme.en}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-sm text-muted mt-4">
          {t('settings.inkCabinet.readingInPrefix')}{" "}
          <span className="jp">{current?.ja}</span> · {current?.en}
          {t('settings.inkCabinet.readingInSuffix')}
        </p>
      </div>

      <div>
        <p className="text-[13px] font-semibold text-muted mb-3">
          <span className="jp mr-2">密度</span>{t('settings.inkCabinet.density')}
        </p>
        <div className="max-w-sm">
          <Segmented
            value={density}
            onChange={setDensity}
            options={DENSITIES.map((d) => ({
              id: d.id,
              label: (<><span className="jp">{d.ja}</span>{d.en}</>),
            }))}
          />
        </div>
        <p className="text-sm text-muted mt-3">{t('settings.inkCabinet.densityDescription')}</p>
      </div>

      <div>
        <p className="text-[13px] font-semibold text-muted mb-3">
          <span className="jp mr-2">書体</span>{t('settings.inkCabinet.typeface')}
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={typeSerif}
          onClick={() => setTypeSerif(!typeSerif)}
          className="flex items-center gap-4 rounded-[var(--radius-sm)] bg-surface/60 hover:bg-surface px-4 py-3.5 w-full text-left cursor-pointer transition-colors"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-medium">{t('settings.inkCabinet.typefaceToggle')}</span>
            <span className="block text-[13px] text-muted mt-0.5">
              {t('settings.inkCabinet.typefaceDescription')}
            </span>
          </span>
          {/* iOS switch: 51x31 track, thumb travels with the sheet curve. */}
          <span
            className={`relative w-[51px] h-[31px] rounded-full shrink-0 transition-colors duration-200 ${
              typeSerif ? "bg-green" : "bg-[var(--tori-border)]"
            }`}
          >
            <span
              className="absolute top-[2px] left-[2px] size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgb(0_0_0/0.15),0_1px_1px_rgb(0_0_0/0.16)] transition-transform duration-300 ease-[var(--ease-sheet)]"
              style={{ transform: typeSerif ? "translateX(20px)" : "none" }}
            />
          </span>
        </button>
      </div>
    </div>
  )
}
