import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { AnimatedKanjiSvg } from "@/components/kanji/AnimatedKanjiSvg"
import { Reveal } from "@/components/ui/Reveal"
import { Card } from "@/components/ui/Card"
import { Furigana } from "@/components/ui/Furigana"
import { useSettingsStore } from "@/store/settings-store"
import { useTranslation } from "@/lib/useTranslation"
import { TORI_STROKES, TORI_VIEW_BOX } from "@/components/ui/tori-glyph"

const WEEKDAY_KANJI = ['日', '月', '火', '水', '木', '金', '土']
const LEVEL_LABEL: Record<string, string> = { N5: 'N5', N4: 'N4', all: 'N5+N4' }

const FEATURES: { glyph: string; ja: string; title: string; href: string }[] = [
  { glyph: "語", ja: "たんご", title: "Vocabulary", href: "/vocab" },
  { glyph: "文", ja: "ぶんぽう", title: "Grammar", href: "/grammar" },
  { glyph: "字", ja: "かんじ", title: "Kanji", href: "/kanji" },
  { glyph: "動", ja: "どうし", title: "Verb Forms", href: "/verb-forms" },
  { glyph: "対", ja: "じたどうし", title: "Transitivity", href: "/transitivity" },
  { glyph: "別", ja: "つかいかた", title: "Usage & Nuances", href: "/usage" },
  { glyph: "数", ja: "かぞえかた", title: "Counters", href: "/counters" },
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
          <h1 className="jp text-3xl sm:text-4xl font-black tracking-tight leading-tight">{greeting.ja}</h1>
          <p className="font-mono text-xs text-muted font-bold uppercase tracking-widest mt-1">
            <span className="jp normal-case tracking-normal">{dateLabel}</span>
            <span className="mx-2 opacity-40">·</span>
            {t('dashboard.subtitle', { level: LEVEL_LABEL[level] })}
          </p>
        </div>
      </header>

      <Reveal>
        <nav className="grid grid-cols-2 sm:grid-cols-3 gap-3" aria-label="Study tools">
          {FEATURES.map(f => (
            <Link key={f.href} to={f.href} className="block">
              <Card lift className="p-4 h-full flex items-center gap-3">
                <span className="jp text-3xl leading-none text-accent w-9 text-center shrink-0">{f.glyph}</span>
                <span className="min-w-0">
                  <span className="block font-display text-base leading-tight">{f.title}</span>
                  <span className="jp block text-xs text-muted mt-0.5">{f.ja}</span>
                </span>
              </Card>
            </Link>
          ))}
        </nav>
      </Reveal>

      <footer className="mt-16 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-muted">
        <span>TORI · <Furigana kanji="鳥" kana="とり" /></span>
        <span>minh khang</span>
      </footer>
    </div>
  )
}
