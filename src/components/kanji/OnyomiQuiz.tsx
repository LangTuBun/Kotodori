import { useMemo, useState } from "react"
import { ONYOMI_RULES, type OnyomiExample } from "@/lib/onyomi-rules"
import { useTranslation } from "@/lib/useTranslation"

// Practice for the Hán Việt → on'yomi rules: "Âm Hán Việt Khoa (科) → On'yomi nào?"
// Questions come from the rule examples the page already shows, so the drill
// only ever asks about correspondences the rules above describe.
const POOL: OnyomiExample[] = (() => {
  const seen = new Set<string>()
  const out: OnyomiExample[] = []
  for (const r of ONYOMI_RULES) {
    for (const ex of r.examples) {
      if (seen.has(ex.kanji)) continue
      seen.add(ex.kanji)
      out.push(ex)
    }
  }
  return out
})()

const toHiragana = (s: string) => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60))

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface Question { ex: OnyomiExample; options: string[] }

function makeQuestion(): Question {
  const ex = POOL[Math.floor(Math.random() * POOL.length)]
  const answer = ex.on[0]
  const wrong = shuffle(
    Array.from(new Set(POOL.flatMap(p => p.on))).filter(o => !ex.on.includes(o))
  ).slice(0, 3)
  return { ex, options: shuffle([answer, ...wrong]) }
}

export function OnyomiQuiz() {
  const { localize } = useTranslation()
  const L = (vi: string, en: string) => localize({ vi, en })
  const [q, setQ] = useState<Question>(() => makeQuestion())
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })

  const correct = useMemo(() => new Set(q.ex.on), [q])

  function pick(opt: string) {
    if (picked !== null) return
    setPicked(opt)
    setScore(s => ({ right: s.right + (correct.has(opt) ? 1 : 0), total: s.total + 1 }))
  }

  function next() {
    setQ(makeQuestion())
    setPicked(null)
  }

  return (
    <section id="on-yomi-quiz" className="scroll-mt-4 mt-14">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-black tracking-tight">{L("Bài tập áp dụng", "Practice")}</h2>
        <span className="text-xs font-black uppercase tracking-wider text-muted">
          {L("Đúng", "Correct")} {score.right}/{score.total}
        </span>
      </div>
      <div className="mt-4 glass-card p-4 sm:p-5">
        <div className="font-black text-lg">
          {L("Âm Hán Việt", "Hán Việt")} <span className="text-red">{q.ex.hanviet}</span>{" "}
          (<span className="jp">{q.ex.kanji}</span>) → {L("On'yomi nào?", "Which on'yomi?")}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {q.options.map(opt => {
            const isRight = correct.has(opt)
            const state =
              picked === null ? "border-structural bg-paper hover:bg-yellow/30"
              : isRight ? "border-structural bg-green/40"
              : opt === picked ? "border-structural bg-red/30"
              : "border-structural bg-paper opacity-60"
            return (
              <button
                key={opt}
                type="button"
                disabled={picked !== null}
                onClick={() => pick(opt)}
                className={`jp py-3 border-3 font-black text-lg cursor-pointer transition-colors disabled:cursor-default ${state}`}
              >
                {toHiragana(opt)}
              </button>
            )
          })}
        </div>
        {picked !== null && (
          <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm font-bold">
              {correct.has(picked) ? L("Chính xác!", "Correct!") : L("Chưa đúng.", "Not quite.")}{" "}
              <span className="text-muted">
                {q.ex.kanji}: {q.ex.on.map(toHiragana).join(" / ")}
              </span>
            </div>
            <button
              type="button"
              onClick={next}
              className="px-4 py-2 border-3 border-accent bg-accent text-accent-fg font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              {L("Câu tiếp", "Next")} →
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
