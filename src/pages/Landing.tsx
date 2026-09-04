import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { AnimatedKanjiSvg } from "@/components/kanji/AnimatedKanjiSvg"
import { Reveal } from "@/components/ui/Reveal"
import { Card } from "@/components/ui/Card"
import { InkCabinet } from "@/components/ui/InkCabinet"
import { Furigana } from "@/components/ui/Furigana"
import { useSettingsStore } from "@/store/settings-store"
import { useTranslation } from "@/lib/useTranslation"
import kanjivg from "@/data/kanjivg.json"

const WEEKDAY_KANJI = ['日', '月', '火', '水', '木', '金', '土']
const LEVEL_LABEL: Record<string, string> = { N5: 'N5', N4: 'N4', all: 'N5+N4' }

const FEATURES: { glyph: string; ja: string; title: string; description: string; href: string }[] = [
  { glyph: "語", ja: "単語", title: "Vocabulary", description: "N5 & N4 words, SRS review, furigana, Hán Việt notes.", href: "/vocab" },
  { glyph: "文", ja: "文法", title: "Grammar", description: "N5 & N4 patterns, cross-linked to verb forms.", href: "/grammar" },
  { glyph: "字", ja: "漢字", title: "Kanji", description: "Stroke order, radical breakdowns, compound words.", href: "/kanji" },
  { glyph: "動", ja: "動詞", title: "Verb Forms", description: "Every conjugation, grouped by verb class.", href: "/verb-forms" },
  { glyph: "対", ja: "自他動詞", title: "Transitivity", description: "他動詞/自動詞 pairs, recognition patterns, を vs が.", href: "/transitivity" },
  { glyph: "別", ja: "使い方", title: "Usage & Nuances", description: "Synonym traps, verb-particle collocations, て-form auxiliaries.", href: "/usage" },
  { glyph: "数", ja: "数え方", title: "Counters", description: "Counter words and their phonetic exceptions.", href: "/counters" },
]

// This page is the site's single entry point (start_url "/" in the PWA
// manifest, and the Sidebar's Home link). It used to lead with a "today's
// queue" of SRS due/new/grammar counts (the old Dashboard, folded in here) --
// that was dropped in favor of a pure reference-library framing: the user
// looks things up here rather than running daily reviews, so a queue of
// due-card counts read as homework nagging rather than anything useful. The
// hero is now a quiet clock/date moment and the feature grid carries the
// page. SRS itself is untouched (vocab-store.ts, /review) -- this only
// changes what the homepage puts in front of the user.
export function Landing() {
  const tori = kanjivg["鳥" as keyof typeof kanjivg]
  const replayKey = useMemo(() => Date.now(), [])
  const level = useSettingsStore(s => s.level)
  const { t } = useTranslation()

  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  const dateLabel = `${now.getMonth() + 1}月${now.getDate()}日（${WEEKDAY_KANJI[now.getDay()]}）`
  const timeLabel = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })

  return (
    <div>
      {/* Hero -- an ambient clock/date moment now rather than a "start your
          daily study" banner, so it gets more room to breathe (no queue
          crowding it below) and a quieter voice (subdued date/time). */}
      <section className="relative overflow-hidden px-8 pt-16 pb-14 flex flex-col items-center text-center gap-6">
        <Reveal index={0} className="w-28 h-28 md:w-36 md:h-36">
          {tori && (
            <AnimatedKanjiSvg
              strokes={tori.strokes}
              viewBox={tori.viewBox}
              replayKey={replayKey}
              strokeMs={420}
              className="w-full h-full"
              background="transparent"
              guideColor="var(--color-muted)"
              guideOpacity={0.4}
              strokeColor="var(--color-ink)"
            />
          )}
        </Reveal>
        <Reveal index={1}>
          <h1 className="jp text-3xl sm:text-5xl font-black tracking-tighter leading-none text-ink/90">{dateLabel}</h1>
        </Reveal>
        <Reveal index={2}>
          <p className="font-mono text-muted font-medium mt-1 uppercase tracking-widest text-xs opacity-80">
            {t('dashboard.subtitle', { level: LEVEL_LABEL[level] })}
            <span className="mx-2 opacity-40">·</span>
            <span className="tabular-nums normal-case tracking-normal">{timeLabel}</span>
          </p>
        </Reveal>
      </section>

      {/* Feature grid -- the main event now: every reference tool, one tap
          away. Given more room (wider max-width, bigger title, roomier
          cards) since it no longer shares the page with the queue. */}
      <section className="px-8 pb-20 pt-4 max-w-6xl mx-auto">
        <Reveal index={0}>
          <p className="font-display text-2xl sm:text-3xl tracking-tight text-center mb-1">
            <span className="jp mr-2 text-accent">機能</span>Features
          </p>
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted font-bold uppercase mb-10 text-center">
            Your reference library
          </p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <Reveal key={f.href} index={i}>
              <Link to={f.href} className="block h-full">
                <Card lift className="p-6 h-full flex flex-col">
                  <span className="jp text-4xl leading-none mb-4 text-accent">{f.glyph}</span>
                  <h3 className="font-display text-lg">{f.title}</h3>
                  <p className="text-sm text-muted mt-1 leading-snug">
                    <span className="jp mr-1.5 text-ink/60">{f.ja}</span>
                    {f.description}
                  </p>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Theme picker */}
      <section className="px-8 pb-20 max-w-3xl mx-auto">
        <Reveal index={0}>
          <p className="font-mono text-xs tracking-[0.16em] text-accent font-bold uppercase mb-8 text-center">
            <span className="jp mr-2 normal-case">紙</span>· THEME
          </p>
        </Reveal>
        <Reveal index={1}>
          <Card className="p-6">
            <InkCabinet />
          </Card>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t-3 border-structural px-8 py-8 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted">
        <span>TORI · <Furigana kanji="鳥" kana="とり" /></span>
        <span>minh khang</span>
      </footer>
    </div>
  )
}
