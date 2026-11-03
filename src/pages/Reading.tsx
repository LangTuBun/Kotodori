import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Watermark } from "@/components/ui/ScreenHeader"
import { ReadingPassage } from "@/components/ui/ReadingPassage"
import { ReadingText } from "@/components/ui/ReadingText"
import { FuriganaContext } from "@/lib/furigana-context"
import { useTranslation } from "@/lib/useTranslation"
import { readingPassages } from "@/data/reading-passages"
import { readingContexts } from "@/data/reading-contexts"
import { readingChapterPages, resolveReadingSelection, PRACTICE_EXERCISES } from "@/data/reading-guides"
import type { Bilingual, SentenceBreakdownData } from "@/data/sentence-breakdowns"

// One file per chapter, loaded on demand so the grammar pages never ship them.
const breakdownFiles = import.meta.glob<SentenceBreakdownData[]>("../data/breakdowns/*.json", { import: "default" })

export function Reading() {
  const { localize } = useTranslation()
  const l = (en: string, vi: string) => localize({ en, vi })
  const [params, setParams] = useSearchParams()
  const { chapter, exercise, exercises, guide, practice } = resolveReadingSelection(params)
  const key = `${chapter}-${exercise}`
  const context = practice?.context ?? readingContexts[key]
  const paragraphs = practice?.paragraphs ?? readingPassages[key] ?? []
  const [furigana, setFurigana] = useState(() => { try { return localStorage.getItem("tori-reading-furigana") !== "off" } catch { return true } })
  function toggleFurigana() {
    setFurigana(!furigana)
    try { localStorage.setItem("tori-reading-furigana", furigana ? "off" : "on") } catch { /* private mode: keep in memory */ }
  }
  function selectExercise(nextChapter: number, nextExercise: number) {
    setParams({ chapter: String(nextChapter), exercise: String(nextExercise) })
  }
  const [loaded, setLoaded] = useState<{ chapter: number; list: SentenceBreakdownData[] }>()
  useEffect(() => {
    let live = true
    breakdownFiles[`../data/breakdowns/${chapter}.json`]?.().then(list => { if (live) setLoaded({ chapter, list }) })
    return () => { live = false }
  }, [chapter])
  const breakdowns = loaded?.chapter === chapter ? loaded.list : []
  const title = practice?.title ?? guide?.title
  return <FuriganaContext.Provider value={furigana}><div className="relative p-4 sm:p-8 max-w-4xl overflow-hidden">
    <Watermark char="読" />
    <header className="border-b border-structural pb-7 mb-7">
      <p className="text-xs font-bold tracking-widest text-muted uppercase mb-2">N4 · 読解</p>
      <h1 className="text-[clamp(2rem,8vw,3rem)] font-black tracking-tighter">{l("Chapter reading", "Đọc hiểu theo bài")}</h1>
      <p className="text-muted mt-3 leading-relaxed max-w-2xl">{l("Read the full text, check the situation, then explore any sentence or paragraph for its meaning, grammar and vocabulary.", "Đọc toàn bài, nắm tình huống, rồi khám phá bất kỳ câu hay đoạn nào để xem nghĩa, ngữ pháp và từ vựng.")}</p>
    </header>
    <div className="flex flex-wrap items-end gap-4 mb-7">
      <label className="flex flex-col gap-2 text-sm font-bold">{l("Chapter", "Bài")}
        <select value={chapter} onChange={e => selectExercise(Number(e.target.value), 1)} className="min-h-11 min-w-40 px-3 bg-card border border-structural rounded-lg">
          {Object.keys(readingChapterPages).map(n => <option key={n} value={n}>{l("Chapter", "Bài")} {n}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm font-bold">{l("Exercise", "Bài tập")}
        <select value={exercise} onChange={e => selectExercise(chapter, Number(e.target.value))} className="min-h-11 min-w-48 px-3 bg-card border border-structural rounded-lg">
          {exercises.map(n => <option key={n} value={n}>{n === PRACTICE_EXERCISES.practice ? `✦ ${l("Extra practice", "Luyện thêm")}` : n === PRACTICE_EXERCISES.review ? `✦ ${l("Review mix · JLPT style", "Ôn tổng hợp · kiểu JLPT")}` : `${l("Exercise", "Bài tập")} ${n}`}</option>)}
        </select>
      </label>
      <button type="button" onClick={toggleFurigana} aria-pressed={furigana} className={`min-h-11 rounded-full px-4 text-sm font-bold border border-structural ${furigana ? "bg-accent text-accent-fg" : "hover:bg-surface"}`}>{l("Furigana", "Furigana")} · {furigana ? l("on", "bật") : l("off", "tắt")}</button>
    </div>

    <section className="glass-card p-5 sm:p-7 mb-6">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        {context && <span className="text-xs font-bold text-muted uppercase tracking-widest">{localize(context.type)}</span>}
      </div>
      {title && <h2 className="text-2xl font-bold">{localize(title)}</h2>}
      {context && <dl className="grid gap-3 mt-4 text-sm leading-relaxed sm:grid-cols-2">
        <div><dt className="font-bold">{l("Situation", "Tình huống")}</dt><dd className="text-muted mt-1">{localize(context.situation)}</dd></div>
        <div><dt className="font-bold">{l("Read for", "Khi đọc, chú ý")}</dt><dd className="text-muted mt-1">{localize(context.focus)}</dd></div>
      </dl>}
    </section>

    <section className="glass-card p-5 sm:p-7 mb-6">
      <ReadingPassage key={key} paragraphs={paragraphs} annotations={[...breakdowns, ...(guide?.sentences ?? [])]} chapter={chapter} />
    </section>

    {practice ? <div className="space-y-4">{practice.questions.map((q, i) => <QuestionCard key={`${key}-${i}`} number={practice.questions.length > 1 ? i + 1 : undefined} question={q} answer={q.answer} explanation={q.explanation} />)}</div>
      : guide && <QuestionCard key={key} question={guide.question} answer={guide.answer} explanation={guide.explanation} />}

  </div></FuriganaContext.Provider>
}

function QuestionCard({ number, question, answer, explanation }: { number?: number; question?: { jp: string; options: string[] }; answer: number | null; explanation: Bilingual }) {
  const { localize } = useTranslation()
  const l = (en: string, vi: string) => localize({ en, vi })
  const [choice, setChoice] = useState<number | null>(null)
  if (!question || answer === null) return null
  return <section className="glass-card p-5 sm:p-7">
    <h2 className="font-bold text-lg">{l("Check your understanding", "Kiểm tra mức hiểu")}{number && ` · ${l("Question", "Câu")} ${number}`}</h2>
    <p lang="ja" className="jp text-lg font-bold mt-3 mb-3 leading-loose"><ReadingText text={question.jp} /></p>
    <div className="grid gap-2 sm:grid-cols-2">{question.options.map((label, i) => <button key={i} type="button" aria-pressed={choice === i + 1} onClick={() => setChoice(i + 1)} className={`min-h-11 rounded-lg border border-structural px-3 py-2 font-bold jp text-left leading-loose ${choice === i + 1 ? (choice === answer ? "bg-green/20" : "bg-red/15") : "bg-surface"}`}><span className="text-muted mr-2">{String.fromCharCode(97 + i)}.</span><ReadingText text={label} /></button>)}</div>
    {choice !== null && <div role="status" className="text-sm mt-3 leading-relaxed">
      <p className="font-bold">{choice === answer ? l("Correct.", "Chính xác.") : l("Not quite. Recheck the clues in the passage.", "Chưa đúng. Xem lại dữ kiện trong bài.")}</p>
      {choice === answer && <p className="mt-2">{localize(explanation)}</p>}
    </div>}
  </section>
}
