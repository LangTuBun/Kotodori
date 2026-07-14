import { useState, useMemo } from "react"
import vocabData from "@/data/n5/vocabulary.json"
import type { VocabEntry } from "@/types"
import { Furigana } from "@/components/ui/Furigana"
import { PosTag } from "@/components/ui/PosTag"
import { Button } from "@/components/ui/Button"
import { useVocabStore } from "@/store/vocab-store"
import { RATING } from "@/lib/srs"
import { useTranslation } from "@/lib/useTranslation"

const vocab = vocabData as VocabEntry[]
const CHAPTERS = Array.from(new Set(vocab.map(v => v.chapter).filter(Boolean))).sort((a,b) => a-b)
const POS_LIST = Array.from(new Set(vocab.map(v => v.pos))).sort()

export function VocabBrowser() {
  const [search, setSearch] = useState("")
  const [chapter, setChapter] = useState<number | null>(null)
  const [pos, setPos] = useState<string | null>(null)
  const [selected, setSelected] = useState<VocabEntry | null>(null)
  const { getCard, reviewCard } = useVocabStore()
  const { t, localize } = useTranslation()

  const filtered = useMemo(() => {
    return vocab.filter(v => {
      if (chapter !== null && v.chapter !== chapter) return false
      if (pos !== null && v.pos !== pos) return false
      if (search) {
        const q = search.toLowerCase()
        return v.kanji.includes(q) || v.kana.includes(q) || localize(v.meanings).toLowerCase().includes(q)
      }
      return true
    })
  }, [search, chapter, pos])

  const groupedByChapter = useMemo(() => {
    const map = new Map<number, VocabEntry[]>()
    for (const v of filtered) {
      if (!map.has(v.chapter)) map.set(v.chapter, [])
      map.get(v.chapter)!.push(v)
    }
    return [...map.entries()].sort(([a], [b]) => {
      if (a === 0) return 1
      if (b === 0) return -1
      return a - b
    })
  }, [filtered])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* List panel */}
      <div className="flex-1 flex flex-col overflow-hidden border-r-3 border-ink">
        {/* Toolbar */}
        <div className="p-4 border-b-3 border-ink flex gap-3 flex-wrap bg-surface">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('vocab.searchPlaceholder')}
            className="flex-1 min-w-[200px] px-4 py-2 border-3 border-ink font-sans font-bold text-sm bg-paper focus:outline-none focus:shadow-[2px_2px_0px_var(--color-blue)]"
          />
          <select
            value={chapter ?? ""}
            onChange={e => setChapter(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 border-3 border-ink font-bold text-sm bg-paper cursor-pointer"
          >
            <option value="">{t('vocab.allChapters')}</option>
            {CHAPTERS.map(c => <option key={c} value={c}>{t('common.chapterN', { n: c })}</option>)}
          </select>
          <select
            value={pos ?? ""}
            onChange={e => setPos(e.target.value || null)}
            className="px-3 py-2 border-3 border-ink font-bold text-sm bg-paper cursor-pointer"
          >
            <option value="">{t('vocab.allPos')}</option>
            {POS_LIST.map(p => <option key={p} value={p}>{t(`pos.${p}`)}</option>)}
          </select>
        </div>

        {/* Count */}
        <div className="px-4 py-2 border-b-3 border-ink bg-paper text-xs font-bold uppercase tracking-wider text-muted">
          {t('common.wordsCount', { n: filtered.length })}
        </div>

        {/* Word list, grouped and sorted by chapter */}
        <div className="flex-1 overflow-y-auto">
          {groupedByChapter.map(([chapterNum, items]) => (
            <div key={chapterNum}>
              <div className="sticky top-0 z-10 px-4 py-1.5 bg-ink text-paper text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <span>{chapterNum === 0 ? t('vocab.unknownChapter') : t('common.chapterN', { n: chapterNum })}</span>
                <span className="text-paper/60 font-bold">{items.length}</span>
              </div>
              {items.map(v => {
                const card = getCard(v.id)
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelected(v)}
                    className={`w-full text-left px-4 py-3 border-b border-ink/20 flex items-center gap-4 hover:bg-surface transition-colors ${selected?.id === v.id ? 'bg-ink text-paper' : ''}`}
                  >
                    <div className="flex-1">
                      <div className="font-bold text-lg jp leading-tight">
                        <Furigana kanji={v.kanji} kana={v.kana} />
                      </div>
                      <div className={`text-xs mt-0.5 ${selected?.id === v.id ? 'text-paper/70' : 'text-muted'}`}>
                        {localize(v.meanings).slice(0, 60)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <PosTag pos={v.pos} verbGroup={v.verbGroup} />
                      {card.state !== 'new' && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 border border-current ${
                          card.state === 'mastered' ? 'text-green' :
                          card.state === 'review' ? 'text-yellow' :
                          card.state === 'learning' ? 'text-blue' : 'text-muted'
                        }`}>
                          {card.state}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected ? (
        <VocabDetail vocab={selected} onClose={() => setSelected(null)} reviewCard={reviewCard} getCard={getCard} />
      ) : (
        <div className="w-80 hidden lg:flex items-center justify-center text-muted">
          <div className="text-center p-8">
            <div className="text-6xl jp mb-4">言</div>
            <div className="font-bold text-sm uppercase tracking-wider">{t('vocab.selectWord')}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function VocabDetail({ vocab, onClose, reviewCard, getCard }: {
  vocab: VocabEntry
  onClose: () => void
  reviewCard: (id: string, cardType: string, rating: number) => void
  getCard: (id: string) => any
}) {
  const card = getCard(vocab.id)
  const { t, localize } = useTranslation()

  return (
    <div className="w-96 flex-shrink-0 overflow-y-auto bg-paper">
      {/* Header */}
      <div className="p-6 border-b-3 border-ink">
        <div className="flex justify-between items-start mb-4">
          <PosTag pos={vocab.pos} verbGroup={vocab.verbGroup} />
          <button onClick={onClose} className="font-black text-lg hover:text-red transition-colors">×</button>
        </div>
        <div className="text-5xl font-black jp leading-none mb-3">
          <Furigana kanji={vocab.kanji} kana={vocab.kana} />
        </div>
        {vocab.kanji !== vocab.kana && vocab.kana && (
          <div className="text-xl jp text-muted font-bold">{vocab.kana}</div>
        )}
        <div className="font-bold text-lg mt-3">{localize(vocab.meanings)}</div>
        {vocab.chapter > 0 && (
          <div className="text-xs text-muted uppercase tracking-wider mt-2 font-bold">{t('common.chapterN', { n: vocab.chapter })}</div>
        )}
      </div>

      {/* SRS actions */}
      <div className="p-6 border-b-3 border-ink">
        <div className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
          {card.state !== 'new' ? t('vocab.stateReviews', { state: card.state, count: card.reviewCount }) : t('vocab.notStudied')}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { labelKey: 'again', rating: RATING.AGAIN, color: 'red' },
            { labelKey: 'hard', rating: RATING.HARD, color: 'secondary' },
            { labelKey: 'good', rating: RATING.GOOD, color: 'green' },
            { labelKey: 'easy', rating: RATING.EASY, color: 'yellow' },
          ].map(({ labelKey, rating, color }) => (
            <Button
              key={labelKey}
              variant={color as any}
              size="sm"
              className="text-xs"
              onClick={() => reviewCard(vocab.id, 'word', rating)}
            >
              {t(`review.rating.${labelKey}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Examples */}
      {vocab.examples.length > 0 && (
        <div className="p-6 border-b-3 border-ink">
          <div className="text-xs font-black uppercase tracking-wider mb-4">{t('common.examples')}</div>
          {vocab.examples.map((ex, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="jp font-bold text-base">{ex.ja}</div>
              {ex.kana && <div className="jp text-xs text-muted mt-0.5">{ex.kana}</div>}
              <div className="text-sm text-muted mt-1">{localize({ vi: ex.vi, en: ex.en })}</div>
            </div>
          ))}
        </div>
      )}

      {/* Homophones */}
      {vocab.homophones.length > 0 && (
        <div className="p-6">
          <div className="text-xs font-black uppercase tracking-wider mb-3">{t('vocab.homophones')}</div>
          <div className="flex flex-wrap gap-2">
            {vocab.homophones.map(id => {
              const hw = (vocabData as VocabEntry[]).find(v => v.id === id)
              if (!hw) return null
              return (
                <div key={id} className="border-3 border-ink px-3 py-1 shadow-[2px_2px_0px_var(--color-ink)]">
                  <div className="font-bold"><Furigana kanji={hw.kanji || hw.kana} kana={hw.kana} /></div>
                  <div className="text-xs text-muted">{localize(hw.meanings).slice(0, 20)}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
