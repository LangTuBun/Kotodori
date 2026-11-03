import { useState } from "react"
import { Link } from "react-router-dom"
import { Watermark } from "@/components/ui/ScreenHeader"
import { useTranslation } from "@/lib/useTranslation"
import { sentenceBreakdowns } from "@/data/sentence-breakdowns"
import { SentenceBreakdown } from "@/components/ui/SentenceBreakdown"

const chapterPages: Record<number, [number, number]> = {
  16: [1836, 1837], 17: [1838, 1840], 18: [1841, 1842], 19: [1843, 1844],
  20: [1845, 1847], 21: [1848, 1850], 22: [1851, 1852], 23: [1853, 1855],
  24: [1856, 1859], 25: [1860, 1862], 26: [1863, 1865], 27: [1866, 1868],
  28: [1869, 1871], 29: [1872, 1875], 30: [1876, 1878], 31: [1879, 1881],
  32: [1882, 1885], 33: [1886, 1888],
}

const sample = [
  { jp: "山田さんへ", en: "To Yamada,", vi: "Gửi anh/chị Yamada," },
  { jp: "お疲れ様です。もう聞きましたか。高木さん、会社をやめるそうですね。", en: "Hello. Have you heard? Apparently Takagi is leaving the company.", vi: "Chào anh/chị. Anh/chị nghe tin chưa? Nghe nói anh Takagi sẽ nghỉ việc ở công ty.", grammar: "g_144", pattern: "〜そうです", note: { en: "Reports information heard from someone else.", vi: "Dùng để thuật lại thông tin nghe được." } },
  { jp: "マイさんから聞きました。", en: "I heard it from Mai.", vi: "Tôi nghe tin từ Mai." },
  { jp: "7月まで働いて、その後すぐに北海道に引っ越すらしいと部長が言っていました。", en: "The manager said Takagi would apparently work until July and move to Hokkaido straight afterwards.", vi: "Trưởng phòng nói rằng anh ấy nghe đâu sẽ làm việc đến tháng 7 rồi chuyển ngay đến Hokkaido.", grammar: "g_142", pattern: "〜らしい", note: { en: "Indicates indirect information; と言っていました reports what the manager said.", vi: "Diễn đạt thông tin gián tiếp; と言っていました thuật lại lời trưởng phòng." } },
  { jp: "7月の終わりに、さよならパーティーをしませんか。", en: "Shall we have a farewell party at the end of July?", vi: "Cuối tháng 7 chúng ta tổ chức tiệc chia tay nhé?", note: { en: "〜ませんか is a polite invitation.", vi: "〜ませんか là cách mời lịch sự." } },
  { jp: "みなさん忙しいと思いますから、仕事の後、会社の近くの店でやりたいです。", en: "I think everyone is busy, so I would like to hold it after work at a place near the office.", vi: "Vì tôi nghĩ mọi người bận nên tôi muốn tổ chức sau giờ làm tại một quán gần công ty.", grammar: "g_147", pattern: "〜と思います", note: { en: "Marks the writer's own thought; から gives the reason.", vi: "Đánh dấu suy nghĩ của người viết; から nêu lý do." } },
  { jp: "今、みなさんに暇な日を聞いています。山田さんが参加できる日を教えてください。", en: "I'm asking everyone when they are free. Please tell me which day you can attend.", vi: "Tôi đang hỏi ngày rảnh của mọi người. Hãy cho tôi biết ngày anh/chị Yamada có thể tham gia." },
  { jp: "田中さんとマイさんはいつでもいいそうです。", en: "Apparently any day is fine for Tanaka and Mai.", vi: "Nghe nói ngày nào anh/chị Tanaka và Mai cũng được.", grammar: "g_144", pattern: "〜そうです", note: { en: "Hearsay again: the writer reports their availability.", vi: "Lại là cách thuật lại thông tin: người viết kể về thời gian rảnh của họ." } },
  { jp: "高村", en: "Takamura", vi: "Takamura" },
]

export function Reading() {
  const { localize } = useTranslation()
  const l = (en: string, vi: string) => localize({ en, vi })
  const [chapter, setChapter] = useState(16)
  const [page, setPage] = useState(1836)
  const [answer, setAnswer] = useState<number | null>(null)
  const [first, last] = chapterPages[chapter]
  const source = `${import.meta.env.BASE_URL}reading-chapters/IMG_${page}.jpg`
  return <div className="relative p-4 sm:p-8 max-w-4xl overflow-hidden">
    <Watermark char="読" />
    <header className="border-b border-structural pb-7 mb-7">
      <p className="text-xs font-bold tracking-widest text-muted uppercase mb-2">N4 · 読解</p>
      <h1 className="text-[clamp(2rem,8vw,3rem)] font-black tracking-tighter">{l("Chapter reading", "Đọc hiểu theo bài")}</h1>
      <p className="text-muted mt-3 leading-relaxed max-w-2xl">{l("Read the book exercises by chapter. Open a sentence in the guided example to explore its meaning and grammar.", "Đọc bài tập trong sách theo từng bài. Mở từng câu trong bài hướng dẫn để xem nghĩa và ngữ pháp.")}</p>
    </header>
    <div className="flex flex-wrap items-end gap-4 mb-7">
      <label className="flex flex-col gap-2 text-sm font-bold">{l("Chapter", "Bài")}
        <select value={chapter} onChange={e => { const n = Number(e.target.value); setChapter(n); setPage(chapterPages[n][0]); setAnswer(null) }} className="min-h-11 min-w-40 px-3 bg-card border border-structural rounded-lg">
          {Object.keys(chapterPages).map(n => <option key={n} value={n}>{l("Chapter", "Bài")} {n}</option>)}
        </select>
      </label>
      <p className="text-sm text-muted">{l("Chapter 15 has no reading section.", "Bài 15 không có phần đọc hiểu.")}</p>
    </div>
    {chapter === 16 && <section className="glass-card p-5 sm:p-7 mb-6">
      <div className="mb-4"><p className="text-xs font-bold text-muted uppercase tracking-widest">{l("Guided reading · Email", "Đọc có hướng dẫn · Email")}</p><h2 className="text-xl font-bold mt-1">{l("A farewell party", "Tiệc chia tay")}</h2></div>
      <p className="text-sm text-muted mb-4">{l("Open a sentence, then select a phrase for its grammar lesson, vocabulary and meaning in context.", "Mở câu rồi chọn cụm để xem bài ngữ pháp, từ vựng và ý nghĩa trong ngữ cảnh.")}</p>
      <div className="divide-y divide-structural">
        {sample.map((s, i) => { const breakdown = sentenceBreakdowns[s.jp]; return <details key={i} className="group py-2">
          <summary className="jp cursor-pointer min-h-11 flex items-center justify-between gap-3 text-lg leading-loose list-none"><span>{breakdown ? breakdown.chunks.map((chunk, n) => <span key={n} className={chunk.grammarIds?.length ? "decoration-blue underline decoration-2 underline-offset-4" : ""}>{chunk.text}</span>) : s.jp}</span><span aria-hidden="true" className="text-muted text-sm group-open:rotate-180 transition-transform">⌄</span></summary>
          <div className="pb-3 text-sm leading-relaxed">
            <p>{l(s.en, s.vi)}</p>
            {breakdown ? <SentenceBreakdown data={breakdown} showSentence={false} /> : s.note && <p className="mt-2 text-muted">{s.grammar && <Link className="font-bold underline jp mr-2" to={`/grammar?point=${s.grammar}`}>{s.pattern}</Link>}{localize(s.note)}</p>}
          </div>
        </details> })}
      </div>
      <details className="mt-4 rounded-lg bg-surface px-4 py-3">
        <summary className="cursor-pointer font-bold">{l("Useful words", "Từ vựng hữu ích")}</summary>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <li><span className="jp font-bold">引っ越す（ひっこす）</span> — {l("to move house", "chuyển nhà")}</li>
          <li><span className="jp font-bold">部長（ぶちょう）</span> — {l("department manager", "trưởng phòng")}</li>
          <li><span className="jp font-bold">参加（さんか）</span> — {l("participation", "tham gia")}</li>
          <li><span className="jp font-bold">暇（ひま）</span> — {l("free time", "thời gian rảnh")}</li>
        </ul>
      </details>
      <div className="mt-5 border-t border-structural pt-5">
        <p className="jp font-bold mb-3">誰が仕事をやめますか。</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{["部長", "山田さん", "高木さん", "高村さん"].map((option, i) => <button type="button" key={option} onClick={() => setAnswer(i)} aria-pressed={answer === i} className={`jp min-h-11 rounded-lg border border-structural px-3 py-2 text-left ${answer === i ? "bg-blue/20" : "bg-surface"}`}>{option}</button>)}</div>
        {answer !== null && <p className="mt-3 text-sm" role="status">{answer === 2 ? l("Correct.", "Chính xác.") : l("Try again.", "Hãy thử lại.")} {answer === 2 && l("The email says Takagi is leaving the company.", "Email nói rằng Takagi sẽ nghỉ việc ở công ty.")}</p>}
      </div>
      <p className="mt-4 text-xs text-muted">{l("The original page below includes furigana.", "Trang gốc bên dưới có furigana.")}</p>
    </section>}
    <section className="glass-card p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4"><div><p className="text-xs font-bold text-muted uppercase tracking-widest">{l("Book pages", "Trang sách")}</p><h2 className="text-xl font-bold mt-1">{l("Chapter", "Bài")} {chapter}</h2></div><span className="text-sm text-muted">{page - first + 1} / {last - first + 1}</span></div>
      <p className="text-sm text-muted mb-4">{l("Read the photographed exercises here. Open the image to zoom; some questions continue on the next page.", "Đọc bài tập từ ảnh tại đây. Mở ảnh để phóng to; một số câu hỏi tiếp tục ở trang sau.")}</p>
      <a href={source} target="_blank" rel="noreferrer" aria-label={l("Open source image for zooming", "Mở ảnh gốc để phóng to")}><img src={source} alt={l(`Chapter ${chapter}, photographed page ${page - first + 1}`, `Bài ${chapter}, ảnh trang ${page - first + 1}`)} className="w-full rounded-lg" /></a>
      <div className="flex justify-between gap-3 mt-4"><button type="button" disabled={page === first} onClick={() => setPage(n => n - 1)} className="min-h-11 px-4 border border-structural rounded-full font-bold disabled:opacity-40">← {l("Previous", "Trước")}</button><button type="button" disabled={page === last} onClick={() => setPage(n => n + 1)} className="min-h-11 px-4 border border-structural rounded-full font-bold disabled:opacity-40">{l("Next", "Tiếp")} →</button></div>
    </section>
  </div>
}
