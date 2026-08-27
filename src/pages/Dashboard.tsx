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
  const { getDueCards, getNewCards } = useVocabStore()
  const level = useSettingsStore(s => s.level)
  const { t } = useTranslation()
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

      {/* Queue cards */}
      <Reveal index={1} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
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
    </div>
  )
}
