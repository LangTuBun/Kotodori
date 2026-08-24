import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useVocabStore } from "@/store/vocab-store"
import { useSettingsStore } from "@/store/settings-store"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Reveal } from "@/components/ui/Reveal"
import { Watermark } from "@/components/ui/ScreenHeader"
import { getGrammar } from "@/data/grammar"
import { useTranslation } from "@/lib/useTranslation"

// 日 -> 土, indexed by Date#getDay() -- purely decorative kanji, not tied to i18n.
const WEEKDAY_KANJI = ['日', '月', '火', '水', '木', '金', '土']
const LEVEL_LABEL: Record<string, string> = { N5: 'N5', N4: 'N4', all: 'N5+N4' }

export function Dashboard() {
  const { streak, totalReviewed, getStats, getDueCards, getNewCards } = useVocabStore()
  const level = useSettingsStore(s => s.level)
  const { t } = useTranslation()
  const stats = getStats()
  const dueCount = getDueCards().length
  const newCount = getNewCards(10).length
  const grammarCount = getGrammar(level).length

  // Ticks every 30s -- enough to keep the HH:MM clock honest without a
  // per-second re-render for a number nobody's watching that closely.
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  const dateLabel = `${now.getMonth() + 1}月${now.getDate()}日（${WEEKDAY_KANJI[now.getDay()]}）`
  const timeLabel = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })

  return (
    <div className="relative p-4 sm:p-8 max-w-5xl overflow-hidden">
      <Watermark char="今" />
      {/* Header -- today's date instead of a cheer-you-on line; still big/
          bold/kanji-forward, just not addressed to an audience of one. */}
      <Reveal index={0} className="relative border-b-3 border-structural pb-8 mb-8">
        <h1 className="jp text-4xl sm:text-6xl font-black tracking-tighter leading-none">
          {dateLabel}
        </h1>
        <p className="font-mono text-muted font-bold mt-3 uppercase tracking-widest text-sm">
          {t('dashboard.subtitle', { level: LEVEL_LABEL[level] })}
          <span className="mx-2 opacity-40">·</span>
          <span className="tabular-nums normal-case tracking-normal">{timeLabel}</span>
        </p>
      </Reveal>

      {/* Top stats row -- 2 cols on phones (else long labels like
          "REVIEWED" overflow their cell and get clipped by overflow-hidden
          below), 4 cols from `sm` up. */}
      <Reveal index={1} className="grid grid-cols-2 sm:grid-cols-4 gap-0 mb-8 border-3 border-structural shadow-[var(--shadow-brutal)] overflow-hidden">
        {[
          { label: t('dashboard.streakLabel'), value: streak, suffix: t('dashboard.streakSuffix'), bg: "var(--color-yellow)", text: "var(--color-ink)" },
          { label: t('dashboard.totalWordsLabel'), value: stats.total, suffix: "", bg: "var(--color-ink)", text: "var(--color-paper)" },
          { label: t('dashboard.masteredLabel'), value: stats.mastered, suffix: "", bg: "var(--color-green)", text: "var(--color-paper)" },
          { label: t('dashboard.reviewedLabel'), value: totalReviewed, suffix: "", bg: "var(--color-paper)", text: "var(--color-ink)" },
        ].map(({ label, value, suffix, bg, text }, i) => (
          <div
            key={label}
            className={[
              "p-4 sm:p-6 border-structural",
              (i === 0 || i === 2) ? "border-r-3" : "",
              i === 1 ? "sm:border-r-3" : "",
              (i === 0 || i === 1) ? "border-b-3 sm:border-b-0" : "",
            ].join(" ")}
            style={{ backgroundColor: bg, color: text }}
          >
            <div className="font-display text-3xl sm:text-4xl">{value}{suffix}</div>
            <div className="font-mono text-xs font-bold uppercase tracking-widest mt-1 opacity-70 break-words">{label}</div>
          </div>
        ))}
      </Reveal>

      {/* Queue cards */}
      <Reveal index={2} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card accent={dueCount > 0 ? 'red' : null} className="p-6">
          <div className="font-display text-5xl mb-2">{dueCount}</div>
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-muted mb-4">{t('dashboard.cardsDue')}</div>
          <Link to="/review">
            <Button variant={dueCount > 0 ? 'red' : 'secondary'} className="w-full">
              {dueCount > 0 ? t('dashboard.reviewNow') : t('dashboard.allDone')}
            </Button>
          </Link>
        </Card>

        <Card accent="yellow" className="p-6">
          <div className="font-display text-5xl mb-2">{newCount}</div>
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-muted mb-4">{t('dashboard.newWords')}</div>
          <Link to="/vocab">
            <Button variant="yellow" className="w-full">{t('dashboard.learnNew')}</Button>
          </Link>
        </Card>

        <Card accent="green" className="p-6">
          <div className="font-display text-5xl mb-2">{grammarCount}</div>
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-muted mb-4">{t('dashboard.grammarPoints')}</div>
          <Link to="/grammar">
            <Button variant="green" className="w-full">{t('dashboard.studyGrammar')}</Button>
          </Link>
        </Card>
      </Reveal>

      {/* Progress bar */}
      <Reveal index={3}><Card className="p-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="font-mono font-black text-sm uppercase tracking-wider">{t('dashboard.progress', { level: LEVEL_LABEL[level] })}</span>
          <span className="font-display">{Math.round((stats.mastered / stats.total) * 100)}%</span>
        </div>
        <div className="h-6 bg-surface border-3 border-structural overflow-hidden">
          <div
            className="h-full bg-green transition-all duration-500"
            style={{ width: `${(stats.mastered / stats.total) * 100}%` }}
          />
        </div>
        <div className="font-mono flex justify-between text-xs text-muted mt-2 uppercase font-bold tracking-wider">
          <span>0</span>
          <span>{t('dashboard.masteredCount', { mastered: stats.mastered, total: stats.total })}</span>
          <span>{stats.total}</span>
        </div>
      </Card></Reveal>

      {/* SRS breakdown */}
      <Reveal index={4} className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-3 border-structural shadow-[var(--shadow-brutal)] overflow-hidden">
        {[
          { label: t('common.stats.new'), count: stats.new, color: "var(--color-muted)" },
          { label: t('common.stats.learning'), count: stats.learning, color: "var(--color-blue)" },
          { label: t('common.stats.review'), count: stats.review, color: "var(--color-yellow)" },
          { label: t('common.stats.mastered'), count: stats.mastered, color: "var(--color-green)" },
        ].map(({ label, count, color }, i) => (
          <div
            key={label}
            className={[
              "p-4 sm:p-5 text-center border-structural",
              (i === 0 || i === 2) ? "border-r-3" : "",
              i === 1 ? "sm:border-r-3" : "",
              (i === 0 || i === 1) ? "border-b-3 sm:border-b-0" : "",
            ].join(" ")}
          >
            <div className="font-display text-3xl" style={{ color }}>{count}</div>
            <div className="font-mono text-xs uppercase font-bold tracking-wider text-muted mt-1 break-words">{label}</div>
          </div>
        ))}
      </Reveal>
    </div>
  )
}
