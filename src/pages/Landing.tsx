import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { AnimatedKanjiSvg } from "@/components/kanji/AnimatedKanjiSvg"
import { Reveal } from "@/components/ui/Reveal"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { InkCabinet } from "@/components/ui/InkCabinet"
import { Furigana } from "@/components/ui/Furigana"
import { useVocabStore } from "@/store/vocab-store"
import { useSettingsStore } from "@/store/settings-store"
import { getGrammar } from "@/data/grammar"
import { useTranslation } from "@/lib/useTranslation"
import kanjivg from "@/data/n5/kanjivg.json"

const WEEKDAY_KANJI = ['日', '月', '火', '水', '木', '金', '土']
const LEVEL_LABEL: Record<string, string> = { N5: 'N5', N4: 'N4', all: 'N5+N4' }

const FEATURES: { glyph: string; ja: string; title: string; description: string; href: string }[] = [
  { glyph: "語", ja: "単語", title: "Vocabulary", description: "N5 & N4 words, SRS review, furigana, Hán Việt notes.", href: "/vocab" },
  { glyph: "文", ja: "文法", title: "Grammar", description: "N5 & N4 patterns, cross-linked to verb forms.", href: "/grammar" },
  { glyph: "字", ja: "漢字", title: "Kanji", description: "Stroke order, radical breakdowns, compound words.", href: "/kanji" },
  { glyph: "動", ja: "動詞", title: "Verb Forms", description: "Every conjugation, grouped by verb class.", href: "/verb-forms" },
  { glyph: "数", ja: "数え方", title: "Counters", description: "Counter words and their phonetic exceptions.", href: "/counters" },
]

// This page is the site's single entry point (start_url "/" in the PWA
// manifest, and the Sidebar's Home link) -- it used to be a bare splash
// screen with a click-through to a separate /dashboard. That extra hop had
// nothing on it that isn't shown here or in the Sidebar already, so the two
// pages were merged: the daily queue (formerly Dashboard) sits on top since
// it's the actual daily job, the feature grid and theme picker stay below as
// the "browse everything" surface for a slower visit. /dashboard and
// /welcome now just redirect back to "/" (see App.tsx) for old bookmarks.
export function Landing() {
  const tori = kanjivg["鳥" as keyof typeof kanjivg]
  const replayKey = useMemo(() => Date.now(), [])
  const { getDueCards, getNewCards } = useVocabStore()
  const level = useSettingsStore(s => s.level)
  const { t } = useTranslation()
  const dueCount = getDueCards().length
  const newCount = getNewCards(10).length
  const grammarCount = getGrammar(level).length

  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  const dateLabel = `${now.getMonth() + 1}月${now.getDate()}日（${WEEKDAY_KANJI[now.getDay()]}）`
  const timeLabel = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })

  return (
    <div>
      {/* Hero -- kept compact since this now loads on every app open, not
          just a one-time first impression. */}
      <section className="relative overflow-hidden px-8 pt-10 pb-8 flex flex-col items-center text-center gap-5">
        <Reveal index={0} className="w-24 h-24 md:w-28 md:h-28">
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
          <h1 className="jp text-4xl sm:text-6xl font-black tracking-tighter leading-none">{dateLabel}</h1>
        </Reveal>
        <Reveal index={2}>
          <p className="font-mono text-muted font-bold mt-1 uppercase tracking-widest text-sm">
            {t('dashboard.subtitle', { level: LEVEL_LABEL[level] })}
            <span className="mx-2 opacity-40">·</span>
            <span className="tabular-nums normal-case tracking-normal">{timeLabel}</span>
          </p>
        </Reveal>
      </section>

      {/* Today's queue -- the actual daily job, front and center. */}
      <section className="px-8 pb-20 max-w-5xl mx-auto">
        <Reveal index={0} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card accent={dueCount > 0 ? 'red' : null} className="p-6">
            <div className="font-display text-5xl mb-2">{dueCount}</div>
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-muted mb-4">{t('dashboard.cardsDue')}</div>
            <Link to="/review"><Button variant={dueCount > 0 ? 'red' : 'secondary'} className="w-full">{dueCount > 0 ? t('dashboard.reviewNow') : t('dashboard.allDone')}</Button></Link>
          </Card>
          <Card accent="yellow" className="p-6">
            <div className="font-display text-5xl mb-2">{newCount}</div>
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-muted mb-4">{t('dashboard.newWords')}</div>
            <Link to="/vocab"><Button variant="yellow" className="w-full">{t('dashboard.learnNew')}</Button></Link>
          </Card>
          <Card accent="green" className="p-6">
            <div className="font-display text-5xl mb-2">{grammarCount}</div>
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-muted mb-4">{t('dashboard.grammarPoints')}</div>
            <Link to="/grammar"><Button variant="green" className="w-full">{t('dashboard.studyGrammar')}</Button></Link>
          </Card>
        </Reveal>
      </section>

      {/* Feature grid -- the "browse everything" nav box. */}
      <section className="px-8 pb-20 max-w-5xl mx-auto">
        <Reveal index={0}>
          <p className="font-mono text-xs tracking-[0.16em] text-accent font-bold uppercase mb-8 text-center">
            <span className="jp mr-2 normal-case">機能</span>· FEATURES
          </p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.href} index={i}>
              <Link to={f.href} className="block h-full">
                <Card lift className="p-5 h-full flex flex-col">
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
