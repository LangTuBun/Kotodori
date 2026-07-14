import { useMemo, useState } from "react"
import kanjiData from "@/data/n5/kanji.json"
import type { KanjiChapter, KanjiGroup } from "@/types"
import { Furigana } from "@/components/ui/Furigana"
import { cleanReadings, onkunTone } from "@/lib/kanji"
import { KanjiDrawer } from "@/components/kanji/KanjiDrawer"
import { useTranslation } from "@/lib/useTranslation"

const chapters = kanjiData.chapters as KanjiChapter[]

const ACCENTS = ['yellow', 'blue', 'red', 'green'] as const
const ACCENT_HEX: Record<string, string> = {
  yellow: 'var(--color-yellow)', blue: 'var(--color-blue)', red: 'var(--color-red)', green: 'var(--color-green)',
}
function accentFor(i: number) {
  return ACCENTS[i % ACCENTS.length]
}

export function Kanji() {
  const { t } = useTranslation()
  const [chapter, setChapter] = useState<number | null>(1)
  const [search, setSearch] = useState("")
  const [selectedAnchor, setSelectedAnchor] = useState<string | null>(null)

  const totalWords = useMemo(() => chapters.reduce((a, c) => a + c.wordCount, 0), [])

  const visibleChapters = chapter === null ? chapters : chapters.filter(c => c.chapter === chapter)

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase()
    const result: Array<{ chapterNum: number; group: KanjiGroup }> = []
    for (const c of visibleChapters) {
      for (const g of c.groups) {
        if (!q) {
          result.push({ chapterNum: c.chapter, group: g })
          continue
        }
        const hit =
          g.anchor.includes(q) ||
          g.words.some(w =>
            w.kanji.toLowerCase().includes(q) ||
            w.kana.toLowerCase().includes(q) ||
            w.meaning.toLowerCase().includes(q) ||
            w.hanviet.toLowerCase().includes(q)
          )
        if (hit) result.push({ chapterNum: c.chapter, group: g })
      }
    }
    return result
  }, [visibleChapters, search])

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b-3 border-ink flex gap-3 bg-surface flex-wrap items-center">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('kanji.searchPlaceholder')}
            className="flex-1 min-w-[200px] px-4 py-2 border-3 border-ink font-bold text-sm bg-paper focus:outline-none"
          />
          <div className="w-full text-xs font-bold uppercase tracking-wider text-muted">
            {t('common.wordsCount', { n: chapter === null ? totalWords : (visibleChapters[0]?.wordCount ?? 0) })} · {t('kanji.groupsCount', { n: filteredGroups.length })}
          </div>
        </div>

        {/* Chapter chips */}
        <div className="px-4 py-3 border-b-3 border-ink bg-paper flex gap-2 flex-wrap">
          <button
            onClick={() => setChapter(null)}
            className={`px-3 py-1.5 border-2 border-ink rounded-[var(--radius-sm)] font-black text-xs cursor-pointer transition-all ${chapter === null ? 'bg-ink text-paper' : 'hover:bg-surface'}`}
          >
            {t('common.all')}
          </button>
          {chapters.map(c => (
            <button
              key={c.chapter}
              onClick={() => setChapter(prev => prev === c.chapter ? null : c.chapter)}
              className={`px-3 py-1.5 border-2 border-ink rounded-[var(--radius-sm)] font-black text-xs cursor-pointer transition-all ${chapter === c.chapter ? 'bg-ink text-paper' : 'hover:bg-surface'}`}
            >
              {t('common.chapterN', { n: c.chapter })} <span className="opacity-60">({c.wordCount})</span>
            </button>
          ))}
        </div>

        {/* Groups grid */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-10">
          {filteredGroups.length === 0 && (
            <div className="text-center text-muted py-12 font-bold">{t('kanji.noResults')}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredGroups.map(({ chapterNum, group }, i) => (
              <KanjiGroupCard
                key={group.id}
                group={group}
                chapterNum={chapterNum}
                accent={accentFor(i)}
                onAnchorClick={() => setSelectedAnchor(group.anchor)}
              />
            ))}
          </div>
        </div>
      </div>

      <KanjiDrawer char={selectedAnchor} onClose={() => setSelectedAnchor(null)} />
    </div>
  )
}

function KanjiGroupCard({ group, chapterNum, accent, onAnchorClick }: { group: KanjiGroup; chapterNum: number; accent: string; onAnchorClick: () => void }) {
  const { t } = useTranslation()
  const on = cleanReadings(group.onyomi)
  const kun = cleanReadings(group.kunyomi)

  return (
    <div
      className="bg-paper border-3 border-ink p-3"
      style={{ borderLeftWidth: '6px', borderLeftColor: ACCENT_HEX[accent] }}
    >
      {/* Header: leading kanji */}
      <div className="flex items-start gap-3 mb-2 pb-2 border-b-2 border-ink/10">
        <button
          onClick={onAnchorClick}
          title={t('kanji.viewStrokeAnim')}
          className="appearance-none bg-transparent border-0 p-0 m-0 text-4xl font-black jp leading-none shrink-0 pt-0.5 cursor-pointer transition-transform hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-ink/40 rounded-sm"
        >
          {group.anchor}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            {group.hanviet && (
              <span className="text-xs font-black px-1.5 py-0.5 border-2 border-ink rounded-[var(--radius-sm)] bg-surface shrink-0">{group.hanviet}</span>
            )}
            <span className="text-[10px] font-bold text-muted shrink-0">Ch.{chapterNum}</span>
          </div>

          {/* Real On'yomi / Kun'yomi kana readings */}
          <div className="flex flex-wrap items-center gap-1 mt-1.5">
            {on.shown.length > 0 && (
              <span className="text-[9px] font-black uppercase tracking-wider text-blue/70">On</span>
            )}
            {on.shown.map(r => (
              <span key={`on-${r}`} className="jp text-[11px] font-bold px-1.5 py-0.5 border border-blue/30 bg-blue/10 text-blue">
                {r}
              </span>
            ))}
            {on.extra > 0 && <span className="text-[10px] text-muted">+{on.extra}</span>}

            {kun.shown.length > 0 && (
              <span className="text-[9px] font-black uppercase tracking-wider text-green/70 ml-1">Kun</span>
            )}
            {kun.shown.map(r => (
              <span key={`kun-${r}`} className="jp text-[11px] font-bold px-1.5 py-0.5 border border-green/30 bg-green/10 text-green">
                {r}
              </span>
            ))}
            {kun.extra > 0 && <span className="text-[10px] text-muted">+{kun.extra}</span>}

            {on.shown.length === 0 && kun.shown.length === 0 && (
              <span className="text-[10px] text-muted italic">{t('kanji.unknownReading')}</span>
            )}
          </div>

          {group.meaning && (
            <div className="text-sm text-muted mt-1">{group.meaning}</div>
          )}
        </div>
      </div>

      {/* Words containing the leading kanji */}
      <ul className="space-y-1.5">
        {group.words.map((w, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="jp font-bold leading-snug shrink-0 min-w-[3.5rem]">
              <Furigana kanji={w.kanji} kana={w.kana} />
            </span>
            <span className="flex-1 min-w-0 leading-snug">
              <span>{w.meaning}</span>
              <span className="text-muted text-xs ml-1.5">({w.hanviet})</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider shrink-0 pt-0.5" style={{ color: onkunTone(w.onkun) }}>
              {w.onkun}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
