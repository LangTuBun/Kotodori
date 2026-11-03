import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Watermark } from "@/components/ui/ScreenHeader"
import { ReadingPassage } from "@/components/ui/ReadingPassage"
import { useTranslation } from "@/lib/useTranslation"
import { readingPassages } from "@/data/reading-passages"
import { readingContexts } from "@/data/reading-contexts"
import { readingChapterPages, resolveReadingSelection, PRACTICE_EXERCISES } from "@/data/reading-guides"
import type { Bilingual } from "@/data/sentence-breakdowns"

export function Reading() {
  const { localize } = useTranslation()
  const l = (en: string, vi: string) => localize({ en, vi })
  const [params, setParams] = useSearchParams()
  const { chapter, exercise, exercises, guide, practice, page, pages } = resolveReadingSelection(params)
  const key = `${chapter}-${exercise}`
  const context = practice?.context ?? readingContexts[key]
  const paragraphs = practice?.paragraphs ?? readingPassages[key] ?? []
  const [photosOpen, setPhotosOpen] = useState(false)
  function selectExercise(nextChapter: number, nextExercise: number) {
    setParams({ chapter: String(nextChapter), exercise: String(nextExercise) })
  }
  function selectPage(nextPage: number) {
    setParams({ chapter: String(chapter), exercise: String(exercise), page: String(nextPage) }, { replace: true })
  }
  function showQuestionPage() {
    if (guide) selectPage(guide.pages[guide.pages.length - 1])
    setPhotosOpen(true)
    requestAnimationFrame(() => document.getElementById("reading-source")?.scrollIntoView({ behavior: "smooth" }))
  }
  const pageIndex = pages.indexOf(page)
  const source = `${import.meta.env.BASE_URL}reading-chapters/IMG_${page}.jpg`
  const title = practice?.title ?? guide?.title
  return <div className="relative p-4 sm:p-8 max-w-4xl overflow-hidden">
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
    </div>

    <section className="glass-card p-5 sm:p-7 mb-6">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        {context && <span className="text-xs font-bold text-muted uppercase tracking-widest">{localize(context.type)}</span>}
        {practice && <span className="text-xs font-bold rounded-full border border-yellow px-2 py-0.5">{l("Original practice · not from the book", "Bài luyện tự soạn · không có trong sách")}</span>}
      </div>
      {title && <h2 className="text-2xl font-bold">{localize(title)}</h2>}
      {context && <dl className="grid gap-3 mt-4 text-sm leading-relaxed sm:grid-cols-2">
        <div><dt className="font-bold">{l("Situation", "Tình huống")}</dt><dd className="text-muted mt-1">{localize(context.situation)}</dd></div>
        <div><dt className="font-bold">{l("Read for", "Khi đọc, chú ý")}</dt><dd className="text-muted mt-1">{localize(context.focus)}</dd></div>
      </dl>}
    </section>

    <section className="glass-card p-5 sm:p-7 mb-6">
      <ReadingPassage key={key} paragraphs={paragraphs} annotations={guide?.sentences ?? []} chapter={chapter} />
    </section>

    {practice ? <div className="space-y-4">{practice.questions.map((q, i) => <QuestionCard key={`${key}-${i}`} number={practice.questions.length > 1 ? i + 1 : undefined} question={q} answer={q.answer} explanation={q.explanation} />)}</div>
      : guide && <QuestionCard key={key} question={guide.question} answer={guide.answer} explanation={guide.explanation} onShowQuestion={guide.question ? undefined : showQuestionPage} />}

    {guide && <details id="reading-source" open={photosOpen} onToggle={e => setPhotosOpen(e.currentTarget.open)} className="glass-card p-5 sm:p-7 mt-6 scroll-mt-4">
      <summary className="cursor-pointer min-h-11 flex flex-wrap items-center justify-between gap-2 font-bold">
        <span>{l("Book pages", "Trang sách")} · {l("original photo", "ảnh gốc")}</span>
        <span className="text-sm text-muted font-normal">{l("questions, maps and diagrams", "câu hỏi, bản đồ, sơ đồ")}</span>
      </summary>
      {photosOpen && <div className="mt-4">
        {pages.length > 1 && <div className="flex flex-wrap gap-2 mb-4">{pages.map(n => <button key={n} type="button" onClick={() => selectPage(n)} aria-pressed={page === n} className={`min-h-11 rounded-full border border-structural px-4 text-sm font-bold ${page === n ? "bg-blue/20" : "bg-surface"}`}>{l("Page", "Trang")} {pages.indexOf(n) + 1}</button>)}</div>}
        <a href={source} target="_blank" rel="noreferrer" aria-label={l("Open source image for zooming", "Mở ảnh gốc để phóng to")}><img key={source} src={source} loading="lazy" alt={l(`Chapter ${chapter}, photographed page ${pageIndex + 1}`, `Bài ${chapter}, ảnh trang ${pageIndex + 1}`)} className="w-full rounded-lg" /></a>
        {pages.length > 1 && <div className="flex justify-between gap-3 mt-4"><button type="button" disabled={pageIndex === 0} onClick={() => selectPage(pages[pageIndex - 1])} className="min-h-11 px-4 border border-structural rounded-full font-bold disabled:opacity-40">← {l("Previous", "Trước")}</button><button type="button" disabled={pageIndex === pages.length - 1} onClick={() => selectPage(pages[pageIndex + 1])} className="min-h-11 px-4 border border-structural rounded-full font-bold disabled:opacity-40">{l("Next", "Tiếp")} →</button></div>}
      </div>}
    </details>}
  </div>
}

function QuestionCard({ number, question, answer, explanation, onShowQuestion }: { number?: number; question?: { jp: string; options: string[] }; answer: number | null; explanation: Bilingual; onShowQuestion?: () => void }) {
  const { localize } = useTranslation()
  const l = (en: string, vi: string) => localize({ en, vi })
  const [choice, setChoice] = useState<number | null>(null)
  if (answer === null) return <details className="glass-card p-5 sm:p-7 text-sm"><summary className="cursor-pointer min-h-11 flex items-center font-bold">{l("Reading notes · question cropped in photo", "Ghi chú đọc · câu hỏi bị cắt trong ảnh")}</summary><p className="text-muted leading-relaxed">{localize(explanation)}</p></details>
  const labels = question?.options ?? ["a)", "b)", "c)", "d)"]
  return <section className="glass-card p-5 sm:p-7">
    <h2 className="font-bold text-lg">{l("Check your understanding", "Kiểm tra mức hiểu")}{number && ` · ${l("Question", "Câu")} ${number}`}</h2>
    {question ? <p lang="ja" className="jp text-lg font-bold mt-3 mb-3">{question.jp}</p> : <div className="flex flex-wrap items-center gap-3 mt-2 mb-3"><p className="text-sm text-muted">{l("The question and options are printed in the book.", "Câu hỏi và các lựa chọn nằm trong sách.")}</p>{onShowQuestion && <button type="button" onClick={onShowQuestion} className="min-h-11 text-sm font-bold underline underline-offset-4">{l("Show question page", "Xem trang câu hỏi")} ↓</button>}</div>}
    <div className={`grid gap-2 ${question ? "sm:grid-cols-2" : "grid-cols-4"}`}>{labels.map((label, i) => <button key={i} type="button" aria-pressed={choice === i + 1} onClick={() => setChoice(i + 1)} className={`min-h-11 rounded-lg border border-structural px-3 py-2 font-bold ${question ? "jp text-left" : ""} ${choice === i + 1 ? (choice === answer ? "bg-green/20" : "bg-red/15") : "bg-surface"}`}>{question && <span className="text-muted mr-2">{String.fromCharCode(97 + i)}.</span>}{label}</button>)}</div>
    {choice !== null && <div role="status" className="text-sm mt-3 leading-relaxed">
      <p className="font-bold">{choice === answer ? l("Correct.", "Chính xác.") : l("Not quite. Recheck the clues in the passage.", "Chưa đúng. Xem lại dữ kiện trong bài.")}</p>
      {choice === answer && <p className="mt-2">{localize(explanation)}</p>}
    </div>}
  </section>
}
