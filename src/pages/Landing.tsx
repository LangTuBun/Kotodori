import { Link } from "react-router-dom"
import { useMemo } from "react"
import { AnimatedKanjiSvg } from "@/components/kanji/AnimatedKanjiSvg"
import { Reveal } from "@/components/ui/Reveal"
import { Card } from "@/components/ui/Card"
import { InkCabinet } from "@/components/ui/InkCabinet"
import { Furigana } from "@/components/ui/Furigana"
import kanjivg from "@/data/n5/kanjivg.json"

const FEATURES: { glyph: string; ja: string; title: string; description: string; href: string }[] = [
  { glyph: "語", ja: "単語", title: "Vocabulary", description: "N5 & N4 words, SRS review, furigana, Hán Việt notes.", href: "/vocab" },
  { glyph: "文", ja: "文法", title: "Grammar", description: "N5 & N4 patterns, cross-linked to verb forms.", href: "/grammar" },
  { glyph: "字", ja: "漢字", title: "Kanji", description: "Stroke order, radical breakdowns, compound words.", href: "/kanji" },
  { glyph: "動", ja: "動詞", title: "Verb Forms", description: "Every conjugation, grouped by verb class.", href: "/verb-forms" },
  { glyph: "数", ja: "数え方", title: "Counters", description: "Counter words and their phonetic exceptions.", href: "/counters" },
]

export function Landing() {
  const tori = kanjivg["鳥" as keyof typeof kanjivg]
  const replayKey = useMemo(() => Date.now(), [])

  return (
    <div className="min-h-dvh">
      {/* Hero */}
      <section className="relative overflow-hidden px-8 pt-20 pb-24 flex flex-col items-center text-center gap-8">
        <Reveal index={0} className="w-40 h-40 md:w-56 md:h-56">
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
          <h1 className="font-display text-[clamp(2.6rem,7vw,5rem)] leading-[1.02] tracking-[-0.03em]">
            <Furigana kanji="鳥" kana="とり" />
          </h1>
        </Reveal>
        <Reveal index={2}>
          <p className="font-mono text-xs tracking-[0.16em] text-muted font-bold uppercase">
            N5 / N4 · 個人学習ログ
          </p>
        </Reveal>
        <Reveal index={3}>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 border-3 border-ink bg-ink text-paper px-7 py-3.5 font-mono font-bold uppercase tracking-wider shadow-[var(--shadow-brutal)] hover:shadow-[var(--shadow-brutal-hover)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all duration-100"
          >
            Enter Dashboard →
          </Link>
        </Reveal>
      </section>

      {/* Feature grid */}
      <section className="px-8 pb-24 max-w-5xl mx-auto">
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
      <section className="px-8 pb-24 max-w-3xl mx-auto">
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
        <span>TORI · 鳥</span>
        <span>minh khang</span>
      </footer>
    </div>
  )
}
