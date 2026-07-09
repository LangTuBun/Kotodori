import { Link } from "react-router-dom"
import { useVocabStore } from "@/store/vocab-store"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Ruby } from "@/components/ui/Ruby"

const HEADING_LINE1_RUBY = '<ruby>今日<rp>(</rp><rt>きょう</rt><rp>)</rp></ruby>も'
const HEADING_LINE2_RUBY = '<ruby>頑張<rp>(</rp><rt>がんば</rt><rp>)</rp></ruby>ろう'

export function Dashboard() {
  const { streak, totalReviewed, getStats, getDueCards, getNewCards } = useVocabStore()
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
        <p className="text-muted font-bold mt-3 uppercase tracking-widest text-sm">
          Let's study Japanese today
        </p>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-4 gap-0 mb-8 border-3 border-ink shadow-[5px_5px_0px_#0a0a0a]">
        {[
          { label: "Streak", value: streak, suffix: " days", bg: "#ffe600", text: "#0a0a0a" },
          { label: "Total Words", value: stats.total, suffix: "", bg: "#0a0a0a", text: "#fafaf7" },
          { label: "Mastered", value: stats.mastered, suffix: "", bg: "#00cc66", text: "#fafaf7" },
          { label: "Reviewed", value: totalReviewed, suffix: "", bg: "#fafaf7", text: "#0a0a0a" },
        ].map(({ label, value, suffix, bg, text }, i) => (
          <div
            key={label}
            className={`p-6 ${i < 3 ? 'border-r-3 border-ink' : ''}`}
            style={{ backgroundColor: bg, color: text }}
          >
            <div className="text-4xl font-black">{value}{suffix}</div>
            <div className="text-xs font-bold uppercase tracking-widest mt-1 opacity-70">{label}</div>
          </div>
        ))}
      </div>

      {/* Queue cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card accent={dueCount > 0 ? 'red' : null} className="p-6">
          <div className="text-5xl font-black mb-2">{dueCount}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted mb-4">Cards Due</div>
          <Link to="/review">
            <Button variant={dueCount > 0 ? 'red' : 'secondary'} className="w-full">
              {dueCount > 0 ? 'Review Now' : 'All done!'}
            </Button>
          </Link>
        </Card>

        <Card accent="yellow" className="p-6">
          <div className="text-5xl font-black mb-2">{newCount}</div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted mb-4">New Words</div>
          <Link to="/vocab">
            <Button variant="yellow" className="w-full">Learn New</Button>
          </Link>
        </Card>

        <Card accent="green" className="p-6">
          <div className="text-5xl font-black mb-2">96</div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted mb-4">Grammar Points</div>
          <Link to="/grammar">
            <Button variant="green" className="w-full">Study Grammar</Button>
          </Link>
        </Card>
      </div>

      {/* Progress bar */}
      <Card className="p-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="font-black text-sm uppercase tracking-wider">N5 Progress</span>
          <span className="font-black">{Math.round((stats.mastered / stats.total) * 100)}%</span>
        </div>
        <div className="h-6 bg-surface border-3 border-ink">
          <div
            className="h-full bg-green transition-all duration-500"
            style={{ width: `${(stats.mastered / stats.total) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted mt-2 uppercase font-bold tracking-wider">
          <span>0</span>
          <span>{stats.mastered} / {stats.total} mastered</span>
          <span>{stats.total}</span>
        </div>
      </Card>

      {/* SRS breakdown */}
      <div className="grid grid-cols-4 gap-0 border-3 border-ink shadow-[4px_4px_0px_#0a0a0a]">
        {[
          { label: "New", count: stats.new, color: "#6b6b6b" },
          { label: "Learning", count: stats.learning, color: "#0057ff" },
          { label: "Review", count: stats.review, color: "#ffe600" },
          { label: "Mastered", count: stats.mastered, color: "#00cc66" },
        ].map(({ label, count, color }, i) => (
          <div key={label} className={`p-5 text-center ${i < 3 ? 'border-r-3 border-ink' : ''}`}>
            <div className="text-3xl font-black" style={{ color }}>{count}</div>
            <div className="text-xs uppercase font-bold tracking-wider text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
