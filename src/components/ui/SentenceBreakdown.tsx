import { useId, useState } from "react"
import type { SentenceBreakdownData } from "@/data/sentence-breakdowns"
import { useTranslation } from "@/lib/useTranslation"
import { GrammarHoverLink } from "@/components/ui/GrammarHoverLink"
import { getGrammarLinks } from "@/data/grammar-links"
import { Furigana } from "@/components/ui/Furigana"
import { SpeakButton } from "@/components/ui/SpeakButton"

const grammarById = new Map(getGrammarLinks('all').map(g => [g.id, g]))

export function SentenceBreakdown({ data, showSentence = true }: { data: SentenceBreakdownData; showSentence?: boolean }) {
  const { localize } = useTranslation()
  const [selected, setSelected] = useState<number | null>(null)
  const detailId = useId()
  const l = (en: string, vi: string) => localize({ en, vi })
  return <div className="mt-4 border-t border-structural pt-4">
    {showSentence && <><div className="jp text-lg font-bold leading-loose break-words">{data.sentence}</div>
    <p className="text-sm text-muted mt-1">{localize(data.translation)}</p></>}
    <div className="flex flex-wrap gap-3 text-xs mt-3 text-muted"><span className="border-b-2 border-blue pb-1">{l("Grammar pattern", "Mẫu ngữ pháp")}</span><span className="border-b-2 border-green pb-1">{l("Vocabulary", "Từ vựng")}</span><span>{l("Select a phrase for details", "Chọn cụm để xem chi tiết")}</span></div>
    <div className="flex flex-wrap items-stretch gap-x-2 gap-y-3 mt-2">
      {data.chunks.map((chunk, index) => <button
        key={index} type="button" aria-expanded={selected === index} aria-controls={detailId}
        onClick={() => setSelected(selected === index ? null : index)}
        className={`min-h-11 max-w-full text-left rounded-lg px-2 py-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${selected === index ? "bg-surface" : "hover:bg-surface"}`}
      >
        <span className={`jp block text-base font-bold leading-relaxed break-words border-b-2 pb-1 ${chunk.grammarIds?.length ? "border-blue" : chunk.words?.length ? "border-green" : "border-structural"}`}>{chunk.text}</span>
        <span className="block text-xs text-muted mt-1 leading-relaxed">{localize(chunk.label)}</span>
        <span className="block text-[11px] text-muted mt-1">{chunk.grammarIds?.length ? l("Grammar", "Ngữ pháp") : chunk.words?.length ? l("Vocabulary", "Từ vựng") : l("Structure", "Cấu trúc")}</span>
      </button>)}
    </div>
    <div id={detailId} aria-live="polite">
      {selected !== null && <div className="mt-3 rounded-lg bg-surface p-4 text-sm leading-relaxed">
        <div className="jp font-bold mb-1">{data.chunks[selected].text}</div>
        <p>{localize(data.chunks[selected].detail)}</p>
        {!!data.chunks[selected].grammarIds?.length && <div className="mt-4 border-l-2 border-blue pl-3">
          <div className="font-bold mb-2">{l("Grammar in this phrase", "Ngữ pháp trong cụm này")}</div>
          {data.chunks[selected].grammarIds?.map(id => { const g = grammarById.get(id); return g && <div key={id} className="mb-3 last:mb-0">
            <GrammarHoverLink g={g} className="jp font-bold underline underline-offset-4">{g.pattern} ↗</GrammarHoverLink>
            <p className="text-xs text-muted mt-1">{g.jlptLevel ?? (g.chapter >= 16 ? "N4" : "N5")} · {l("Chapter", "Bài")} {g.chapter}</p>
            <p className="mt-1">{localize(g.meaning)}</p>
          </div> })}
        </div>}
        {!!data.chunks[selected].words?.length && <div className="mt-4 border-l-2 border-green pl-3">
          <div className="font-bold mb-2">{l("Words in context", "Từ vựng trong ngữ cảnh")}</div>
          {data.chunks[selected].words?.map(word => <div key={word.text} className="mb-2 last:mb-0"><div className="flex items-center gap-2"><Furigana kanji={word.text} kana={word.kana} className="font-bold" /><SpeakButton text={word.text} /></div><p>{localize(word.meaning)}</p></div>)}
        </div>}
      </div>}
    </div>
    <details className="mt-4 text-sm">
      <summary className="cursor-pointer font-bold min-h-11 flex items-center">{l("How it fits together", "Ghép các thành phần")}</summary>
      <p className="text-muted leading-relaxed pb-2">{localize(data.together)}</p>
    </details>
  </div>
}
