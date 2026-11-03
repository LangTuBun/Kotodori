import { useMemo, useState } from 'react'

import type { ReadingParagraph, ReadingSentence } from '@/data/reading-passages'
import type { SentenceBreakdownData } from '@/data/sentence-breakdowns'
import { sentenceBreakdowns } from '@/data/sentence-breakdowns'
import { getGrammarLinks } from '@/data/grammar-links'
import { useVocab } from '@/data/vocab'
import { checkVerb, conjugate } from '@/lib/verb-conjugation'
import { matchReadingWords, type ReadingWord } from '@/lib/reading-vocabulary'
import { useTranslation } from '@/lib/useTranslation'
import { Furigana } from './Furigana'
import { SpeakButton } from './SpeakButton'
import { SentenceBreakdown } from './SentenceBreakdown'
import { ReadingText } from './ReadingText'
import { GrammarHoverLink } from './GrammarHoverLink'

const allGrammar = getGrammarLinks('all')
const grammar = new Map(allGrammar.map(g => [g.id, g]))
const normalize = (text: string) => text.replace(/^[①-⑳☑□\d.\s]+/, '').replace(/\s/g, '')
const examples = Object.values(sentenceBreakdowns).filter((s): s is SentenceBreakdownData => !!s)

type Selection = { paragraph: number; sentence: number | null }

export function ReadingPassage({ paragraphs, annotations, chapter }: { paragraphs: ReadingParagraph[]; annotations: SentenceBreakdownData[]; chapter: number }) {
  const { localize } = useTranslation()
  const l = (en: string, vi: string) => localize({ en, vi })
  const vocab = useVocab('all')
  const dictionary = useMemo<ReadingWord[]>(() => vocab.map(entry => {
    const forms = new Set([entry.kanji, entry.kana].filter(Boolean))
    if (entry.verbGroup) {
      const result = checkVerb(entry.kanji)
      if (result?.status === 'known' && result.dict && result.group) {
        forms.add(result.dict)
        const conjugations = conjugate(result.dict, result.group)
        if (conjugations) {
          Object.values(conjugations).forEach(form => forms.add(form))
          forms.add(conjugations.masu.replace(/ます$/, 'ました'))
          forms.add(conjugations.masu.replace(/ます$/, 'ません'))
          forms.add(conjugations.nai.replace(/ない$/, 'なかった'))
        }
      }
    }
    return { entry, forms: [...forms] }
  }), [vocab])
  const [view, setView] = useState<'sentences' | 'paragraphs'>('sentences')
  const [selected, setSelected] = useState<Selection | null>(null)
  const [focus, setFocus] = useState<string | null>(null)
  const curated = [...annotations, ...examples]
  // Exact match first, so a short shared sentence can't steal a longer line's breakdown.
  const breakdownOf = (line: ReadingSentence) => {
    const text = normalize(line.jp)
    return curated.find(s => normalize(s.sentence) === text) ?? curated.find(s => text.includes(normalize(s.sentence)))
  }
  const used = new Map<string, number>()
  paragraphs.flat().forEach(s => s.grammarIds.forEach(id => used.set(id, (used.get(id) ?? 0) + 1)))
  // N5 uses chapters 1–14 and N4 16–33, and later points lack jlptLevel, so chapter alone identifies them.
  const chapterGrammar = allGrammar.filter(g => g.chapter === chapter)
  const otherGrammar = [...used.keys()].filter(id => grammar.get(id)?.chapter !== chapter).map(id => grammar.get(id)).filter(g => !!g).sort((a, b) => a.chapter - b.chapter)
  const isSelected = (paragraph: number, sentence: number | null) => selected?.paragraph === paragraph && selected.sentence === sentence
  function select(paragraph: number, sentence: number | null) {
    setSelected(isSelected(paragraph, sentence) ? null : { paragraph, sentence })
  }
  function toggleFocus(id: string) {
    setFocus(focus === id ? null : id)
    setView('sentences')
  }
  const panel = (paragraph: number, sentence: number | null) => {
    const lines = sentence === null ? paragraphs[paragraph] : [paragraphs[paragraph][sentence]]
    return <AnalysisPanel lines={lines} whole={sentence === null} breakdown={lines.length === 1 ? breakdownOf(lines[0]) : undefined} dictionary={dictionary} />
  }
  return <div>
    <GrammarSpotlight chapter={chapter} points={chapterGrammar} other={otherGrammar} used={used} focus={focus} onFocus={toggleFocus} />
    <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label={l('Reading view', 'Cách xem bài đọc')}>
      {(['sentences', 'paragraphs'] as const).map(mode => <button type="button" key={mode} onClick={() => { setView(mode); setSelected(null) }} aria-pressed={view === mode} className={`min-h-11 rounded-full px-4 text-sm font-bold border border-structural ${view === mode ? 'bg-accent text-accent-fg' : 'hover:bg-surface'}`}>{mode === 'sentences' ? l('Explore sentences', 'Khám phá từng câu') : l('Read paragraphs', 'Đọc theo đoạn')}</button>)}
    </div>
    <p className="text-sm text-muted mb-6">{view === 'sentences'
      ? l('Tap a sentence for its meaning, grammar and vocabulary. ◆ marks a sentence with a phrase-by-phrase breakdown.', 'Chạm vào câu để xem nghĩa, ngữ pháp và từ vựng. ◆ là câu có phân tích từng cụm.')
      : l('Read each paragraph straight through, then open it to check every sentence’s meaning.', 'Đọc liền mạch từng đoạn, rồi mở ra để kiểm tra nghĩa từng câu.')}</p>
    <div className="space-y-7">{paragraphs.map((paragraph, p) => <section key={p} className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-structural pb-2 mb-2">
        <p className="text-xs text-muted font-bold">{l('Paragraph', 'Đoạn')} {p + 1}</p>
        {paragraph.length > 1 && <button type="button" onClick={() => select(p, null)} aria-expanded={isSelected(p, null)} aria-controls={`reading-analysis-${p}`} className="min-h-11 text-xs font-bold underline underline-offset-4 focus-visible:outline-2">{l('Explore whole paragraph', 'Phân tích cả đoạn')}</button>}
      </div>
      {view === 'paragraphs'
        ? <button type="button" onClick={() => select(p, null)} aria-expanded={isSelected(p, null)} aria-controls={`reading-analysis-${p}`} className="w-full text-left rounded-lg px-2 py-1 hover:bg-surface/60 focus-visible:outline-2 focus-visible:outline-accent"><span lang="ja" className="jp text-lg sm:text-xl leading-[2.4] break-words">{paragraph.map((s, i) => <ReadingText key={i} text={s.jp} />)}</span></button>
        : <div className="divide-y divide-structural">{paragraph.map((sentence, i) => {
          const open = isSelected(p, i)
          const lit = !!focus && sentence.grammarIds.includes(focus)
          return <div key={i}>
            <button type="button" onClick={() => select(p, i)} aria-expanded={open} aria-controls={`reading-analysis-${p}-${i}`} className={`w-full min-h-11 text-left flex items-start gap-3 rounded-lg py-3 px-2 border-l-4 focus-visible:outline-2 focus-visible:outline-accent ${lit ? 'border-blue bg-blue/10' : 'border-transparent'} ${open ? 'bg-surface' : 'hover:bg-surface/60'}`}>
              <span lang="ja" className="jp flex-1 min-w-0 text-lg sm:text-xl leading-[2.2] break-words"><ReadingText text={sentence.jp} /></span>
              {breakdownOf(sentence) && <span className="text-blue text-xs mt-3 shrink-0" title={l('Phrase-by-phrase breakdown', 'Có phân tích từng cụm')}>◆</span>}
              <span aria-hidden="true" className="text-muted mt-2 shrink-0">{open ? '−' : '+'}</span>
            </button>
            <div id={`reading-analysis-${p}-${i}`} aria-live="polite">{open && panel(p, i)}</div>
          </div>
        })}</div>}
      <div id={`reading-analysis-${p}`} aria-live="polite">{isSelected(p, null) && panel(p, null)}</div>
    </section>)}</div>
  </div>
}

function GrammarSpotlight({ chapter, points, other, used, focus, onFocus }: { chapter: number; points: ReturnType<typeof getGrammarLinks>; other: ReturnType<typeof getGrammarLinks>; used: Map<string, number>; focus: string | null; onFocus: (id: string) => void }) {
  const { localize } = useTranslation()
  const l = (en: string, vi: string) => localize({ en, vi })
  const chip = (g: (typeof points)[number], dim: boolean) => {
    const count = used.get(g.id) ?? 0
    return <button key={g.id} type="button" disabled={!count} aria-pressed={focus === g.id} onClick={() => onFocus(g.id)} title={localize(g.meaning)} className={`min-h-11 rounded-lg border px-3 py-1 text-left text-sm disabled:opacity-45 ${focus === g.id ? 'bg-blue/20 border-blue' : 'border-structural hover:bg-surface'} ${dim ? 'text-muted' : ''}`}>
      <span className="jp font-bold">{g.pattern}</span> <span className="text-xs text-muted">{count ? l(`×${count} in this text`, `×${count} trong bài`) : l('not tagged', 'chưa gắn')}{dim && ` · ${l('Ch.', 'Bài')} ${g.chapter}`}</span>
    </button>
  }
  const active = focus ? grammar.get(focus) : undefined
  return <details className="mb-6 rounded-lg bg-surface px-4 py-3" open>
    <summary className="cursor-pointer min-h-11 flex items-center font-bold">{l(`Grammar map · Chapter ${chapter}`, `Bản đồ ngữ pháp · Bài ${chapter}`)}</summary>
    <p className="text-xs text-muted mb-3">{l('Select a pattern to highlight every sentence that uses it.', 'Chọn mẫu ngữ pháp để tô sáng các câu sử dụng nó.')}</p>
    <div className="flex flex-wrap gap-2">{points.map(g => chip(g, false))}</div>
    {!!other.length && <><p className="text-xs font-bold text-muted mt-4 mb-2">{l('Also in this text', 'Cũng xuất hiện trong bài')}</p><div className="flex flex-wrap gap-2">{other.map(g => chip(g, true))}</div></>}
    {active && <p className="text-sm mt-3" role="status"><GrammarHoverLink g={active} className="jp font-bold underline underline-offset-4">{active.pattern} ↗</GrammarHoverLink> — {localize(active.meaning)}</p>}
  </details>
}

function AnalysisPanel({ lines, whole, breakdown, dictionary }: { lines: ReadingSentence[]; whole: boolean; breakdown?: SentenceBreakdownData; dictionary: ReadingWord[] }) {
  const { localize } = useTranslation()
  const l = (en: string, vi: string) => localize({ en, vi })
  const text = lines.map(s => s.jp).join('')
  const ids = [...new Set(lines.flatMap(s => s.grammarIds))]
  return <div className="rounded-lg bg-surface p-4 sm:p-5 my-3 text-sm leading-relaxed">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3"><p className="font-bold">{whole ? l('Sentence by sentence', 'Nghĩa từng câu') : l('Meaning', 'Ý nghĩa')}</p><SpeakButton text={text} /></div>
    {whole ? <ol className="space-y-2">{lines.map((s, i) => <li key={i}><span lang="ja" className="jp text-muted block leading-loose"><ReadingText text={s.jp} /></span>{localize(s.translation)}</li>)}</ol> : <p>{localize(lines[0].translation)}</p>}
    {breakdown && <SentenceBreakdown key={`breakdown:${breakdown.sentence}`} data={breakdown} showSentence={false} />}
    {!!ids.length && <div className="mt-5 border-l-2 border-blue pl-3"><h3 className="font-bold mb-3">{l('Grammar used here', 'Ngữ pháp dùng ở đây')}</h3><div className="space-y-4">{ids.map(id => { const g = grammar.get(id); return g && <div key={id}><GrammarHoverLink g={g} className="jp font-bold underline underline-offset-4">{g.pattern} ↗</GrammarHoverLink><p className="text-xs text-muted mt-1">{g.jlptLevel ?? (g.chapter >= 16 ? 'N4' : 'N5')} · {l('Chapter', 'Bài')} {g.chapter}</p><p className="mt-1">{localize(g.meaning)}</p></div> })}</div></div>}
    <ReadingWords key={text} text={text} dictionary={dictionary} />
  </div>
}

function ReadingWords({ text, dictionary }: { text: string; dictionary: ReadingWord[] }) {
  const { localize } = useTranslation()
  const l = (en: string, vi: string) => localize({ en, vi })
  const words = useMemo(() => matchReadingWords(text, dictionary), [text, dictionary])
  const [selected, setSelected] = useState<string | null>(null)
  const active = words.find(w => w.entry.id === selected)
  return <div className="mt-5 border-l-2 border-green pl-3">
    <h3 className="font-bold mb-2">{l('Vocabulary', 'Từ vựng')}</h3>
    {!dictionary.length ? <p className="text-muted" role="status">{l('Loading vocabulary…', 'Đang tải từ vựng…')}</p> : !words.length ? <p className="text-muted">{l('No matching entry in the app dictionary for this line.', 'Chưa có mục từ phù hợp trong từ điển của ứng dụng cho dòng này.')}</p> : <>
      <p className="text-xs text-muted mb-3">{l('Select a word. Dictionary meanings are shown; the translation above gives its meaning in this passage.', 'Chọn từ để xem nghĩa từ điển. Bản dịch phía trên thể hiện nghĩa trong bài đọc.')}</p>
      <div className="flex flex-wrap gap-2">{words.map(({ entry, form }) => <button key={entry.id} type="button" aria-pressed={selected === entry.id} onClick={() => setSelected(selected === entry.id ? null : entry.id)} className={`jp min-h-11 px-3 rounded-lg border border-green/40 font-bold ${selected === entry.id ? 'bg-green/20' : 'hover:bg-green/10'}`}>{form}</button>)}</div>
      {active && <div className="mt-3 pt-3 border-t border-structural"><div className="flex items-center flex-wrap gap-3"><Furigana kanji={active.entry.kanji} kana={active.entry.kana} className="text-base font-bold" /><SpeakButton text={active.entry.kanji} /><span className="text-xs text-muted">{active.entry.jlptLevel}{active.entry.chapter && ` · ${l('Chapter', 'Bài')} ${active.entry.chapter}`}</span></div><p className="mt-2">{localize(active.entry.meanings)}</p>{active.form !== active.entry.kanji && <p className="text-xs text-muted mt-2 jp">{active.form} → {active.entry.kanji}</p>}</div>}
    </>}
  </div>
}
