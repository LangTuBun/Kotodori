import { Link } from "react-router-dom"
import { useVocabStore } from "@/store/vocab-store"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Ruby } from "@/components/ui/Ruby"
import { useTranslation } from "@/lib/useTranslation"

const HEADING_LINE1_RUBY = '<ruby>今日<rp>(</rp><rt>きょう</rt><rp>)</rp></ruby>も'
const HEADING_LINE2_RUBY = '<ruby>頑張<rp>(</rp><rt>がんば</rt><rp>)</rp></ruby>ろう'

export function Dashboard() {
  const { streak, totalReviewed, getStats, getDueCards, getNewCards } = useVocabStore()
  const { t } = useTranslation()
  const stats = getStats()
  const dueCount = getDueCards().length
  const newCount = getNewCards(10).length

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="border-b-3 border-ink pb-8 mb-8">
        <h1 className="text-6xl font-black tracking-tighter leading-none">
          <Ruby text="今日も" html={HEADING_LINE1_RUBY} /><br />
          <Ruby text="頑張ろう" html={HEADING_LINE2_RUBY} />
        </h1>
        <p className="font-mono text-muted font-bold mt-3 uppercase tracking-widest text-sm">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-4 gap-0 mb-8 border-3 border-ink shadow-[5px_5px_0px_var(--color-ink)] overflow-hidden">
        {[
          { label: t('dashboard.streakLabel'), value: streak, suffix: t('dashboard.streakSuffix'), bg: "var(--color-yellow)", text: "var(--color-ink)" },
          { label: t('dashboard.totalWordsLabel'), value: stats.total, suffix: "", bg: "var(--color-ink)", text: "var(--color-paper)" },
          { label: t('dashboard.masteredLabel'), value: stats.mastered, suffix: "", bg: "var(--color-green)", text: "var(--color-paper)" },
          { label: t('dashboard.reviewedLabel'), value: totalReviewed, suffix: "", bg: "var(--color-paper)", text: "var(--color-ink)" },
        ].map(({ label, value, suffix, bg, text }, i) => (
          <div
            key={label}
            className={`p-6 ${i < 3 ? 'border-r-3 border-ink' : ''}`}
            style={{ backgroundColor: bg, color: text }}
          >
            <div className="font-display text-4xl">{value}{suffix}</div>
            <div className="font-mono text-xs font-bold uppercase tracking-widest mt-1 opacity-70">{label}</div>
          </div>
        ))}
      </div>

      {/* Queue cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
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
          <div className="font-display text-5xl mb-2">96</div>
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-muted mb-4">{t('dashboard.grammarPoints')}</div>
          <Link to="/grammar">
            <Button variant="green" className="w-full">{t('dashboard.studyGrammar')}</Button>
          </Link>
        </Card>
      </div>

      {/* Progress bar */}
      <Card className="p-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="font-mono font-black text-sm uppercase tracking-wider">{t('dashboard.progress')}</span>
          <span className="font-display">{Math.round((stats.mastered / stats.total) * 100)}%</span>
        </div>
        <div className="h-6 bg-surface border-3 border-ink overflow-hidden">
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
      </Card>

      {/* SRS breakdown */}
      <div className="grid grid-cols-4 gap-0 border-3 border-ink shadow-[4px_4px_0px_var(--color-ink)] overflow-hidden">
        {[
          { label: t('common.stats.new'), count: stats.new, color: "var(--color-muted)" },
          { label: t('common.stats.learning'), count: stats.learning, color: "var(--color-blue)" },
          { label: t('common.stats.review'), count: stats.review, color: "var(--color-yellow)" },
          { label: t('common.stats.mastered'), count: stats.mastered, color: "var(--color-green)" },
        ].map(({ label, count, color }, i) => (
          <div key={label} className={`p-5 text-center ${i < 3 ? 'border-r-3 border-ink' : ''}`}>
            <div className="font-display text-3xl" style={{ color }}>{count}</div>
            <div className="font-mono text-xs uppercase font-bold tracking-wider text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
