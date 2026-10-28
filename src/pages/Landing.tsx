import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { AnimatedKanjiSvg } from "@/components/kanji/AnimatedKanjiSvg"
import { Reveal } from "@/components/ui/Reveal"
import { Furigana } from "@/components/ui/Furigana"
import { useSettingsStore } from "@/store/settings-store"
import { useTranslation } from "@/lib/useTranslation"
import { TORI_STROKES, TORI_VIEW_BOX } from "@/components/ui/tori-glyph"

const WEEKDAY_KANJI = ['日', '月', '火', '水', '木', '金', '土']
const LEVEL_LABEL: Record<string, string> = { N5: 'N5', N4: 'N4', all: 'N5+N4' }

const FEATURES: { glyph: string; ja: string; key: string; href: string}[] = [
  { glyph: "語", ja: "たんご", key: "vocabulary", href: "/vocab" },
  { glyph: "文", ja: "ぶんぽう", key: "grammar", href: "/grammar" },
  { glyph: "字", ja: "かんじ", key: "kanji", href: "/kanji" },
  { glyph: "動", ja: "どうし", key: "verbForms", href: "/verb-forms" },
  { glyph: "対", ja: "じたどうし", key: "transitivity", href: "/transitivity" },
  { glyph: "別", ja: "つかいかた", key: "usage", href: "/usage" },
  { glyph: "数", ja: "かぞえかた", key: "counters", href: "/counters" },
]

function greetingFor(hour: number) {
  if (hour < 11) return { ja: "おはよう" }
  if (hour < 18) return { ja: "こんにちは" }
  return { ja: "こんばんは" }
}

// The home page is deliberately small: a greeting and the seven tools, nothing
// else. It used to carry a due-card queue, a features pitch and a theme picker;
// the queue read as homework nagging, the pitch explained an app the user already
// opened, and themes live in the sidebar, so all three were dropped.
export function Landing() {
  const replayKey = useMemo(() => Date.now(), [])
  const level = useSettingsStore(s => s.level)
  const { t } = useTranslation()

  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  const greeting = greetingFor(now.getHours())
  const dateLabel = `${now.getMonth() + 1}月${now.getDate()}日（${WEEKDAY_KANJI[now.getDay()]}）`

  return (
    <div className="max-w-3xl mx-auto px-6 pt-12 pb-10 sm:pt-20">
      <header className="flex items-center gap-5 mb-10">
        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0">
          <AnimatedKanjiSvg
            strokes={TORI_STROKES}
            viewBox={TORI_VIEW_BOX}
            replayKey={replayKey}
            strokeMs={420}
            className="w-full h-full"
            background="transparent"
            guideColor="var(--color-muted)"
            guideOpacity={0.4}
            strokeColor="var(--color-ink)"
          />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted font-medium uppercase tracking-[0.08em] mb-1.5">
            <span className="jp normal-case tracking-normal">{dateLabel}</span>
            <span className="mx-2 opacity-40">·</span>
            {t('dashboard.subtitle', { level: LEVEL_LABEL[level] })}
          </p>
          <h1 className="jp text-5xl sm:text-6xl font-semibold tracking-[-0.03em] leading-[1.05]">{greeting.ja}</h1>
        </div>
      </header>

      {/* Monochrome glass tiles: the glyph is the icon, ink by default and
          tinted only on hover - one accent, no per-tool rainbow. */}
      <Reveal>
        <nav className="relative isolate grid grid-cols-2 sm:grid-cols-3 gap-3" aria-label="Study tools">
          <div aria-hidden className="home-aura" />
          {FEATURES.map((f, i) => (
            <Link
              key={f.href}
              to={f.href}
              className="glass group relative flex flex-col justify-between gap-6 p-4 sm:p-5 min-h-32 rounded-[22px]"
            >
              <span className="flex items-start justify-between">
                <span className="jp text-[34px] font-medium leading-none transition-colors duration-200 group-hover:text-accent">
                  {f.glyph}
                </span>
                <span className="font-mono text-[11px] text-dim tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <span className="flex items-end justify-between gap-2">
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold tracking-[-0.01em] leading-tight">{t(`nav.${f.key}`)}</span>
                  <span className="jp block text-xs text-muted mt-1">{f.ja}</span>
                </span>
                <span aria-hidden className="go font-mono text-sm text-accent">→</span>
              </span>
            </Link>
          ))}
        </nav>
      </Reveal>

      <footer className="mt-16 flex items-center justify-between font-mono text-[11px] uppercase text-dim">
        <span>TORI · <Furigana kanji="鳥" kana="とり" /></span>
        <span>minh khang</span>
      </footer>
    </div>
  )
}
